"""Polling helper that works under a strict content security policy.

Playwright's own wait_for_function evaluates its expression as a string inside the page, which a
policy without 'unsafe-eval' (the policy the built site ships with) rightly refuses. Evaluating through
the browser's debugging protocol is not subject to the page's policy, so poll with evaluate instead.
"""
import time


def wait_until(page, expression, arg=None, timeout=20):
    deadline = time.time() + timeout
    while True:
        if page.evaluate(expression, arg) if arg is not None else page.evaluate(expression):
            return
        if time.time() > deadline:
            raise AssertionError('timed out waiting for: ' + expression[:120])
        page.wait_for_timeout(50)
