"""Phone/tablet route coverage and shared mobile interaction contracts.

Run after npm run build with a preview at KERNEL_TEST_URL (default :4173).
Chromium emulation covers layout and interactions; physical-device checks remain separate.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_server import preview_server

BASE = os.environ.get('KERNEL_TEST_URL', os.environ.get('PLAYBOOK_TEST_URL', 'http://127.0.0.1:4173/'))
ROOT = Path(__file__).resolve().parents[1]
ROUTES = json.loads((ROOT / 'node_modules/.cache/kernel-path/routes.json').read_text())

def go(page, route):
    page.goto(BASE + '#' + route)
    page.locator('h1').first.wait_for()
    page.wait_for_function("!document.querySelector('.skeleton, .prose .widget[role=status]')")
    assert not page.locator('.load-error').count(), route
    assert 'This activity could not load' not in page.inner_text('body'), route

def fits(page, element):
    rect = element.bounding_box()
    size = page.viewport_size
    assert rect and rect['x'] >= -1 and rect['y'] >= -1, rect
    assert rect['x'] + rect['width'] <= size['width'] + 1, rect
    assert rect['y'] + rect['height'] <= size['height'] + 1, rect

with preview_server(BASE, ROOT):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        for width, height in [(320, 740), (390, 844), (768, 1024)]:
            page.set_viewport_size({'width': width, 'height': height})
            for route in ROUTES:
                go(page, route)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, route)
                too_small = page.locator('button, a.btn').evaluate_all("""elements => elements.filter(e => {
                    const r = e.getBoundingClientRect();
                    return r.width && r.height && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[inert]') && r.height < 43.5;
                }).map(e => ({class: e.className, text: e.textContent.trim(), height: e.getBoundingClientRect().height}))""")
                assert not too_small, (width, route, too_small)
                tiny_editors = page.locator('textarea, input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), select').evaluate_all("""elements => elements.filter(e => {
                    const r = e.getBoundingClientRect();
                    return r.width && r.height && parseFloat(getComputedStyle(e).fontSize) < 16;
                }).map(e => e.className)""")
                assert not tiny_editors, (width, route, tiny_editors)
        # All overlays fit narrow, normal and landscape phone viewports in both themes.
        for theme in ['light', 'dark']:
            for width, height in [(320, 740), (390, 844), (844, 390)]:
                page.set_viewport_size({'width': width, 'height': height})
                go(page, '/ch02/inventory')
                page.evaluate('(theme) => document.documentElement.dataset.theme = theme', theme)
                for name, dialog_name, close in [('Open navigation', 'Course navigation', 'Escape'), ('Search', 'Search', 'Escape'), ('Your progress', 'Your progress', 'Escape')]:
                    opener = page.locator('.search-icon-only:visible, .search-trigger:visible') if name == 'Search' else page.get_by_role('button', name=name, exact=True)
                    opener.click()
                    dialog = page.get_by_role('dialog', name=dialog_name, exact=True)
                    dialog.wait_for(); fits(page, dialog)
                    assert page.evaluate("document.body.style.overflow === 'hidden'")
                    page.keyboard.press('Shift+Tab')
                    assert dialog.evaluate('(e) => e.contains(document.activeElement)')
                    page.keyboard.press(close)
                    assert opener.evaluate('(e) => e === document.activeElement')
                    assert page.evaluate("document.body.style.overflow !== 'hidden'")
        page.set_viewport_size({'width': 390, 'height': 844})
        go(page, '/ch02/inventory')
        outline = page.locator('.page-outline'); outline.locator('summary').click()
        heading_button = outline.locator('button').first
        heading_text = heading_button.inner_text()
        heading_button.click()
        assert not outline.evaluate('(e) => e.open')
        assert page.evaluate("document.activeElement.matches('h2, h3')")
        # Header overlays share one controller: switching never stacks focus traps.
        page.get_by_role('button', name='Open navigation', exact=True).click()
        page.get_by_role('button', name='Your progress', exact=True).click()
        progress = page.get_by_role('dialog', name='Your progress', exact=True)
        progress.wait_for()
        assert not page.get_by_role('dialog', name='Course navigation').count()
        page.keyboard.press('Control+k')
        search = page.get_by_role('dialog', name='Search', exact=True)
        search.wait_for()
        assert not page.get_by_role('dialog', name='Your progress', exact=True).count()
        assert search.evaluate('(e) => e.contains(document.activeElement)')
        assert page.evaluate("document.body.style.overflow === 'hidden'")
        page.keyboard.press('Escape')
        # Controlled editors retain selection and state through shared tool interactions.
        editor = page.locator('.code-editor').first
        area = editor.locator('textarea')
        area.fill('[web]\nservera')
        area.evaluate('(e) => e.setSelectionRange(6, 13)')
        editor.get_by_role('button', name='Indent', exact=True).click()
        assert area.input_value() == '[web]\n  servera'
        editor.get_by_role('button', name='Outdent', exact=True).click()
        assert area.input_value() == '[web]\nservera'
        assert area.get_attribute('autocapitalize') == 'off'
        assert area.evaluate('(e) => getComputedStyle(e).fontSize') == '16px'
        editor.get_by_role('button', name='Wrap lines').click()
        assert area.get_attribute('wrap') == 'off'
        area.focus(); page.keyboard.press('Tab')
        assert not area.evaluate('(e) => e === document.activeElement')
        # Shared diagram viewport supports natural-size reading and explicit fit.
        go(page, '/ch02/writing-playbooks')
        diagram = page.locator('.diagram').first
        assert diagram.locator('.diagram-viewport').evaluate('(e) => e.scrollWidth > e.clientWidth')
        opener = diagram.get_by_role('button', name='Enlarge diagram')
        opener.click(); dialog = page.get_by_role('dialog'); dialog.wait_for()
        fits(page, page.locator('.lightbox-body'))
        dialog.get_by_role('button', name='Fit to screen').click()
        page.wait_for_function("document.querySelector('.lightbox-viewport').classList.contains('is-fit') && document.querySelector('.lightbox-viewport').scrollWidth <= document.querySelector('.lightbox-viewport').clientWidth + 1")
        dialog.get_by_role('button', name='Close diagram').click()
        assert opener.evaluate('(e) => e === document.activeElement')
        # Visual wrapping preserves exact source text and copied code.
        go(page, '/ch02/writing-playbooks')
        block = page.locator('.code-block').first
        source = block.locator('pre').text_content()
        block.get_by_role('button', name='Wrap lines').click()
        assert block.locator('pre').text_content() == source
        page.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText: async text => {window.copiedCode=text;}}})")
        block.get_by_role('button', name='Copy code', exact=True).click()
        assert page.evaluate('window.copiedCode') == source
        # Repeated activity runs retain state after a shell/theme render.
        go(page, '/ch02/modules-and-yaml')
        activity = page.locator('.cvm')
        activity.get_by_role('button', name='Run playbook').click()
        page.get_by_role('button', name='Theme:', exact=False).click()
        assert activity.get_by_role('button', name='Run #2').count()
        assert not errors, errors
        browser.close()
print(f'Mobile checks passed: {len(ROUTES)} routes at three widths, shared overlays, outline, editors, diagrams and activity state.')
