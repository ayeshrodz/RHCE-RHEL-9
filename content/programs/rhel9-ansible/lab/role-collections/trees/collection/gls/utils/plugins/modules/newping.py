#!/usr/bin/python
# A connection test module, written for this exercise.

DOCUMENTATION = r"""
module: newping
short_description: Try to connect to host, verify a usable python and return C(pong) on success
description:
  - A trivial test module. It returns C(pong) when Ansible can log in to the host and run Python there.
  - It does not make sense in a real playbook, but is useful to check that a collection's modules are found.
options:
  data:
    description: The value to return in C(ping). If set to C(crash), the module fails on purpose.
    type: str
    default: pong
author: Curriculum Developer
"""

EXAMPLES = r"""
- name: Check that the host answers
  gls.utils.newping:
    data: pong
"""

RETURN = r"""
ping:
  description: The value of the data option.
  returned: success
  type: str
  sample: pong
"""

from ansible.module_utils.basic import AnsibleModule


def main():
    module = AnsibleModule(argument_spec=dict(data=dict(type="str", default="pong")), supports_check_mode=True)
    if module.params["data"] == "crash":
        module.fail_json(msg="newping was asked to fail")
    module.exit_json(changed=False, ping=module.params["data"])


if __name__ == "__main__":
    main()
