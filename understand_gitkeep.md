# Understand Gitkeep

---

**Status:** active  **Date:** 2026-10-13

---

### 👤 User

why git keep folder

---

### 🤖 Assistant

Git tracks files, not folders. An empty directory will never be committed — Git ignores it entirely.

The common workaround is to place a `.gitkeep` file (or any file) inside the folder you want to preserve. By convention, `.gitkeep` is an empty placeholder file with no content — its only purpose is to give Git something to track so the directory shows up in the repo.

**To keep an empty folder, run:**

```bash
touch components/.gitkeep
```

Then commit it:

```bash
git add components/.gitkeep
git commit -m "chore: keep components directory"
```

---

Looking at your repo, you have four untracked directories (`components/`, `data/`, `public/images/`, `types/`). These may already have files inside them — if so, Git will track them once you `git add` the files. They only need a `.gitkeep` if the directories are genuinely empty and you still want them in version control.

---

### 👤 User

delete gitkeep from images

---

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — rm public/images/.gitkeep

### 🤖 Assistant

Done — [`public/images/.gitkeep`](public/images/.gitkeep) has been deleted.