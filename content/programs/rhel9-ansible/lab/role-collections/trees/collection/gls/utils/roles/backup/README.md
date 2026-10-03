backup
======

This role backs up the files and directories listed in the `backup_files` variable.
The backup is identified by a name (`backup_id`) and can be restored with the `gls.utils.restore` role.
If a backup with the same name already exists, the role does nothing.

Requirements
------------

None

Role Variables
--------------

- `backup_id`: the name of the backup.
- `backup_files`: the list of files and directories to save.
- `backup_dir`: where backups are kept (default `/var/backups/gls`).
