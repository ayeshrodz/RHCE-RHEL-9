"""Exercise every check against passing, broken and unavailable host responses, and check the scripts it builds."""
import base64
import json
import getpass
import os
import time
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from support import ROOT, catalog, lab_tree
import grade

CATALOG = catalog()


def all_checks():
    for name, exercise in CATALOG['exercises'].items():
        for cp_id, cp in exercise['checkpoints'].items():
            for check in cp.get('checks', []):
                yield name, cp_id, cp, check


class CatalogTests(unittest.TestCase):
    def test_every_exercise_has_a_manifest_and_a_final_checkpoint(self):
        tree = lab_tree()
        names = {p.parent.name for p in tree.glob('*/MANIFEST')}
        self.assertEqual(names, set(CATALOG['exercises']))
        for name, exercise in CATALOG['exercises'].items():
            self.assertTrue(exercise['lesson'].startswith('#/ch'))
            self.assertIn('final', exercise['checkpoints'])

    def test_checks_are_unique_and_host_checks_name_their_hosts(self):
        for name, exercise in CATALOG['exercises'].items():
            for cp_id, cp in exercise['checkpoints'].items():
                ids = [c['id'] for c in cp.get('checks', [])]
                self.assertEqual(len(ids), len(set(ids)), (name, cp_id))
                for check in cp.get('checks', []):
                    if check['on'] != 'control':
                        self.assertTrue(check['targets'], (name, check['id']))

    def test_every_host_script_is_valid_bash_and_read_only(self):
        forbidden = re.compile(r'(?<![\w./-])(reboot|rm|touch|mkdir|chmod|chown|usermod|useradd|mount|umount|mkfs|lvcreate|dnf|yum|sed -i|tee)\b|'
                               r'systemctl (restart|stop|start|enable|disable)|firewall-cmd --add|>\s*/(?!dev/null)')
        for name, cp_id, _, check in all_checks():
            if check['on'] == 'control':
                continue
            script = grade.host_script(check)
            unquoted = re.sub(r"'[^']*'", "''", script)  # values inside quotes are data, not commands
            self.assertIsNone(forbidden.search(unquoted), (name, check['id'], script))
            self.assertEqual(subprocess.run(['bash', '-n'], input=script, text=True, capture_output=True).returncode, 0, script)


class ScriptTests(unittest.TestCase):
    """Run generated file conditions for real, in a temporary directory."""

    def run_script(self, check, host='servera.lab.example.com'):
        return subprocess.run(['bash', '-c', grade.host_script(check)], env={**os.environ, 'H': host, 'HS': host.split('.')[0]}).returncode

    def test_file_conditions(self):
        with tempfile.TemporaryDirectory() as temp:
            f = Path(temp) / 'motd'
            f.write_text('Welcome to servera\nServerTokens Prod\n')
            f.chmod(0o644)
            base = {'kind': 'file', 'paths': [str(f)]}
            ok = [{'nonEmpty': True}, {'contains': ['{hostShort}']}, {'lacks': ['{{']}, {'line': 'ServerTokens Prod'}, {'lines': ['ServerTokens Prod']},
                  {'matches': '^Welcome to'}, {'mode': '0644'}, {'exists': True}]
            bad = [{'contains': ['serverz']}, {'lacks': ['servera']}, {'line': 'ServerTokens'}, {'matches': '^Goodbye'}, {'mode': '0600'},
                   {'exists': False}, {'symlinkTo': '/etc/issue'}]
            for extra in ok:
                self.assertEqual(self.run_script({**base, **extra}), 0, extra)
            for extra in bad:
                self.assertNotEqual(self.run_script({**base, **extra}), 0, extra)
            self.assertEqual(self.run_script({'kind': 'file', 'paths': [str(Path(temp) / 'missing'), str(f)], 'nonEmpty': True}), 0, 'any listed path may satisfy')
            self.assertEqual(self.run_script({'kind': 'file', 'paths': [str(Path(temp) / 'missing')], 'exists': False}), 0)
            link = Path(temp) / 'issue.net'
            link.symlink_to('/etc/issue')
            self.assertEqual(self.run_script({'kind': 'file', 'paths': [str(link)], 'symlinkTo': '/etc/issue'}), 0)

    def test_link_and_type_conditions_on_hosts_and_the_control_node(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'dir').mkdir()
            original = root / 'dir' / 'original.txt'
            original.write_text('data\n')
            hard = root / 'hard.txt'
            os.link(original, hard)
            (root / 'relative').symlink_to('dir')
            (root / 'other.txt').write_text('data\n')
            cases = [
                ({'paths': ['hard.txt'], 'fileType': 'regular', 'hardLinks': 2, 'sameFileAs': 'dir/original.txt'}, True),
                ({'paths': ['other.txt'], 'sameFileAs': 'dir/original.txt'}, False),
                ({'paths': ['other.txt'], 'hardLinks': 2}, False),
                ({'paths': ['relative'], 'fileType': 'symlink', 'resolvesTo': 'dir'}, True),
                ({'paths': ['relative'], 'fileType': 'directory'}, False),
                ({'paths': ['dir'], 'fileType': 'directory'}, True),
                ({'paths': ['dir'], 'resolvesTo': 'other.txt'}, False),
            ]
            for check, expected in cases:
                self.assertEqual(grade.control_file({'kind': 'file', **check}, root), expected, check)
                host = {**check, 'paths': [str(root / check['paths'][0])]}
                for key in ('sameFileAs', 'resolvesTo'):
                    if key in host:
                        host[key] = str(root / host[key])
                self.assertEqual(self.run_script({'kind': 'file', **host}) == 0, expected, host)

    def test_process_conditions_follow_nice_state_and_user(self):
        import signal
        child = subprocess.Popen(['nice', '-n', '7', 'sleep', '4322'])
        try:
            time.sleep(0.5)
            user = getpass.getuser()
            for check, expected in (({'pattern': '^sleep 4322$'}, True), ({'pattern': '^sleep 4322$', 'nice': 7, 'user': user}, True),
                                    ({'pattern': '^sleep 4322$', 'nice': 5}, False), ({'pattern': '^sleep 4322$', 'state': 'S'}, True),
                                    ({'pattern': '^sleep 4322$', 'state': 'T'}, False), ({'pattern': '^sleep 4322$', 'user': 'root' if user != 'root' else 'nobody'}, False),
                                    ({'pattern': '^sleep 4322$', 'running': False}, False)):
                self.assertEqual(self.run_script({'kind': 'process', **check}) == 0, expected, check)
            child.send_signal(signal.SIGSTOP)
            time.sleep(0.3)
            self.assertEqual(self.run_script({'kind': 'process', 'pattern': '^sleep 4322$', 'state': 'T'}), 0)
        finally:
            child.kill()
            child.wait()

    def test_archive_members_and_checksum_lists(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'src').mkdir()
            (root / 'src' / 'a.txt').write_text('alpha\n')
            (root / 'src' / 'b.txt').write_text('beta\n')
            archive = root / 'src.tar.gz'
            subprocess.run(['tar', '-czf', str(archive), '-C', str(root), 'src'], check=True)
            sums = root / 'src.sha256'
            sums.write_text(subprocess.run(['sha256sum', 'src.tar.gz'], cwd=root, capture_output=True, text=True).stdout)
            cases = [
                ({'kind': 'archive', 'path': str(archive), 'members': ['src/a.txt', 'src/b.txt']}, True),
                ({'kind': 'archive', 'path': str(archive), 'members': ['/src/a.txt']}, False),
                ({'kind': 'archive', 'path': str(archive), 'absentMembers': ['src/c.txt']}, True),
                ({'kind': 'archive', 'path': str(archive), 'absentMembers': ['src/a.txt']}, False),
                ({'kind': 'file', 'paths': [str(sums)], 'checksumsVerify': True}, True),
            ]
            for check, expected in cases:
                self.assertEqual(self.run_script(check) == 0, expected, check)
            archive.write_bytes(b'corrupt')
            self.assertNotEqual(self.run_script({'kind': 'file', 'paths': [str(sums)], 'checksumsVerify': True}), 0)

    def test_scripts_are_run_and_judged_by_exit_status_and_output(self):
        with tempfile.TemporaryDirectory() as temp:
            script = Path(temp) / 'count.sh'
            script.write_text('#!/bin/bash\n[ -d "$1" ] || { echo "not a directory: $1" >&2; exit 1; }\necho "Files: $(ls "$1" | wc -l)"\n')
            script.chmod(0o755)
            (Path(temp) / 'one').write_text('x')
            ok = {'kind': 'file', 'paths': [str(script)], 'runs': [{'args': [temp], 'output': '^Files: 2$'}, {'args': ['/nonexistent'], 'exitCode': 1, 'output': 'not a directory'}]}
            self.assertEqual(self.run_script(ok), 0)
            for bad in ({'args': [temp], 'output': '^Files: 9$'}, {'args': ['/nonexistent'], 'exitCode': 0}, {'args': [temp], 'exitCode': 3}):
                self.assertNotEqual(self.run_script({'kind': 'file', 'paths': [str(script)], 'runs': [bad]}), 0, bad)

    def test_selinux_booleans_ports_and_file_contexts_come_from_the_policy_tools(self):
        with tempfile.TemporaryDirectory() as temp:
            bin_dir = Path(temp) / 'bin'
            bin_dir.mkdir()
            (bin_dir / 'getsebool').write_text('#!/bin/sh\nif [ "$1" = web_flag ]; then echo "web_flag --> on"; else echo "$1 --> off"; fi\n')
            (bin_dir / 'semanage').write_text('''#!/bin/sh
case "$1 $2" in
  "boolean -l") printf 'SELinux boolean State Default Description\\nweb_flag (on , on) Allow the web\\nother_flag (off , off) Another\\n' ;;
  "port -l") printf 'http_port_t tcp 82, 80, 81\\nssh_port_t tcp 22\\n' ;;
  "fcontext -l") printf '/srv/web(/.*)? all files system_u:object_r:httpd_sys_content_t:s0\\n' ;;
esac
''')
            for f in bin_dir.iterdir():
                f.chmod(0o755)
            old = os.environ['PATH']
            os.environ['PATH'] = '%s:%s' % (bin_dir, old)
            try:
                cases = [
                    ({'kind': 'selinux-boolean', 'name': 'web_flag', 'value': True}, True),
                    ({'kind': 'selinux-boolean', 'name': 'web_flag', 'value': False}, False),
                    ({'kind': 'selinux-boolean', 'name': 'other_flag', 'value': False}, True),
                    ({'kind': 'selinux-port', 'type': 'http_port_t', 'proto': 'tcp', 'port': 82}, True),
                    ({'kind': 'selinux-port', 'type': 'http_port_t', 'proto': 'tcp', 'port': 8080}, False),
                    ({'kind': 'selinux-port', 'type': 'ssh_port_t', 'proto': 'tcp', 'port': 82}, False),
                    ({'kind': 'selinux-fcontext', 'path': '/srv/web(/.*)?', 'type': 'httpd_sys_content_t'}, True),
                    ({'kind': 'selinux-fcontext', 'path': '/srv/web(/.*)?', 'type': 'var_t'}, False),
                ]
                for check, expected in cases:
                    self.assertEqual(self.run_script(check) == 0, expected, check)
            finally:
                os.environ['PATH'] = old

    def test_acl_entries_are_matched_exactly_ignoring_effective_comments(self):
        with tempfile.TemporaryDirectory() as temp:
            bin_dir = Path(temp) / 'bin'
            bin_dir.mkdir()
            fake = bin_dir / 'getfacl'
            fake.write_text('#!/bin/sh\nprintf "user::rw-\\nuser:auditor:rw-\\t\\t#effective:r--\\ngroup::rwx\\nmask::r--\\ndefault:group::rwx\\n"\n')
            fake.chmod(0o755)
            old = os.environ['PATH']
            os.environ['PATH'] = '%s:%s' % (bin_dir, old)
            try:
                for entries, expected in ((['user:auditor:rw-', 'mask::r--'], True), (['default:group::rwx'], True),
                                          (['user:auditor:r--'], False), (['user:audit:rw-'], False)):
                    check = {'kind': 'file', 'paths': ['/tmp'], 'acl': entries}
                    self.assertEqual(self.run_script(check) == 0, expected, entries)
            finally:
                os.environ['PATH'] = old

    def test_account_details_are_read_from_the_account_databases(self):
        """uid, groups, shell, home and password ageing come from getent and id; fake them for a test user."""
        with tempfile.TemporaryDirectory() as temp:
            bin_dir = Path(temp)
            (bin_dir / 'getent').write_text('#!/bin/bash\n[ "$1" = passwd ] && echo "ops1:x:3001:3001:Ops:/home/ops1:/bin/bash"\n'
                                             '[ "$1" = shadow ] && echo \'ops1:!$6$abc:0:1:90:7::20819:\'\nexit 0\n')
            (bin_dir / 'id').write_text('#!/bin/bash\ncase "$1" in -u) echo 3001;; -gn) echo ops;; -nG) echo ops wheel;; esac\n')
            for f in ('getent', 'id'):
                (bin_dir / f).chmod(0o755)
            env = {**os.environ, 'PATH': f'{bin_dir}:{os.environ["PATH"]}', 'H': 'servera', 'HS': 'servera'}
            def run(check):
                return subprocess.run(['bash', '-c', grade.host_script({'kind': 'user', 'names': ['ops1'], **check})], env=env).returncode
            good = [{'uid': 3001}, {'primaryGroup': 'ops'}, {'groups': ['wheel']}, {'shell': '/bin/bash'}, {'home': '/home/ops1'},
                    {'locked': True}, {'minDays': 1}, {'maxDays': 90}, {'warnDays': 7}, {'mustChangePassword': True},
                    {'expires': '2027-01-01'}]
            good.append({'notGroups': ['operators']})
            bad = [{'notGroups': ['wheel']}, {'uid': 3002}, {'primaryGroup': 'wheel'}, {'shell': '/sbin/nologin'}, {'locked': False}, {'maxDays': 60},
                   {'mustChangePassword': False}, {'expires': '2027-01-02'}]
            for check in good:
                self.assertEqual(run(check), 0, check)
            for check in bad:
                self.assertNotEqual(run(check), 0, check)

    def test_host_facts_checks_against_this_machine(self):
        """Kinds that only read system facts agree with what this machine reports."""
        import getpass, socket
        short = socket.gethostname().split('.')[0]
        who = getpass.getuser()
        root_mount = subprocess.run(['findmnt', '-rn', '-M', '/', '-o', 'FSTYPE'], capture_output=True, text=True).stdout.strip()
        default_target = subprocess.run(['systemctl', 'get-default'], capture_output=True, text=True).stdout.strip()
        cases = [
            ({'kind': 'user', 'names': ['root'], 'groups': ['root']}, 0),
            ({'kind': 'user', 'names': ['root'], 'groups': ['no-such-group']}, 1),
            ({'kind': 'user', 'names': ['no-such-user-xyz'], 'exists': False}, 0),
            ({'kind': 'user', 'names': [who]}, 0),
            ({'kind': 'mount', 'path': '/', 'fstype': root_mount}, 0),
            ({'kind': 'mount', 'path': '/', 'fstype': 'zfs-not-here'}, 1),
            ({'kind': 'hostname', 'short': short}, 0),
            ({'kind': 'hostname', 'short': short + 'x'}, 1),
            ({'kind': 'address', 'interface': 'lo', 'cidr': '127.0.0.1/8', 'persistent': False}, 0),
            ({'kind': 'address', 'interface': 'lo', 'cidr': '10.9.9.9/8', 'persistent': False}, 1),
            ({'kind': 'boot-target', 'target': default_target}, 0 if default_target else 1),
            ({'kind': 'boot-target', 'target': 'nothing.target'}, 1),
            ({'kind': 'process', 'pattern': '^sleep 4321$', 'running': False}, 0),
            ({'kind': 'process', 'pattern': '^sleep 4321$'}, 1),
            ({'kind': 'service', 'names': ['no-such-unit-xyz.service'], 'masked': False}, 0),
            ({'kind': 'service', 'names': ['no-such-unit-xyz.service'], 'masked': True}, 1),
            ({'kind': 'swap', 'minSizeMiB': 99999999, 'persistent': False}, 1),
            ({'kind': 'volume-group', 'vg': 'no-such-vg-xyz'}, 1),
            ({'kind': 'container', 'user': 'no-such-user-xyz', 'image': 'localhost/x:1'}, 1),
            ({'kind': 'container', 'user': 'no-such-user-xyz', 'linger': False}, 0),
            ({'kind': 'commands', 'names': ['bash', 'ls']}, 0),
            ({'kind': 'commands', 'names': ['bash', 'no-such-cmd-xyz']}, 1),
        ]
        for check, expected in cases:
            self.assertEqual(self.run_script(check) != 0, bool(expected), check)

    def test_firewall_checks_build_zone_queries(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('grade_module', ROOT / 'packages' / 'lab-tools' / 'grade.py')
        grade = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(grade)
        self.assertEqual(grade.conditions_firewall({'service': 'http', 'runtime': False}), ['firewall-cmd --permanent --query-service=http'])
        self.assertEqual(
            grade.conditions_firewall({'zone': 'partners', 'source': '172.25.250.11', 'permanent': False}),
            ['firewall-cmd --zone=partners --query-source=172.25.250.11'],
        )
        self.assertEqual(
            grade.conditions_firewall({'zone': 'partners', 'forwardPort': 'port=8081:proto=tcp:toport=8080', 'runtime': False, 'allowed': False}),
            ['! firewall-cmd --permanent --zone=partners --query-forward-port=port=8081:proto=tcp:toport=8080'],
        )

    def test_http_checks_against_a_local_server(self):
        import threading
        from http.server import BaseHTTPRequestHandler, HTTPServer

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                code, body = (200, b'This is a test page on servera.\n') if self.path == '/' else (404, b'no')
                self.send_response(code)
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *args):
                pass

        server = HTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            base = 'http://127.0.0.1:%d/' % server.server_address[1]
            host = 'servera.lab.example.com'
            self.assertEqual(self.run_script({'kind': 'http', 'url': base}, host), 0)
            self.assertEqual(self.run_script({'kind': 'http', 'url': base, 'containsAny': ['no such text', 'test page on {hostShort}']}, host), 0)
            self.assertNotEqual(self.run_script({'kind': 'http', 'url': base, 'containsAny': ['absent']}, host), 0)
            self.assertNotEqual(self.run_script({'kind': 'http', 'url': base + 'missing'}, host), 0, 'an error status fails')
        finally:
            server.shutdown()
            server.server_close()

    def test_hostile_values_stay_inside_quotes(self):
        with tempfile.TemporaryDirectory() as temp:
            marker = Path(temp) / 'pwned'
            hostile = "x'; touch %s; echo '" % marker
            for check in [{'kind': 'file', 'paths': ['/etc/hostname'], 'contains': [hostile]},
                          {'kind': 'service', 'names': ['a.service']},
                          {'kind': 'cron', 'file': 'x', 'matches': hostile},
                          {'kind': 'http', 'url': 'http://localhost/', 'containsAny': [hostile]}]:
                subprocess.run(['bash', '-c', grade.host_script(check)], capture_output=True, env={**os.environ, 'H': 'h', 'HS': 'h'})
            self.assertFalse(marker.exists(), 'a value from the catalog was run as a command')

    def test_unknown_kinds_and_control_characters_are_refused(self):
        with self.assertRaises(grade.CheckError):
            grade.host_script({'kind': 'shell', 'command': 'id'})
        with self.assertRaises(grade.CheckError):
            grade.host_script({'kind': 'file', 'paths': ['/etc/passwd'], 'contains': ['a\nb']})

    def test_raw_command_templates_only_the_host_name(self):
        command = grade.raw_command("grep -qF -- '{{' /etc/motd")
        self.assertEqual(command.count('{{'), 1)
        self.assertIn('{{ inventory_hostname }}', command)
        payload = re.search(r'echo (\S+) \|', command).group(1)
        self.assertIn("'{{'", base64.b64decode(payload).decode())


class GradingTests(unittest.TestCase):
    def test_all_checkpoints_working_broken_and_unreachable(self):
        for name, exercise in CATALOG['exercises'].items():
            for cp_id, cp in exercise['checkpoints'].items():
                with self.subTest(exercise=name, checkpoint=cp_id), tempfile.TemporaryDirectory() as temp:
                    project = Path(temp)
                    checks = cp.get('checks', [])
                    scripts = {raw: c for c in checks if c['on'] != 'control' for raw in [grade.raw_command(grade.host_script(c))]}
                    if exercise.get('transport') == 'ssh':
                        cp = {**cp, 'groups': {}}
                    for file in cp.get('files', []) + [cp.get('inventory', 'inventory')]:
                        p = project / file
                        p.parent.mkdir(parents=True, exist_ok=True)
                        p.write_text('fixture\n')

                    def control_ok(check, _project):
                        return state['control']

                    def runner_for(state_name):
                        def runner(args, cwd):
                            if args[0] == 'ssh':
                                return subprocess.CompletedProcess(args, {'pass': 0, 'broken': 1, 'unreachable': 255}[state_name], '', '')
                            if args[0] == 'ansible-inventory':
                                inventory = {g: {'hosts': hs} for g, hs in cp.get('groups', {}).items()}
                                return subprocess.CompletedProcess(args, 0, json.dumps(inventory), '')
                            tree = Path(args[args.index('--tree') + 1])
                            data = {'unreachable': True} if state_name == 'unreachable' else {'rc': 0 if state_name == 'pass' else 1}
                            check = scripts[args[args.index('-a') + 1]]
                            for host in check['targets']:
                                (tree / host).write_text(json.dumps(data))
                            return subprocess.CompletedProcess(args, 4 if state_name == 'unreachable' else 0 if state_name == 'pass' else 2, '', '')
                        return runner

                    state = {'control': True}
                    original = grade.control_check
                    grade.control_check = control_ok
                    try:
                        report, code = grade.grade(name, cp_id, project, CATALOG, runner_for('pass'))
                        self.assertEqual(code, 0, report)
                        self.assertEqual(report['app'], 'kernel-path-lab')
                        self.assertTrue(all(c['status'] == 'pass' for c in report['checks']))
                        if scripts:
                            _, code = grade.grade(name, cp_id, project, CATALOG, runner_for('broken'))
                            self.assertEqual(code, 1)
                            _, code = grade.grade(name, cp_id, project, CATALOG, runner_for('unreachable'))
                            self.assertEqual(code, 2)
                        if any(c['on'] == 'control' for c in checks):
                            state['control'] = False
                            _, code = grade.grade(name, cp_id, project, CATALOG, runner_for('pass'))
                            self.assertEqual(code, 1)
                        state['control'] = True
                        if cp.get('files'):
                            (project / cp['files'][0]).unlink()
                            _, code = grade.grade(name, cp_id, project, CATALOG, runner_for('pass'))
                            self.assertEqual(code, 1)
                    finally:
                        grade.control_check = original

    def test_a_missing_required_host_fails_instead_of_passing(self):
        cp_check = next(c for _, _, _, c in all_checks() if len(c.get('targets', [])) > 1)
        name, cp_id = next((n, i) for n, i, _, c in all_checks() if c is cp_check)
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            cp = CATALOG['exercises'][name]['checkpoints'][cp_id]
            for file in cp.get('files', []) + [cp.get('inventory', 'inventory')]:
                (project / file).parent.mkdir(parents=True, exist_ok=True)
                (project / file).write_text('x\n')

            def runner(args, cwd):
                if args[0] == 'ansible-inventory':
                    return subprocess.CompletedProcess(args, 0, json.dumps({g: {'hosts': h} for g, h in cp.get('groups', {}).items()}), '')
                tree = Path(args[args.index('--tree') + 1])
                for host in cp_check['targets'][:1]:
                    (tree / host).write_text(json.dumps({'rc': 0}))
                return subprocess.CompletedProcess(args, 0, '', '')

            original = grade.control_check
            grade.control_check = lambda c, p: True
            try:
                report, code = grade.grade(name, cp_id, project, CATALOG, runner)
            finally:
                grade.control_check = original
            self.assertEqual(code, 1)
            self.assertTrue(any(c['status'] == 'fail' and 'required host was not checked' in c['message'] for c in report['checks']))


class SshTransportTests(unittest.TestCase):
    """Exercises that do not use Ansible reach each host directly as root with the learner's key."""

    def test_the_remote_command_decodes_and_runs_the_check_with_the_host_name(self):
        command = grade.ssh_command('test "$H" = servera.lab.example.com && test "$HS" = servera', 'servera.lab.example.com')
        self.assertEqual(subprocess.run(['bash', '-c', command]).returncode, 0)

    def test_results_follow_the_ssh_exit_status_and_never_need_an_inventory(self):
        exercise = {'version': 1, 'lesson': '#/ch07/lab', 'transport': 'ssh', 'checkpoints': {'final': {'checks': [
            {'id': 'team', 'kind': 'file', 'on': 'servera.lab.example.com', 'targets': ['servera.lab.example.com'],
             'message': 'The team directory exists', 'paths': ['/srv/team']}]}}}
        catalog = {'version': 2, 'exercises': {'demo': exercise}}
        calls = []
        for rc, status, code in [(0, 'pass', 0), (1, 'fail', 1), (255, 'skip', 2)]:
            def runner(args, cwd, rc=rc):
                calls.append(args)
                return subprocess.CompletedProcess(args, rc, '', '')
            with tempfile.TemporaryDirectory() as temp:
                report, exit_code = grade.grade('demo', 'final', Path(temp), catalog, runner)
            self.assertEqual(exit_code, code)
            self.assertEqual([c['status'] for c in report['checks']], [status])
        self.assertTrue(all(a[0] == 'ssh' and 'root@servera.lab.example.com' in a and 'BatchMode=yes' in a for a in calls))


class ControlCheckTests(unittest.TestCase):
    def test_control_file_checks(self):
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            (project / 'secret.yml').write_text('$ANSIBLE_VAULT;1.1;AES256\n')
            (project / 'vault-pass').write_text('x')
            (project / 'vault-pass').chmod(0o600)
            self.assertTrue(grade.control_check({'kind': 'file', 'on': 'control', 'paths': ['secret.yml'], 'contains': ['$ANSIBLE_VAULT;']}, project))
            self.assertFalse(grade.control_check({'kind': 'file', 'on': 'control', 'paths': ['secret.yml'], 'contains': ['nope']}, project))
            self.assertTrue(grade.control_check({'kind': 'file', 'on': 'control', 'paths': ['vault-pass'], 'mode': '0600'}, project))
            self.assertFalse(grade.control_check({'kind': 'file', 'on': 'control', 'paths': ['vault-pass'], 'mode': '0644'}, project))
            self.assertFalse(grade.control_check({'kind': 'file', 'on': 'control', 'paths': ['missing.yml'], 'nonEmpty': True}, project))
            self.assertTrue(grade.control_check({'kind': 'commands', 'on': 'control', 'names': ['bash']}, project))
            self.assertFalse(grade.control_check({'kind': 'commands', 'on': 'control', 'names': ['no-such-command-xyz']}, project))

    @unittest.skipUnless(shutil.which('git'), 'git is not installed')
    def test_git_checks(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            remote = root / 'git-repos/ops/web-motd.git'
            work = root / 'work'
            run = lambda *a, cwd=None: subprocess.run(['git', *a], cwd=cwd, check=True, capture_output=True)
            run('init', '-q', '--bare', '-b', 'main', str(remote))
            run('clone', '-q', str(remote), str(work))
            run('config', 'user.name', 'T', cwd=work)
            run('config', 'user.email', 't@example.com', cwd=work)
            (work / 'a.txt').write_text('a')
            (work / '.gitignore').write_text('vault-pass\n')
            (work / 'vault-pass').write_text('secret')
            run('add', '-A', cwd=work)
            run('commit', '-q', '-m', 'one', cwd=work)
            run('push', '-q', 'origin', 'HEAD:main', cwd=work)
            check = lambda **kw: grade.control_check({'kind': 'git', 'on': 'control', **kw}, work)
            self.assertTrue(check(remoteEndsWith='git-repos/ops/web-motd.git', clean=True, pushedBranch='main', ignored=['vault-pass'], minCommits=1))
            self.assertFalse(check(minCommits=2))
            self.assertFalse(check(remoteEndsWith='git-repos/ops/other.git'))
            (work / 'b.txt').write_text('b')
            self.assertFalse(check(clean=True), 'an untracked file is not committed')
            run('add', '-A', cwd=work)
            run('commit', '-q', '-m', 'two', cwd=work)
            self.assertFalse(check(pushedBranch='main'), 'a local commit is not pushed')
            self.assertFalse(check(ignored=['a.txt']), 'a tracked file is not ignored')


if __name__ == '__main__':
    unittest.main()
