"""Shared fixtures: the compiled lab tree of the real content, built once per test run."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TOOLS = ROOT / 'packages/lab-tools'
sys.path.insert(0, str(TOOLS))

_bundle = None


def lab_tree():
    """Compile content/ and return the published lab/ folder."""
    global _bundle
    if _bundle is None:
        _bundle = tempfile.TemporaryDirectory()
        subprocess.run(['node', str(ROOT / 'packages/compiler/src/cli.js'), 'build', str(ROOT / 'content'), '--out', _bundle.name],
                       check=True, capture_output=True)
    return Path(_bundle.name) / 'lab'


def catalog():
    return json.loads((lab_tree() / 'graders.json').read_text())
