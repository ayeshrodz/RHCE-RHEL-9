# Publishes the bash_env role in a Git repository on workstation, with a main and a dev branch.
set -e
repo=~/git-repos/student/bash_env.git
rm -rf "$repo"; mkdir -p "$(dirname "$repo")"
git init -q --bare -b main "$repo"
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
git init -q -b main "$t/w"; cd "$t/w"
git config user.name "Lab"; git config user.email "lab@lab.example.com"
mkdir -p defaults meta tasks templates
cat > defaults/main.yml <<'EOF'
---
# The shell prompt new users get.
default_prompt: '[\u@\h \W]\$ '
EOF
cat > meta/main.yml <<'EOF'
---
galaxy_info:
  author: Lab
  description: Default shell environment for new users
  license: MIT
  min_ansible_version: "2.14"
dependencies: []
EOF
cat > tasks/main.yml <<'EOF'
---
- name: put away .bashrc
  ansible.builtin.template:
    src: _bashrc.j2
    dest: /etc/skel/.bashrc
    mode: "0644"

- name: put away .bash_profile
  ansible.builtin.template:
    src: _bash_profile.j2
    dest: /etc/skel/.bash_profile
    mode: "0644"

- name: put away .vimrc
  ansible.builtin.template:
    src: _vimrc.j2
    dest: /etc/skel/.vimrc
    mode: "0644"
EOF
cat > templates/_bashrc.j2 <<'EOF'
# {{ ansible_managed }}
[ -f /etc/bashrc ] && . /etc/bashrc
PS1='{{ default_prompt }}'
EOF
cat > templates/_bash_profile.j2 <<'EOF'
# {{ ansible_managed }}
[ -f ~/.bashrc ] && . ~/.bashrc
EOF
cat > templates/_vimrc.j2 <<'EOF'
" {{ ansible_managed }}
set tabstop=2 shiftwidth=2 expandtab
EOF
printf '# bash_env\n\nSets the default shell environment in /etc/skel.\n\nVariables: `default_prompt`.\n' > README.md
git add -A; git commit -q -m "bash_env role"
git checkout -q -b dev
cat > defaults/main.yml <<'EOF'
---
# The shell prompt new users get, and its colour.
default_prompt: '[\u@\h \W]\$ '
prompt_color: green
EOF
cat > templates/_bashrc.j2 <<'EOF'
# {{ ansible_managed }}
[ -f /etc/bashrc ] && . /etc/bashrc
{% set colors = {'black': 30, 'red': 31, 'green': 32, 'yellow': 33, 'blue': 34, 'magenta': 35, 'cyan': 36, 'white': 37} %}
PS1='\[\e[{{ colors[prompt_color] | default(32) }}m\]{{ default_prompt }}\[\e[0m\]'
EOF
printf '# bash_env\n\nSets the default shell environment in /etc/skel.\n\nVariables: `default_prompt`, `prompt_color`.\n' > README.md
git add -A; git commit -q -m "Add prompt_color"
git remote add origin "$repo"; git push -q origin main dev
echo "  published the bash_env role at file://$repo (branches: main, dev)"
