"""Production-route and learning-flow checks; starts a local preview when needed."""
import json
import os
from pathlib import Path
import tempfile
from playwright.sync_api import sync_playwright
from browser_server import preview_server

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('PLAYBOOK_TEST_URL', 'http://127.0.0.1:4173/')

def go(page, route):
    page.goto(BASE + '#' + route)
    page.locator('h1').first.wait_for()
    page.wait_for_function("!document.querySelector('.skeleton')")

with preview_server(BASE, ROOT):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(reduced_motion='reduce')
        page = context.new_page(); errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        routes = json.loads((ROOT / 'node_modules/.cache/kernel-path/routes.json').read_text())
        for route in routes:
            go(page, route)
            page.wait_for_function("!document.querySelector('.prose .widget[role=status]')")
            assert 'Page not found' not in page.locator('h1').first.inner_text(), route
            assert not page.locator('.load-error').count(), route
            assert 'This activity could not load' not in page.inner_text('body'), route
            assert 'Kernel Path' in page.title(), route
            assert page.locator('.brand-name').inner_text() == 'Kernel Path', route
            assert 'Playbook Path' not in page.inner_text('body'), route
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), route
            overflowing_tables = page.locator('.table-wrap').evaluate_all('(tables) => tables.filter(t => t.clientWidth && t.scrollWidth > t.clientWidth + 1).map(t => t.querySelector("thead")?.textContent)')
            assert not overflowing_tables, f'tables overflow on {route}: {overflowing_tables}'
        # Shared tables fit their containers, retain header associations and never alter commands.
        table_routes = ['/ch00/troubleshooting', '/ch00/overview', '/ch00/create-and-verify-vms', '/ch02/lab-inventory', '/ch05/file-modules', '/ch09/storage', '/platform']
        for theme in ['light', 'dark']:
            for width in [390, 768, 1024, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                for route in table_routes:
                    go(page, route)
                    page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                    errors_in_tables = page.locator('.table-wrap').evaluate_all("""(tables) => tables.filter(t => t.clientWidth).flatMap(t => {
                        const problems = [];
                        if (t.scrollWidth > t.clientWidth + 1) problems.push('horizontal scrolling');
                        for (const c of t.querySelectorAll('td, th')) {
                            if (c.clientWidth && c.scrollWidth > c.clientWidth + 1) problems.push('overflowing cell');
                        }
                        const table = t.querySelector('table');
                        if (table.getAttribute('role') !== 'table') problems.push('missing table semantics');
                        const labels = [...table.querySelectorAll('thead th')].map(h => h.textContent.trim());
                        if ([...table.querySelectorAll('thead th')].some(h => h.scope !== 'col')) problems.push('missing header scope');
                        for (const row of table.querySelectorAll('tbody tr')) {
                            [...row.cells].forEach((cell, i) => {
                                if (cell.dataset.label !== labels[i]) problems.push('incorrect mobile label');
                            });
                        }
                        if (t.clientWidth <= 640 && getComputedStyle(table).display !== 'block') problems.push('missing row cards');
                        if (t.clientWidth > 640 && getComputedStyle(table).tableLayout !== 'fixed') problems.push('missing desktop columns');
                        return problems;
                    })""")
                    assert not errors_in_tables, f'{route} {theme} {width}: {errors_in_tables}'
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.set_viewport_size({'width': 1440, 'height': 1000}); go(page, '/ch00/troubleshooting#general-problems')
        command = page.locator('.content-table code').filter(has_text='sudo iptables -I DOCKER-USER -i rhcebr0 -j ACCEPT').first
        assert command.inner_text() == 'sudo iptables -I DOCKER-USER -i rhcebr0 -j ACCEPT'
        selected_command = command.evaluate("""(e) => {
            const range = document.createRange(); range.selectNodeContents(e);
            const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
            const text = selection.toString(); selection.removeAllRanges(); return text;
        }""")
        assert selected_command == command.text_content(), 'Soft wrapping must preserve copied commands'
        table = page.locator('.table-wrap').nth(1)
        row = table.locator('tbody tr').filter(has_text="VMs can't reach the internet")
        row.evaluate("(e) => e.scrollIntoView({block: 'start', behavior: 'instant'})")
        pinned_header = table.locator('thead th').first.bounding_box()
        assert abs(pinned_header['y'] - page.locator('.header').bounding_box()['height']) <= 1
        link = table.get_by_role('link', name='repair the lab', exact=True).first
        link.focus(); assert link.evaluate('(e) => e === document.activeElement')
        link.click(); page.wait_for_function("document.getElementById('repair-an-existing-lab').getBoundingClientRect().top < 150")
        # The platform badge navigates to a track-owned MDX reference page.
        go(page, '/')
        lesson_before_reference = page.evaluate("localStorage.getItem('rhce:lastVisited')")
        page.get_by_role('link', name='RHEL 9: platform and versions', exact=True).click()
        page.get_by_role('heading', name='RHEL 9: Platform and versions', exact=True).wait_for()
        assert page.url.endswith('#/platform')
        assert not page.get_by_role('dialog').count()
        assert page.title() == 'RHEL 9: Platform and versions · Kernel Path'
        page.get_by_role('tab', name='Home lab', exact=True).click()
        diagram = page.locator('.tabs-panel:not([hidden]) .diagram')
        diagram.get_by_role('button', name='Runtime', exact=True).click()
        assert 'baseline disables execution environments' in diagram.locator('.dg-info-text').inner_text()
        page.get_by_role('tab', name='Classroom reference', exact=True).click()
        diagram = page.locator('.tabs-panel:not([hidden]) .diagram')
        runtime = diagram.get_by_role('button', name='EE container', exact=True)
        runtime.focus(); page.keyboard.press('Enter')
        assert 'does not mean the managed hosts must run RHEL 8' in diagram.locator('.dg-info-text').inner_text()
        assert runtime.get_attribute('aria-pressed') == 'true'
        diagram.locator('.dg-node').first.click()
        assert diagram.get_by_role('button', name='Project', exact=True).get_attribute('aria-pressed') == 'true'
        page.get_by_role('tab', name='Classroom reference', exact=True).focus(); page.keyboard.press('Home')
        assert page.get_by_role('tab', name='Home lab', exact=True).get_attribute('aria-selected') == 'true'
        assert page.evaluate("JSON.parse(localStorage.getItem('rhce:completed') || '[]').length") == 0
        assert not page.locator('.complete-btn').count()
        assert page.evaluate("localStorage.getItem('rhce:lastVisited')") == lesson_before_reference
        for theme in ['light', 'dark']:
            for width in [390, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                go(page, '/platform#check-what-will-actually-run')
                page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                page.wait_for_function("document.getElementById('check-what-will-actually-run').getBoundingClientRect().top < 150")
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'platform {theme} {width}'
                page.reload(); page.locator('#check-what-will-actually-run').wait_for()
                assert page.title() == 'RHEL 9: Platform and versions · Kernel Path'
        page.set_viewport_size({'width': 1440, 'height': 1000})
        # Every graded lab has a separately authored challenge; help is closed by default.
        lab_routes = [exercise['lesson'][1:] for exercise in json.loads((ROOT / 'public/lab/graders.json').read_text())['exercises'].values()]
        for route in lab_routes:
            go(page, route)
            page.get_by_role('button', name='Challenge', exact=True).click()
            brief = page.locator('.lab-challenge')
            assert brief.is_visible() and brief.locator('li').count() >= 2, route
            walkthrough = page.locator('.lab-walkthrough')
            assert walkthrough.get_attribute('open') is None, route
            assert not page.locator('.lab-task').first.is_visible(), route
            assert not brief.locator('pre').count(), route
            assert not page.get_by_text('Open hints and steps', exact=True).count(), route
            walkthrough.locator(':scope > summary').click()
            assert page.locator('.lab-task').first.is_visible(), route
            assert all(text.strip() for text in page.locator('.lab-task').all_inner_texts()), route
            page.get_by_role('button', name='Guided', exact=True).click()
            assert not page.locator('.lab-challenge').count(), route
            assert page.locator('.lab-task').first.is_visible(), route
        # Setup instructions remain a walkthrough; task checks survive mode changes/reload.
        go(page, '/ch00/prepare-host')
        assert not page.locator('.lab-mode').count()
        go(page, '/ch09/lab-archives')
        task = page.locator('.lab-task').first
        task.get_by_role('checkbox').click()
        page.get_by_role('button', name='Challenge', exact=True).click()
        page.reload(); page.locator('.lab-walkthrough > summary').click()
        assert page.locator('.lab-task').first.get_by_role('checkbox').get_attribute('aria-checked') == 'true'
        go(page, '/ch09/lab-archives#task-56ef7e8d45cf')
        page.wait_for_function("document.querySelector('.lab-walkthrough').open")
        assert page.locator('#task-56ef7e8d45cf').is_visible()
        page.get_by_role('button', name='Guided', exact=True).click()
        assert page.locator('.lab-mode').evaluate('(e) => e.classList.contains("option-switch")')
        assert not page.locator('.lab-mode .btn-primary').count()
        assert page.locator('h1').inner_text().endswith('Exercise: Archiving and restoring files')
        # Dashboard typography and action spacing in both themes and viewports.
        for theme in ['light', 'dark']:
            for width in [390, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000}); go(page, '/progress')
                page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                assert page.locator('h1').evaluate('(e) => getComputedStyle(e).fontWeight') == '500'
                assert page.locator('.dashboard-card h2').first.evaluate('(e) => getComputedStyle(e).marginTop') == '0px'
                assert not page.locator('.learning-dashboard .btn-primary').count()
                assert page.get_by_role('link', name='Continue lesson').evaluate('(e) => e.getBoundingClientRect().height') == page.locator('.dashboard-actions .btn').evaluate('(e) => e.getBoundingClientRect().height')
                assert page.locator('.dashboard-actions').evaluate('(e) => parseFloat(getComputedStyle(e).marginBottom)') >= 16
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        for route in ['/platform', '/progress', '/ch01/quiz', '/ch02/inventory', '/ch05/jinja2-templates', '/ch10/assessment-release', '/ch10/assessment-operations']:
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
        # Chapter practice uses the same multiple-choice quiz as every other question,
        # logs attempts for the dashboard, and stays independent of reading completion.
        go(page, '/ch01/quiz'); activity = page.locator('.quiz').nth(1)
        assert activity.locator('#challenge-desired-state').count()
        assert not activity.get_by_role('button', name='Check answer').count()
        assert not activity.locator('textarea').count()
        quiz = page.locator('.quiz').first
        for property in ['padding', 'borderRadius', 'backgroundColor']:
            assert activity.evaluate('(e, prop) => getComputedStyle(e)[prop]', property) == quiz.evaluate('(e, prop) => getComputedStyle(e)[prop]', property)
        activity.locator('#challenge-desired-state').get_by_role('button', name='ok', exact=True).click()
        assert activity.locator('.quiz-explain.is-correct').count() == 1
        assert page.evaluate("JSON.parse(localStorage.getItem('rhce:challenge:desired-state')).at(-1).passed")
        page.reload(); activity.wait_for(); assert activity.locator('.quiz-explain.is-correct').count() == 1
        assert page.evaluate("JSON.parse(localStorage.getItem('rhce:completed') || '[]').length") == 0
        # Optional timer survives reload.
        go(page, '/ch10/assessment-release'); page.get_by_role('button', name='Start 90-minute timer').click()
        page.reload(); page.locator('[role=timer]').wait_for(); assert 'remaining' in page.locator('[role=timer]').inner_text()
        # Backups through the actual UI, malformed rejection, and valid restoration.
        page.locator('.header-progress').click()
        with page.expect_download() as downloaded: page.get_by_role('button', name='Export', exact=True).click()
        assert downloaded.value.suggested_filename.startswith('kernel-path-progress-')
        with tempfile.TemporaryDirectory() as temp:
            file = Path(temp) / 'progress.json'; downloaded.value.save_as(file)
            backup = json.loads(file.read_text()); assert backup['version'] == 2
            assert backup['app'] == 'kernel-path'
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
        exercise = catalog['exercises']['system-archive']; cp = exercise['checkpoints']['final']
        ids = ['file:' + f for f in cp['files']] + [x['id'] for x in cp.get('local', [])] + ['group:' + g for g in cp.get('groups', {})] + [probe['id'] + ':' + host for probe in cp['probes'] for host in probe['targets']]
        report = {'app': 'playbook-path-lab', 'version': 1, 'exerciseId': 'system-archive', 'exerciseVersion': exercise['version'], 'checkpointId': 'final', 'checkedAt': '2026-10-02T00:00:00Z', 'checks': [{'id': id, 'status': 'pass', 'message': 'Requirement observed', 'lesson': exercise['lesson']} for id in ids]}
        with tempfile.TemporaryDirectory() as temp:
            file = Path(temp) / 'lab-report.json'; file.write_text(json.dumps(report))
            page.locator('article input[type=file]').set_input_files(file)
            page.get_by_text('Saved system-archive / final.', exact=False).wait_for()
            assert page.evaluate("JSON.parse(localStorage.getItem('rhce:labReports')).length") == 1
            assert page.evaluate("JSON.parse(localStorage.getItem('rhce:completed') || '[]').length") == 0
            file.write_text(json.dumps({**report, 'checks': report['checks'][1:]}))
            page.locator('article input[type=file]').set_input_files(file)
            page.get_by_text('The lab report is incomplete:', exact=False).wait_for()
            assert page.evaluate("JSON.parse(localStorage.getItem('rhce:labReports')).length") == 1
        # Cross-tab updates.
        go(page, '/progress'); other = context.new_page(); go(other, '/')
        other.evaluate("localStorage.setItem('rhce:completed', JSON.stringify(['ch01/why-automate']))")
        page.wait_for_function("document.querySelector('.dashboard-stats dd').innerText.trim().split(/\\s+/)[0] === '1'")
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
        print(f'PASS: {len(routes)} routes, {len(lab_routes)} authored lab modes, light/dark dashboard spacing, mobile layouts, keyboard dialogs, responsive table layouts, unchanged command selection, activity feedback, timer persistence, progress round trips, cross-tab updates and unavailable storage')
        browser.close()
