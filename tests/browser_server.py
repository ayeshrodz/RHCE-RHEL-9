"""Reuse an existing preview or manage a local server for browser checks."""
from contextlib import contextmanager
import os
import signal
import subprocess
import time
import urllib.request
from urllib.parse import urlsplit

@contextmanager
def preview_server(base, root):
    server = None
    try:
        try:
            urllib.request.urlopen(base, timeout=2)
        except Exception:
            url = urlsplit(base)
            if url.hostname not in ('127.0.0.1', 'localhost'):
                raise RuntimeError(f'Test server is unavailable: {base}')
            server = subprocess.Popen(
                ['npm', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', str(url.port or 4173), '--strictPort'],
                cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True,
            )
            for _ in range(40):
                try:
                    urllib.request.urlopen(base, timeout=1)
                    break
                except Exception:
                    if server.poll() is not None:
                        raise RuntimeError('Preview server exited before becoming ready')
                    time.sleep(.25)
            else:
                raise RuntimeError('Preview server did not start')
        yield
    finally:
        if server and server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(server.pid, signal.SIGKILL)
                server.wait()
