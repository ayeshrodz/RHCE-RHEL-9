"""Setup actions create what the old per-exercise scripts created, using only the platform's own code."""
import json
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from support import catalog, lab_tree
import prepare

CATALOG = catalog()


def run_exercise(name, project, home):
    os.environ['LAB_HOME'] = str(home)
    prepare.prepare(name, project, lab_tree().as_uri(), CATALOG)


class ActionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.project = self.root / 'project'
        self.project.mkdir()
        self.addCleanup(self.temp.cleanup)
        self.addCleanup(os.environ.pop, 'LAB_HOME', None)

    @unittest.skipUnless(shutil.which('openssl'), 'openssl is not installed')
    def test_htpasswd(self):
        (self.project / 'files').mkdir()
        run_exercise('data-review', self.project, self.root)
        line = (self.project / 'files/htpasswd').read_text()
        self.assertRegex(line, r'^guest:\$apr1\$')

    @unittest.skipUnless(shutil.which('openssl'), 'openssl is not installed')
    def test_self_signed_certificate_names_the_host(self):
        run_exercise('control-review', self.project, self.root)
        self.assertEqual(((self.project / 'server.key').stat().st_mode & 0o777), 0o600)
        text = subprocess.run(['openssl', 'x509', '-in', str(self.project / 'server.crt'), '-noout', '-text'], capture_output=True, text=True).stdout
        self.assertIn('DNS:serverb.lab.example.com', text)
        self.assertIn('DNS:serverb', text)

    @unittest.skipUnless(shutil.which('ssh-keygen'), 'ssh-keygen is not installed')
    def test_ssh_keypairs(self):
        run_exercise('system-users', self.project, self.root)
        for n in range(1, 6):
            self.assertTrue((self.project / f'files/user{n}.key').is_file())
            self.assertTrue((self.project / f'files/user{n}.key.pub').is_file())

    @unittest.skipUnless(shutil.which('git'), 'git is not installed')
    def test_git_history_matches_the_old_hooks(self):
        run_exercise('workflow-git', self.project, self.root)
        bare = self.root / 'git-repos/ops/web-motd.git'
        log = subprocess.run(['git', '-C', str(bare), 'log', '--format=%s|%an', 'main'], capture_output=True, text=True).stdout.splitlines()
        self.assertEqual(log, ['Warn that the MOTD is managed|Operations team', 'Add the MOTD project|Operations team'])
        motd = subprocess.run(['git', '-C', str(bare), 'show', 'main:templates/motd.j2'], capture_output=True, text=True).stdout
        self.assertIn('managed by Ansible', motd)

    @unittest.skipUnless(shutil.which('git'), 'git is not installed')
    def test_git_tags_and_branches(self):
        # role-review also packs an installed collection, which a development machine does not have.
        action = next(a for a in CATALOG['exercises']['role-review']['setup'] if a['action'] == 'git-seed-remote')
        ctx = prepare.Context('role-review', self.project, lab_tree().as_uri())
        os.environ['LAB_HOME'] = str(self.root)
        prepare.git_seed_remote(action, ctx)
        tags = subprocess.run(['git', '-C', str(self.root / 'git-repos/infra/apache.git'), 'tag'], capture_output=True, text=True).stdout.split()
        self.assertEqual(sorted(tags), ['v1.3', 'v1.4'])
        action = CATALOG['exercises']['role-galaxy']['setup'][0]
        prepare.git_seed_remote(action, prepare.Context('role-galaxy', self.project, lab_tree().as_uri()))
        branches = subprocess.run(['git', '-C', str(self.root / 'git-repos/student/bash_env.git'), 'branch', '--format=%(refname:short)'],
                                  capture_output=True, text=True).stdout.split()
        self.assertEqual(sorted(branches), ['dev', 'main'])

    def test_password_hash_variable(self):
        if not shutil.which('openssl'):
            self.skipTest('openssl is not installed')
        action = {'action': 'password-hash-var', 'path': 'v.yml', 'variable': 'pwhash', 'password': 'redhat', 'salt': 'reviewsalt'}
        prepare.password_hash_var(action, prepare.Context('x', self.project, ''))
        self.assertEqual((self.project / 'v.yml').read_text().splitlines()[0], '---')
        self.assertRegex((self.project / 'v.yml').read_text(), r'pwhash: \$6\$reviewsalt\$')
        commented = {**action, 'path': 'c.yml', 'commented': True, 'before': ['#username: x']}
        prepare.password_hash_var(commented, prepare.Context('x', self.project, ''))
        lines = (self.project / 'c.yml').read_text().splitlines()
        self.assertEqual(lines[0], '#username: x')
        self.assertTrue(lines[1].startswith('#pwhash: $6$'))

    def test_collection_requirements_lists_archives_by_absolute_path(self):
        (self.project / 'redhat-rhel_system_roles-1.2.3.tar.gz').write_text('x')
        (self.project / 'community-general-9.5.13.tar.gz').write_text('x')
        action = {'action': 'collection-requirements', 'path': 'requirements.yml', 'archives': ['redhat-rhel_system_roles-', 'community-general-']}
        prepare.collection_requirements(action, prepare.Context('x', self.project, ''))
        text = (self.project / 'requirements.yml').read_text()
        self.assertIn(f'- name: {self.project}/redhat-rhel_system_roles-1.2.3.tar.gz', text)
        self.assertLess(text.index('redhat'), text.index('community'))

    def test_paths_cannot_leave_the_project(self):
        with self.assertRaises(prepare.SetupError):
            prepare.htpasswd({'path': '../escape', 'user': 'a', 'password': 'b'}, prepare.Context('x', self.project, ''))
        with self.assertRaises(prepare.SetupError):
            prepare.fetch('file:///tmp', '../etc/passwd')

    def test_an_unknown_action_asks_for_an_update(self):
        catalog_with_new_action = {'exercises': {'demo': {'setup': [{'action': 'from-the-future'}]}}}
        with self.assertRaisesRegex(prepare.SetupError, 'lab update'):
            prepare.prepare('demo', self.project, '', catalog_with_new_action)

    def test_every_action_in_the_catalog_is_implemented(self):
        for name, exercise in CATALOG['exercises'].items():
            for action in exercise.get('setup', []):
                self.assertIn(action['action'], prepare.ACTIONS, name)


if __name__ == '__main__':
    unittest.main()
