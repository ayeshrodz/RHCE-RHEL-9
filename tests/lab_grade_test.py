"""Exercise every check against passing, broken and unavailable host responses."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('grade', ROOT / 'public/lab/grade.py')
grader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(grader)
CATALOG = json.loads((ROOT / 'public/lab/graders.json').read_text())

class GradingTests(unittest.TestCase):
    def test_catalog_covers_every_manifest(self):
        names = {p.parent.name for p in (ROOT / 'public/lab').glob('*/MANIFEST')}
        self.assertEqual(names, set(CATALOG['exercises']))
        for name, exercise in CATALOG['exercises'].items():
            self.assertTrue(exercise['lesson'].startswith('#/ch'))
            self.assertIn('final', exercise['checkpoints'])
            for checkpoint in exercise['checkpoints'].values():
                self.assertTrue(checkpoint['files'] or checkpoint['probes'] or checkpoint.get('groups'))
                self.assertEqual(len(checkpoint['probes']), len({p['id'] for p in checkpoint['probes']}))
                for probe in checkpoint['probes']:
                    self.assertNotRegex(probe['command'], r'\b(reboot|rm|touch|mkdir|chmod|usermod|mount|mkfs|lvcreate)\b|systemctl (restart|stop|start)|firewall-cmd --add')

    def test_all_checkpoints_working_broken_and_unreachable(self):
        for name, exercise in CATALOG['exercises'].items():
            for cp_id, cp in exercise['checkpoints'].items():
                with self.subTest(exercise=name, checkpoint=cp_id), tempfile.TemporaryDirectory() as temp:
                    project = Path(temp)
                    for file in cp['files'] + [cp.get('inventory', 'inventory')]:
                        p = project / file; p.parent.mkdir(parents=True, exist_ok=True); p.write_text('fixture\n')
                    for c in cp.get('local', []):
                        p = project / c['file']; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(c.get('contains', 'fixture'))
                        if 'mode' in c: p.chmod(int(c['mode'], 8))
                    def runner_for(state):
                        def runner(args, cwd):
                            if args[0] == 'ansible-inventory':
                                inventory = {g: {'hosts': hs} for g, hs in cp.get('groups', {}).items()}
                                return subprocess.CompletedProcess(args, 0, json.dumps(inventory), '')
                            tree = Path(args[args.index('--tree') + 1])
                            data = {'unreachable': True} if state == 'unreachable' else {'rc': 0 if state == 'pass' else 1}
                            probe = next(p for p in cp['probes'] if '( ' + p['command'] + ' )' == args[args.index('-a') + 1])
                            for host in probe['targets']:
                                (tree / host).write_text(json.dumps(data))
                            return subprocess.CompletedProcess(args, 4 if state == 'unreachable' else 0 if state == 'pass' else 2, '', '')
                        return runner
                    report, code = grader.grade(name, cp_id, project, CATALOG, runner_for('pass'))
                    self.assertEqual(code, 0, report)
                    self.assertEqual(report['app'], 'kernel-path-lab')
                    self.assertTrue(all(c['status'] == 'pass' for c in report['checks']))
                    if cp['probes']:
                        _, code = grader.grade(name, cp_id, project, CATALOG, runner_for('broken')); self.assertEqual(code, 1)
                        _, code = grader.grade(name, cp_id, project, CATALOG, runner_for('unreachable')); self.assertEqual(code, 2)
                    if cp['files']:
                        (project / cp['files'][0]).unlink()
                        _, code = grader.grade(name, cp_id, project, CATALOG, runner_for('pass')); self.assertEqual(code, 1)

    def test_cyclic_group_resolution(self):
        with self.assertRaises(ValueError): grader.inventory_members({'a': {'children': ['b']}, 'b': {'children': ['a']}}, 'a')

    def test_release_brand_compatibility_keeps_identity_and_permission_checks(self):
        probes = {p['id']: p['command'] for p in CATALOG['exercises']['assessment-release']['checkpoints']['final']['probes']}
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); binaries = root / 'bin'; binaries.mkdir()
            # Synthetic HTTP and ownership responses; grep, mode checks and shell logic run for real.
            curl = binaries / 'curl'; curl.write_text('#!/bin/sh\ncat "$KP_HTTP_BODY"\n'); curl.chmod(0o755)
            stat = binaries / 'stat'; stat.write_text('#!/bin/sh\nmode=$(/usr/bin/stat -c %a "$3") || exit 1\nprintf "%s:%s\\n" "$mode" "$KP_TOKEN_OWNER"\n'); stat.chmod(0o755)
            body = root / 'page.html'
            env = {**os.environ, 'PATH': str(binaries) + os.pathsep + os.environ['PATH'], 'KP_HTTP_BODY': str(body)}
            for page, valid in [
                ('Kernel Path release-2 on serverb.lab.example.com', True),
                ('Playbook Path release-2 on serverb.lab.example.com', True),
                ('Kernel Path release-1 on serverb.lab.example.com', False),
                ('Kernel Path release-2 on servera.lab.example.com', False),
            ]:
                with self.subTest(page=page):
                    body.write_text(page + '\n')
                    result = subprocess.run(['bash', '-c', probes['http']], env=env, capture_output=True)
                    self.assertEqual(result.returncode == 0, valid)
            token_paths = [root / 'current-token', root / 'legacy-token']
            command = probes['token'].replace('/etc/kernel-path/release-token', str(token_paths[0])).replace('/etc/playbook-path/release-token', str(token_paths[1]))
            for path in token_paths:
                for mode, owner, content, valid in [
                    (0o600, 'root:root', 'practice-only\n', True),
                    (0o644, 'root:root', 'practice-only\n', False),
                    (0o600, 'student:student', 'practice-only\n', False),
                    (0o600, 'root:root', '', False),
                ]:
                    with self.subTest(path=path.name, mode=mode, owner=owner, content=content):
                        path.write_text(content); path.chmod(mode)
                        result = subprocess.run(['bash', '-c', command], env={**env, 'KP_TOKEN_OWNER': owner}, capture_output=True)
                        self.assertEqual(result.returncode == 0, valid)
                        path.unlink()
            self.assertNotEqual(subprocess.run(['bash', '-c', command], env=env, capture_output=True).returncode, 0)

if __name__ == '__main__': unittest.main()
