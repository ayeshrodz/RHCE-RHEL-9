"""The `lab` command: downloads are all-or-nothing, setup failures are never reported as ready."""
import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from support import ROOT, TOOLS, lab_tree


class DownloadTests(unittest.TestCase):
    def invoke(self, root, assets, *args):
        return subprocess.run(['bash', str(TOOLS / 'lab'), *args], text=True, capture_output=True,
                              env={**os.environ, 'LAB_HOME': str(root), 'LAB_URL': assets.as_uri()})

    def assets(self, root, manifest, catalog='{"version": 2, "exercises": {"demo": {"version": 1, "lesson": "#/ch01/x", "checkpoints": {"final": {}}}}}'):
        assets = root / 'assets'
        exercise = assets / 'demo'
        exercise.mkdir(parents=True)
        (exercise / 'MANIFEST').write_text(manifest)
        (assets / 'graders.json').write_text(catalog)
        shutil.copy(TOOLS / 'prepare.py', assets / 'prepare.py')
        return assets, exercise

    def test_failed_download_preserves_existing_work(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            assets, _ = self.assets(root, '# Demo\nmissing.yml\n')
            original = root / 'demo'
            original.mkdir()
            (original / 'work').write_text('keep me')
            result = self.invoke(root, assets, 'start', 'demo', '--force')
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual((original / 'work').read_text(), 'keep me')
            self.assertFalse(list(root.glob('.lab-demo.*')))

    def test_failed_setup_is_never_reported_ready(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            catalog = '{"version": 2, "exercises": {"demo": {"version": 1, "lesson": "#/ch01/x", "checkpoints": {"final": {}}, "setup": [{"action": "pack-installed-collection", "namespace": "nobody", "name": "missing"}]}}}'
            assets, exercise = self.assets(root, '# Demo\ninventory=inventory.lab\n', catalog)
            (exercise / 'inventory.lab').write_text('localhost\n')
            result = self.invoke(root, assets, 'start', 'demo')
            self.assertNotEqual(result.returncode, 0)
            self.assertNotIn('is ready', result.stdout)
            self.assertTrue((root / 'demo/.lab-not-ready').exists())
            self.assertEqual(self.invoke(root, assets, 'grade', 'demo').returncode, 2)

    def test_successful_start_and_unsafe_paths(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            assets, exercise = self.assets(root, '# Demo\ninventory=inventory.lab\n')
            (exercise / 'inventory.lab').write_text('localhost\n')
            result = self.invoke(root, assets, 'start', 'demo')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('is ready', result.stdout)
            self.assertEqual((root / 'demo/inventory').read_text(), 'localhost\n')
            self.assertEqual([p.name for p in (root / 'demo').iterdir() if p.name.startswith('.lab-')], [])
            (exercise / 'MANIFEST').write_text('# Demo\n../escape\n')
            self.assertNotEqual(self.invoke(root, assets, 'start', 'demo', '--force').returncode, 0)
            self.assertFalse((root.parent / 'escape').exists())

    def test_downloaded_scripts_are_not_run(self):
        """A hook line in a manifest is not a feature any more: nothing the exercise ships is executed."""
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            assets, exercise = self.assets(root, '# Demo\n@setup.sh\n')
            (exercise / 'setup.sh').write_text('touch %s/ran\n' % root)
            self.invoke(root, assets, 'start', 'demo')
            self.assertFalse((root / 'ran').exists())

    @unittest.skipUnless(shutil.which('openssl'), 'openssl is not installed')
    def test_real_exercise_with_a_setup_action(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            result = self.invoke(root, lab_tree(), 'start', 'data-review')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue((root / 'data-review/files/htpasswd').read_text().startswith('guest:'))
            self.assertTrue((root / 'data-review/files/.htaccess').is_file())
            self.assertFalse((root / 'data-review/.lab-not-ready').exists())

    def test_every_exercise_downloads_completely(self):
        """All starter files of all exercises are reachable under the names the manifests give."""
        tree = lab_tree()
        for manifest in tree.glob('*/MANIFEST'):
            for line in manifest.read_text().splitlines():
                line = line.split('#')[0].strip()
                if line:
                    self.assertTrue((manifest.parent / line.partition('=')[2]).is_file(), (manifest.parent.name, line))


if __name__ == '__main__':
    unittest.main()
