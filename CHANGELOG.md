# Change Log

### 2.1.2

Fixes:

- Support for `git.enabled` (#14)

### 2.1.0

Add files counter and tooltip with some info

### 2.0.0

Full extension redesign. Remove files counter (will be added later) for more stability.

### 1.2.5

Some fixes in architecture

### 1.2.4

Remove bluebird

### 1.2.1 - 1.2.3

Small changes in `README.md`.

### 1.2.0

Now indicators have counter of files, like original counter on action bar.
Stability changes.

### 1.1.1

Hide indicators without data.

### 1.1.0

Change structure of extension. Now it solid class with methods.

### 1.0.2

Fix indicators "freezing" after git actions (commits, pushes and etc.).

### 1.0.1

Add demo animation

### 1.0.0

Removed colors from modified indicators.
Now indicators have four states:

* Invisible -- when your project has no any changes.
* Plus -- show added or modified lines count.
* Minus -- show removed lines count.
* Modified -- show removed, modified and added lines count.

Now extension works more stable!

### 0.0.6

Fix endless error "Not a git repository..." in windows

### 0.0.5

Add commands for update and init indicators manually.
If current directory is not git-repository -- you'll see error message with usefull advices.

### 0.0.4

Fix 'NaN' value in counters.

### 0.0.3

Add documentation, icon and some code simplify.

### 0.0.1

First working version. Indicators on click open git panel.
