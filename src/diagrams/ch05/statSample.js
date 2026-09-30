// What ansible.builtin.stat returns for /etc/motd (trimmed), for the data explorer in the lesson.
export const statSample = {
  changed: false,
  failed: false,
  stat: {
    exists: true,
    path: '/etc/motd',
    isreg: true,
    isdir: false,
    islnk: false,
    mode: '0644',
    uid: 0,
    gid: 0,
    pw_name: 'root',
    gr_name: 'root',
    size: 94,
    mtime: 1664498160.12,
    checksum: '5f76590425303022e933c43a7f2092a3d4b5c8f1',
    mimetype: 'text/plain',
    readable: true,
    writeable: true,
    executable: false,
  },
};
