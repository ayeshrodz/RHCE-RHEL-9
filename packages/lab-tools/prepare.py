#!/usr/bin/env python3
"""Prepare an exercise on the control node, after `lab start` has copied its starter files.

The exercise catalog (graders.json) lists the setup actions. The catalog supplies values
only: this file owns what each action does. Nothing here runs a command taken from the
catalog, and everything is created inside the project folder or under ~/git-repos.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

CATALOG_VERSION = 2
COLLECTION_DIRS = ('/usr/share/ansible/collections/ansible_collections', '~/.ansible/collections/ansible_collections')


class SetupError(Exception):
    pass


def say(text):
    print('  ' + text)


def tool(args, **kw):
    try:
        return subprocess.run(args, text=True, capture_output=True, check=True, timeout=300, **kw)
    except FileNotFoundError:
        raise SetupError('%s is not installed on workstation' % args[0])
    except subprocess.CalledProcessError as error:
        raise SetupError('%s failed: %s' % (args[0], (error.stderr or '').strip()[:300]))


def inside(project, relative):
    """A path in the project; refuses anything that would leave it."""
    target = (project / relative).resolve()
    if project.resolve() not in target.parents and target != project.resolve():
        raise SetupError('unsafe path ' + str(relative))
    return target


def published(relative):
    """Where the compiler publishes a project file: dotfile name parts gain a "_", and ".lab" is added."""
    return '/'.join('_' + part if part.startswith('.') else part for part in relative.split('/')) + '.lab'


def fetch(base, relative):
    if '..' in relative.split('/') or relative.startswith('/'):
        raise SetupError('unsafe download path')
    with urllib.request.urlopen(base.rstrip('/') + '/' + relative, timeout=60) as response:
        return response.read()


def password_hash(password, salt=None):
    args = ['openssl', 'passwd', '-6', '-stdin'] + (['-salt', salt] if salt else [])
    return tool(args, input=password + '\n').stdout.strip()


# ---------------------------------------------------------------------------------------

def self_signed_cert(a, ctx):
    common = a['commonName']
    short = common.split('.')[0]
    key, cert = inside(ctx.project, a['key']), inside(ctx.project, a['cert'])
    tool(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', str(a.get('days', 3650)), '-subj', '/CN=' + common,
          '-addext', 'subjectAltName=DNS:%s,DNS:%s' % (common, short), '-keyout', str(key), '-out', str(cert)])
    key.chmod(0o600)
    say('created %s and %s (self-signed, for %s)' % (a['cert'], a['key'], common))


def htpasswd(a, ctx):
    target = inside(ctx.project, a['path'])
    hashed = tool(['openssl', 'passwd', '-apr1', '-stdin'], input=a['password'] + '\n').stdout.strip()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text('%s:%s\n' % (a['user'], hashed))
    say('created %s (user %s, password %s)' % (a['path'], a['user'], a['password']))


def password_hash_var(a, ctx):
    target = inside(ctx.project, a['path'])
    hashed = password_hash(a['password'], a.get('salt'))
    prefix = '#' if a.get('commented') else ''
    lines = list(a.get('before', [])) + ['%s%s: %s' % (prefix, a['variable'], hashed)]
    if not a.get('commented'):
        lines.insert(0, '---')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text('\n'.join(lines) + '\n')


def vault_encrypt(a, ctx):
    target = inside(ctx.project, a['path'])
    with tempfile.NamedTemporaryFile('w', delete=False) as handle:
        handle.write(a['password'] + '\n')
        passfile = handle.name
    try:
        os.chmod(passfile, 0o600)
        tool(['ansible-vault', 'encrypt', '--vault-password-file', passfile, str(target)])
    finally:
        os.unlink(passfile)
    say('created %s (encrypted; the Vault password is %s)' % (a['path'], a['password']))


def pack_installed_collection(a, ctx):
    namespace, name = a['namespace'], a['name']
    source = None
    for directory in COLLECTION_DIRS:
        candidate = Path(os.path.expanduser(directory)) / namespace / name
        if (candidate / 'MANIFEST.json').is_file():
            source = candidate
            break
    if source is None:
        raise SetupError('%s.%s is not installed on workstation (see section 1.6)' % (namespace, name))
    version = json.loads((source / 'MANIFEST.json').read_text())['collection_info']['version']
    archive = ctx.project / ('%s-%s-%s.tar.gz' % (namespace, name, version))
    entries = sorted(child.name for child in source.iterdir())
    tool(['tar', 'czf', str(archive), '--exclude=*.pyc', '--exclude=__pycache__', '-C', str(source), *entries])
    say('created ' + archive.name)


def build_collection(a, ctx):
    with tempfile.TemporaryDirectory() as temp:
        source = Path(temp) / 'collection'
        for relative in a['files']:
            destination = source / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(fetch(ctx.base, '%s/_trees/%s' % (ctx.name, published('%s/%s' % (a['source'], relative)))))
        tool(['ansible-galaxy', 'collection', 'build', str(source), '--output-path', str(ctx.project)])
    produced = sorted(p.name for p in ctx.project.glob('*.tar.gz'))
    say('created ' + ', '.join(produced))


def collection_requirements(a, ctx):
    entries = []
    for prefix in a['archives']:
        found = sorted(ctx.project.glob(prefix + '*.tar.gz'))
        if not found:
            raise SetupError('no collection archive named %s*.tar.gz was created' % prefix)
        entries.append(found[-1])
    target = inside(ctx.project, a['path'])
    target.write_text('---\ncollections:\n' + ''.join('  - name: %s\n' % entry for entry in entries))


def git_seed_remote(a, ctx):
    root = Path(os.environ.get('LAB_HOME') or Path.home()) / 'git-repos'
    bare = root / a['remote']
    if '..' in a['remote'].split('/'):
        raise SetupError('unsafe remote')
    shutil.rmtree(bare, ignore_errors=True)
    bare.parent.mkdir(parents=True, exist_ok=True)
    tool(['git', 'init', '-q', '--bare', '-b', 'main', str(bare)])
    author = a.get('author', {'name': 'Lab', 'email': 'lab@lab.example.com'})
    with tempfile.TemporaryDirectory() as temp:
        work = Path(temp) / 'work'
        tool(['git', 'init', '-q', '-b', 'main', str(work)])
        git = lambda *args: tool(['git', '-C', str(work), *args])
        git('config', 'user.name', author['name'])
        git('config', 'user.email', author['email'])
        branches = []
        for branch in a['branches']:
            if branch['name'] != 'main' or 'from' in branch:
                git('checkout', '-q', '-b', branch['name'], branch.get('from', 'main'))
            for commit in branch['commits']:
                for child in work.iterdir():
                    if child.name != '.git':
                        shutil.rmtree(child) if child.is_dir() else child.unlink()
                for relative in commit['files']:
                    destination = work / relative
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    destination.write_bytes(fetch(ctx.base, '%s/_trees/%s' % (ctx.name, published('%s/%s' % (commit['tree'], relative)))))
                git('add', '-A')
                git('commit', '-q', '-m', commit['message'])
                if 'tag' in commit:
                    git('tag', commit['tag'])
            branches.append(branch['name'])
        git('remote', 'add', 'origin', str(bare))
        git('push', '-q', 'origin', *branches, '--tags')
    say('published %s at %s (branches: %s)' % (a['remote'], bare, ', '.join(branches)))


def ssh_keypairs(a, ctx):
    directory = inside(ctx.project, a['dir'])
    directory.mkdir(parents=True, exist_ok=True)
    for name in a['names']:
        key = directory / (name + '.key')
        for old in (key, Path(str(key) + '.pub')):
            old.unlink(missing_ok=True)
        tool(['ssh-keygen', '-q', '-t', 'ed25519', '-N', '', '-C', name, '-f', str(key)])
    say('created %s/%s.key.pub ... (and their private keys)' % (a['dir'], a['names'][0]))


ACTIONS = {
    'self-signed-cert': self_signed_cert, 'htpasswd': htpasswd, 'password-hash-var': password_hash_var, 'vault-encrypt': vault_encrypt,
    'pack-installed-collection': pack_installed_collection, 'build-collection': build_collection,
    'collection-requirements': collection_requirements, 'git-seed-remote': git_seed_remote, 'ssh-keypairs': ssh_keypairs,
}


class Context:
    def __init__(self, name, project, base):
        self.name, self.project, self.base = name, project, base


def prepare(name, project, base, catalog):
    exercise = catalog['exercises'][name]
    ctx = Context(name, project, base)
    for action in exercise.get('setup', []):
        handler = ACTIONS.get(action.get('action'))
        if handler is None:
            raise SetupError('this version of lab does not know the setup action %r; run: lab update' % action.get('action'))
        handler(action, ctx)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('name')
    parser.add_argument('--project', type=Path, required=True)
    parser.add_argument('--catalog', type=Path, required=True)
    parser.add_argument('--base', required=True)
    args = parser.parse_args()
    try:
        catalog = json.loads(args.catalog.read_text())
        if catalog['version'] != CATALOG_VERSION or args.name not in catalog['exercises']:
            raise SetupError('unknown exercise or unsupported catalog; run: lab update')
        prepare(args.name, args.project, args.base, catalog)
    except (SetupError, OSError, ValueError, KeyError) as error:
        print('xx ' + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
