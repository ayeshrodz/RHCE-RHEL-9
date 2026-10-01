"""Production-route and learning-flow checks; starts a local preview when needed."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('PLAYBOOK_TEST_URL', 'http://127.0.0.1:4173/')
server = None
try:
    urllib.request.urlopen(BASE, timeout=2)
except Exception:
    server = subprocess.Popen(['npm', 'run', 'preview', '--', '--host', '127.0.0.1'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(40):
        try:
            urllib.request.urlopen(BASE, timeout=1); break
        except Exception: time.sleep(.25)
    else: raise RuntimeError('Preview server did not start')

def go(page, route):
    page.goto(BASE + '#' + route)
    page.locator('h1').first.wait_for()
    page.wait_for_function("!document.querySelector('.skeleton')")

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page(); errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        routes = json.loads((ROOT / 'node_modules/.cache/playbook-path/routes.json').read_text())
        for route in routes:
            go(page, route)
            page.wait_for_function("!document.querySelector('.prose .widget[role=status]')")
            assert 'Page not found' not in page.locator('h1').first.inner_text(), route
            assert not page.locator('.load-error').count(), route
            assert 'This activity could not load' not in page.inner_text('body'), route
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), route
        for route in ['/progress', '/ch01/quiz', '/ch02/inventory', '/ch05/jinja2-templates', '/ch10/assessment-release', '/ch10/assessment-operations']:
            page.set_viewport_size({'width': 390, 'height': 844}); go(page, route)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'mobile {route}'
        # Mobile drawer focus and Escape return.
        go(page, '/')
        opener = page.get_by_role('button', name='Open navigation')
        opener.click()
        assert page.evaluate("document.querySelector('#course-navigation').contains(document.activeElement)")
        page.keyboard.press('Escape'); assert opener.evaluate('(e) => e === document.activeElement')
        page.set_viewport_size({'width': 1440, 'height': 1000})
        # Keyboard dialog containment and focus return.
        search = page.get_by_role('button', name='Search the course')
        search.click(); dialog = page.get_by_role('dialog', name='Search', exact=True); dialog.wait_for()
        page.keyboard.press('Shift+Tab'); assert dialog.evaluate('(e) => e.contains(document.activeElement)')
        page.keyboard.press('Escape'); assert search.evaluate('(e) => e === document.activeElement')
        # Links into optional detail still open the containing reveal.
        go(page, '/ch02/configuration')
        heading = page.locator('details .quiz-item[id]').first
        assert heading.count(), 'Optional details must preserve heading targets'
        if heading.count():
            target = heading.get_attribute('id')
            go(page, '/ch02/configuration#' + target)
            page.wait_for_function('(id) => { const e = document.getElementById(id); return e && e.closest("details").open }', arg=target)
        # Quiz attempt, reload, and review queue.
        go(page, '/ch01/quiz')
        first = page.locator('.quiz-item').first
        first.locator('.quiz-option').nth(1).click()
        page.reload(); first.wait_for(); assert 'Not quite.' in first.inner_text()
        go(page, '/progress'); assert page.get_by_role('link', name='Which term best describes the Ansible architecture?').count()
        # Browser activity feedback and independence from reading completion.
        go(page, '/ch01/quiz'); activity = page.locator('.challenge').first
        activity.get_by_label('ok', exact=True).check(); activity.get_by_role('button', name='Check answer').click()
        assert 'Requirement met' in activity.inner_text()
        assert page.evaluate("JSON.parse(localStorage.getItem('rhce:completed') || '[]').length") == 0
        # Optional timer survives reload.
        go(page, '/ch10/assessment-release'); page.get_by_role('button', name='Start 90-minute timer').click()
        page.reload(); page.locator('[role=timer]').wait_for(); assert 'remaining' in page.locator('[role=timer]').inner_text()
        # Backups through the actual UI, malformed rejection, and valid restoration.
        page.locator('.header-progress').click()
        with page.expect_download() as downloaded: page.get_by_role('button', name='Export', exact=True).click()
        with tempfile.TemporaryDirectory() as temp:
            file = Path(temp) / 'progress.json'; downloaded.value.save_as(file)
            backup = json.loads(file.read_text()); assert backup['version'] == 2
            malformed = Path(temp) / 'invalid.json'; malformed.write_text(json.dumps({**backup, 'data': {'completed': False}}))
            page.locator('.progress-panel input[type=file]').set_input_files(malformed)
            page.get_by_text('Invalid progress entry: completed', exact=True).wait_for()
            assert json.loads(page.evaluate("localStorage.getItem('rhce:challenge:desired-state')"))[0]['passed']
            page.locator('.progress-panel input[type=file]').set_input_files(file)
            page.locator('.progress-message').filter(has_text='Restored').wait_for()
        page.keyboard.press('Escape')
        # Complete grading reports import as independent practice evidence.
        go(page, '/progress')
        catalog = json.loads((ROOT / 'public/lab/graders.json').read_text())
        exercise = catalog['exercises']['bridge-security']; cp = exercise['checkpoints']['final']
        ids = ['file:' + f for f in cp['files']] + [x['id'] for x in cp.get('local', [])] + ['group:' + g for g in cp.get('groups', {})] + [probe['id'] + ':' + host for probe in cp['probes'] for host in probe['targets']]
        report = {'app': 'playbook-path-lab', 'version': 1, 'exerciseId': 'bridge-security', 'exerciseVersion': exercise['version'], 'checkpointId': 'final', 'checkedAt': '2026-10-02T00:00:00Z', 'checks': [{'id': id, 'status': 'pass', 'message': 'Requirement observed', 'lesson': exercise['lesson']} for id in ids]}
        with tempfile.TemporaryDirectory() as temp:
            file = Path(temp) / 'lab-report.json'; file.write_text(json.dumps(report))
            page.locator('article input[type=file]').set_input_files(file)
            page.get_by_text('Saved bridge-security / final.', exact=False).wait_for()
            assert page.evaluate("JSON.parse(localStorage.getItem('rhce:labReports')).length") == 1
            assert page.evaluate("JSON.parse(localStorage.getItem('rhce:completed') || '[]').length") == 0
            file.write_text(json.dumps({**report, 'checks': report['checks'][1:]}))
            page.locator('article input[type=file]').set_input_files(file)
            page.get_by_text('The lab report is incomplete:', exact=False).wait_for()
            assert page.evaluate("JSON.parse(localStorage.getItem('rhce:labReports')).length") == 1
        # Cross-tab updates.
        go(page, '/progress'); other = context.new_page(); go(other, '/')
        other.evaluate("localStorage.setItem('rhce:completed', JSON.stringify(['ch01/why-automate']))")
        page.wait_for_function("document.body.innerText.includes('1 sections marked read')")
        # Readiness migration and preference updates should stay independent.
        other.close()
        blocked = browser.new_context()
        blocked.add_init_script("Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new Error('blocked') }")
        blocked_page = blocked.new_page(); go(blocked_page, '/progress')
        assert 'storage is unavailable' in blocked_page.inner_text('body')
        corrupt = browser.new_context()
        corrupt.add_init_script("localStorage.setItem('rhce:completed', 'false'); localStorage.setItem('rhce:readiness', '{broken')")
        corrupt_page = corrupt.new_page(); go(corrupt_page, '/progress')
        assert corrupt_page.locator('h1').inner_text() == 'Your learning'
        assert corrupt_page.evaluate("localStorage.getItem('rhce:completed')") == 'false'
        assert not errors, errors
        print(f'PASS: {len(routes)} routes, mobile layouts, keyboard dialogs, activity feedback, timer persistence, progress round trips, cross-tab updates and unavailable storage')
        browser.close()
finally:
    if server:
        server.terminate(); server.wait(timeout=10)
