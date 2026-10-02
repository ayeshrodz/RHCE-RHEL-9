import os
from pathlib import Path
import subprocess
import tempfile
import unittest
ROOT = Path(__file__).resolve().parents[1]

class DownloadTests(unittest.TestCase):
    def invoke(self, root, assets, *args):
        return subprocess.run(['bash', str(ROOT / 'packages/engine/public/lab/lab'), *args], text=True,
            capture_output=True, env={**os.environ, 'LAB_HOME': str(root), 'LAB_URL': assets.as_uri()})
    def test_failed_download_preserves_existing_work(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); assets = root / 'assets'; exercise = assets / 'demo'; exercise.mkdir(parents=True)
            (exercise / 'MANIFEST').write_text('# Demo\nmissing.yml\n')
            original = root / 'demo'; original.mkdir(); (original / 'work').write_text('keep me')
            result = self.invoke(root, assets, 'start', 'demo', '--force')
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual((original / 'work').read_text(), 'keep me')
            self.assertFalse(list(root.glob('.lab-demo.*')))
    def test_failed_hook_is_never_reported_ready(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); assets = root / 'assets'; exercise = assets / 'demo'; exercise.mkdir(parents=True)
            (exercise / 'MANIFEST').write_text('# Demo\ninventory\n@setup.sh\n')
            (exercise / 'inventory').write_text('localhost\n')
            (exercise / 'setup.sh').write_text('false\necho should-not-run\n')
            result = self.invoke(root, assets, 'start', 'demo')
            self.assertNotEqual(result.returncode, 0); self.assertNotIn('is ready', result.stdout)
            self.assertTrue((root / 'demo/.lab-not-ready').exists())
            self.assertEqual(self.invoke(root, assets, 'grade', 'demo').returncode, 2)
    def test_successful_start_and_unsafe_paths(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); assets = root / 'assets'; exercise = assets / 'demo'; exercise.mkdir(parents=True)
            (exercise / 'MANIFEST').write_text('# Demo\ninventory\n')
            (exercise / 'inventory').write_text('localhost\n')
            result = self.invoke(root, assets, 'start', 'demo')
            self.assertEqual(result.returncode, 0, result.stderr); self.assertIn('is ready', result.stdout)
            (exercise / 'MANIFEST').write_text('# Demo\n../escape\n')
            self.assertNotEqual(self.invoke(root, assets, 'start', 'demo', '--force').returncode, 0)
            self.assertFalse((root.parent / 'escape').exists())
if __name__ == '__main__': unittest.main()
