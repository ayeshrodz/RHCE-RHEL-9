#!/usr/bin/env python3
"""Read-only exercise checks. Uses Ansible's own inventory and connection settings."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile
from datetime import datetime, timezone


def run(args, cwd, timeout=90):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True, timeout=timeout,
                          env={**os.environ, 'ANSIBLE_NOCOLOR': '1', 'ANSIBLE_HOST_KEY_CHECKING': 'True'})


def result(check_id, status, message, lesson):
    return dict(id=check_id, status=status, message=message, lesson=lesson)


def inventory_members(inventory, group, ancestors=None):
    ancestors = set() if ancestors is None else ancestors
    if group in ancestors:
        raise ValueError('Inventory contains a cyclic group')
    node = inventory.get(group, {})
    hosts = set(node.get('hosts', []))
    for child in node.get('children', []):
        hosts.update(inventory_members(inventory, child, ancestors | {group}))
    return hosts


def grade(exercise_id, checkpoint_id, project, catalog, runner=run):
    exercise = catalog['exercises'][exercise_id]
    cp = exercise['checkpoints'][checkpoint_id]
    lesson = exercise['lesson']
    checks = []
    def add(cid, status, message):
        checks.append(result(cid, status, message, lesson))
    for filename in cp['files']:
        file = project / filename
        good = file.is_file() and file.stat().st_size > 0
        add('file:' + filename, 'pass' if good else 'fail', f'{filename}: ' + ('present' if good else 'missing or empty'))
    for check in cp.get('local', []):
        file = project / check['file']
        good = file.is_file() and file.stat().st_size > 0
        if good and 'contains' in check:
            good = check['contains'] in file.read_text(errors='replace')
        if good and 'mode' in check:
            good = (file.stat().st_mode & 0o777) == int(check['mode'], 8)
        add(check['id'], 'pass' if good else 'fail', f"{check['file']}: expected file, content and permissions")
    inventory_file = cp.get('inventory', 'inventory')
    inv = None
    environment_problem = False
    if cp.get('groups') or any(p['hosts'] != 'localhost' for p in cp['probes']):
        if not (project / inventory_file).is_file():
            add('inventory', 'fail', f'{inventory_file} is missing; host checks cannot run')
        else:
            try:
                resolved = runner(['ansible-inventory', '-i', inventory_file, '--list'], project)
                inv = json.loads(resolved.stdout) if resolved.returncode == 0 else None
                if inv is None:
                    environment_problem = True
                    add('inventory', 'skip', 'Inventory could not be resolved; check Ansible and inventory syntax')
            except (OSError, subprocess.TimeoutExpired, ValueError):
                environment_problem = True
                add('inventory', 'skip', 'Inventory could not be resolved; check Ansible and inventory syntax')
    for group, expected in cp.get('groups', {}).items():
        if inv is None:
            add('group:' + group, 'skip', 'Inventory unavailable')
            continue
        try:
            actual = inventory_members(inv, group)
            good = actual == set(expected)
            add('group:' + group, 'pass' if good else 'fail', f'{group}: expected ' + ', '.join(expected) + '; found ' + ', '.join(sorted(actual)))
        except ValueError as error:
            add('group:' + group, 'fail', str(error))
    for probe in cp['probes']:
        if probe['hosts'] != 'localhost' and inv is None:
            add(probe['id'], 'skip', probe['message'] + '; inventory unavailable')
            continue
        with tempfile.TemporaryDirectory(prefix='kernel-path-grade-') as tree:
            # raw bypasses Python module transfer. Probes are maintained read-only commands;
            # grading never runs a learner's playbook, restarts a service or repairs state.
            command = '( ' + probe['command'] + ' )'
            args = ['ansible', probe['hosts'], '-i', 'localhost,' if probe['hosts'] == 'localhost' else inventory_file,
                    '-m', 'ansible.builtin.raw', '-a', command, '--tree', tree,
                    '-e', 'ansible_become_ask_pass=false', '-e', 'ansible_ssh_timeout=10']
            if probe['hosts'] == 'localhost':
                args += ['-c', 'local', '-e', 'ansible_become=false']
            else:
                args += ['-b']
            try:
                executed = runner(args, project)
                reports = sorted(Path(tree).iterdir())
                if not reports:
                    environment_problem = environment_problem or executed.returncode != 0
                    add(probe['id'], 'skip' if executed.returncode else 'fail', probe['message'] + '; no hosts matched or connection/tooling unavailable')
                    continue
                returned = {p.name for p in reports}
                for missing in sorted(set(probe['targets']) - returned):
                    add(probe['id'] + ':' + missing, 'fail', missing + ': required host was not checked; restore its inventory membership')
                for report in reports:
                    data = json.loads(report.read_text())
                    if data.get('unreachable') or 'rc' not in data:
                        status = 'skip'
                        environment_problem = True
                        message = 'Connection or execution problem; check SSH, sudo and host readiness'
                    else:
                        status = 'pass' if data['rc'] == 0 else 'fail'
                        message = probe['message']
                    add(probe['id'] + ':' + report.name, status, report.name + ': ' + message)
                if executed.returncode not in (0, 2) and all(c['status'] != 'skip' for c in checks):
                    environment_problem = True
                    add(probe['id'] + ':execution', 'skip', 'Ansible reported an execution problem')
            except (OSError, subprocess.TimeoutExpired, ValueError) as error:
                environment_problem = True
                add(probe['id'], 'skip', probe['message'] + '; ' + type(error).__name__)
    code = 2 if environment_problem else 1 if any(c['status'] == 'fail' for c in checks) else 0
    return dict(app='kernel-path-lab', version=1, exerciseId=exercise_id,
                exerciseVersion=exercise['version'], checkpointId=checkpoint_id,
                checkedAt=datetime.now(timezone.utc).isoformat(), checks=checks), code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('name')
    parser.add_argument('--checkpoint', default='final')
    parser.add_argument('--json', action='store_true')
    parser.add_argument('--catalog', type=Path, required=True)
    parser.add_argument('--project', type=Path)
    args = parser.parse_args()
    try:
        catalog = json.loads(args.catalog.read_text())
        if catalog['version'] != 1 or args.name not in catalog['exercises']:
            raise ValueError('Unknown exercise or unsupported catalog')
        exercise = catalog['exercises'][args.name]
        if args.checkpoint not in exercise['checkpoints']:
            raise ValueError('Unknown checkpoint; choose ' + ', '.join(exercise['checkpoints']))
        project = args.project or Path.home() / args.name
        if not project.is_dir() and args.name != 'intro-install':
            raise ValueError('Project directory missing; start the exercise first')
        report, code = grade(args.name, args.checkpoint, project if project.is_dir() else Path.home(), catalog)
    except (OSError, ValueError, KeyError) as error:
        parser.exit(2, str(error) + '\n')
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"{args.name} / {args.checkpoint} — read-only checks")
        for check in report['checks']:
            print(f"{check['status'].upper():4} {check['message']}\n     Review: {check['lesson']}")
        print('Run your playbook again to check repeatability. Perform any requested reboot check yourself.')
    return code

if __name__ == '__main__':
    raise SystemExit(main())
