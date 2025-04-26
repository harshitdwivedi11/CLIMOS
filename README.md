# CLIMOS CLI Tool
## Description

**CLIMOS** is a command-line tool for recording terminal sessions, reporting bugs, and managing bug resolution workflows. It is designed for developers and teams who want to track and resolve issues efficiently from the terminal. CLIMOS uses a login system to associate bug reports with users. Each recording (bug) can be marked as resolved or unresolved, and users can filter and manage their bugs directly from the CLI. All configuration and authentication data is stored in `~/.climos/` on the user's machine.

---

## Commands

| Command                | Description                                                      |
|------------------------|------------------------------------------------------------------|
| `climos login`         | Log in to the CLI tool using your username and password.         |
| `climos logout`        | Log out and remove your authentication token.                    |
| `climos report`        | Record your terminal session and report a new bug.               |
| `climos resolve`       | Mark your last recorded bug as resolved or not resolved.         |
| `climos --help`        | Show help and usage information.                                 |

---

## Options

- `--resolved`  
  Mark a bug as resolved. Used with `resolve` command. Defaults to true.

- `--not-resolved`  
  Mark a bug as not resolved. Used with `resolve` command.

---
