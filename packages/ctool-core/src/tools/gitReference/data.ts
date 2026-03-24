export interface GitReferenceRow {
    command: string;
    description: string;
}

export interface GitReferenceSection {
    id: string;
    title: string;
    items: GitReferenceRow[];
}

export interface GitGlossaryItem {
    term: string;
    description: string;
}

export const gitReferenceSections: GitReferenceSection[] = [
    {
        id: "create",
        title: "Create",
        items: [
            { command: "git clone <url>", description: "Clone a remote repository into a new local directory." },
            { command: "git init", description: "Create a new local Git repository in the current directory." },
        ],
    },
    {
        id: "local_changes",
        title: "Local Changes",
        items: [
            { command: "git status", description: "Inspect the current branch status and tracked file changes." },
            { command: "git diff", description: "Show the unstaged changes for tracked files." },
            { command: "git add <file>", description: "Stage a specific file for the next commit." },
            { command: "git add .", description: "Stage all modified and new files under the current directory." },
            { command: "git commit -a", description: "Commit tracked file changes without a separate add step." },
            { command: "git commit -m \"message\"", description: "Create a commit from the staged changes with a message." },
            { command: "git commit --amend -m \"message\"", description: "Rewrite the most recent commit message or contents." },
            { command: "git commit -am \"message\"", description: "Shortcut for staging tracked changes and committing them." },
            { command: "git stash", description: "Store current changes on a stash stack and restore the worktree." },
            { command: "git stash list", description: "List every saved stash entry." },
            { command: "git stash push", description: "Push the current worktree changes into the stash stack." },
            { command: "git stash pop", description: "Restore the latest stash entry and remove it from the stack." },
        ],
    },
    {
        id: "history",
        title: "Commit History",
        items: [
            { command: "git log", description: "Browse the commit history." },
            { command: "git log -n", description: "Show only the latest n commits." },
            { command: "git log --stat", description: "Show history with changed-file statistics." },
            { command: "git show <commit>", description: "Display one commit and its patch." },
            { command: "git show HEAD", description: "Inspect the current HEAD commit." },
            { command: "git show HEAD^", description: "Inspect the parent of HEAD; repeat ^ for older parents." },
            { command: "git blame <file>", description: "Show who last changed each line of a file." },
            { command: "git whatchanged", description: "List commits together with the files changed in each commit." },
        ],
    },
    {
        id: "branches",
        title: "Branches and Tags",
        items: [
            { command: "git branch", description: "List local branches." },
            { command: "git branch -r", description: "List remote-tracking branches." },
            { command: "git branch -a", description: "List both local and remote branches." },
            { command: "git branch --merged", description: "List branches already merged into the current branch." },
            { command: "git branch --no-merged", description: "List branches not yet merged into the current branch." },
            { command: "git branch -m <new-branch>", description: "Rename the current branch." },
            { command: "git branch -M <new-branch>", description: "Force rename the current branch even if the target exists." },
            { command: "git branch -m <old-branch> <new-branch>", description: "Rename a specific branch." },
            { command: "git branch -M <old-branch> <new-branch>", description: "Force rename a specific branch." },
            { command: "git checkout <branch-name>", description: "Switch to another branch." },
            { command: "git branch <new-branch>", description: "Create a new branch." },
            { command: "git branch --track <new> <remote>", description: "Create a new local branch that tracks a remote branch." },
            { command: "git branch -d <branch-name>", description: "Delete a fully merged local branch." },
            { command: "git tag", description: "List local tags." },
            { command: "git tag <tag-name>", description: "Create a tag from the current commit." },
            { command: "git tag -d <tag-name>", description: "Delete a local tag." },
        ],
    },
    {
        id: "remove",
        title: "Remove",
        items: [
            { command: "git rm <file>", description: "Delete a file from disk and stage the removal." },
            { command: "git rm -r <directory>", description: "Recursively remove files under a directory." },
            { command: "git rm --cached <file>", description: "Stop tracking a file but keep it on disk." },
        ],
    },
    {
        id: "merge",
        title: "Merge and Rebase",
        items: [
            { command: "git merge <branch>", description: "Merge another branch into the current branch." },
            { command: "git rebase <branch>", description: "Replay current branch commits on top of another branch." },
            { command: "git rebase --abort", description: "Cancel an in-progress rebase." },
            { command: "git rebase --continue", description: "Continue rebasing after conflict resolution." },
            { command: "git mergetool", description: "Open the configured merge tool to resolve conflicts." },
            { command: "git add <resolved-file>\ngit rm <resolved-file>", description: "Mark files as resolved after fixing merge conflicts." },
        ],
    },
    {
        id: "undo",
        title: "Undo",
        items: [
            { command: "git reset --hard HEAD", description: "Reset the current branch to HEAD and discard worktree changes." },
            { command: "git reset <commit>", description: "Move branch history to another commit without changing files." },
            { command: "git reset --hard <commit>", description: "Hard reset to another commit and discard later changes." },
            { command: "git reset --merge <commit>", description: "Reset while preserving files that differ between commit and worktree." },
            { command: "git reset --keep <commit>", description: "Reset while keeping local modifications when possible." },
            { command: "git revert <commit>", description: "Create a new commit that reverses a previous commit." },
            { command: "git restore <file>", description: "Restore a file in the worktree from the index or another source." },
            { command: "git checkout -- <file>", description: "Legacy way to discard local changes in a file." },
            { command: "git checkout HEAD <file>", description: "Restore a file to the current HEAD version." },
            { command: "git clean", description: "Remove untracked files from the working directory." },
        ],
    },
    {
        id: "config",
        title: "Configuration",
        items: [
            { command: "git clean -n", description: "Preview which untracked files would be removed." },
            { command: "git config --list", description: "List the active Git configuration values." },
            { command: "git config --global user.name <name>", description: "Set or view the global commit author name." },
            { command: "git config --global user.email <email>", description: "Set or view the global commit author email." },
            { command: "git config --global alias.<alias> <command>", description: "Create a reusable alias for a Git command." },
            { command: "git config --system core.editor <editor>", description: "Set the default editor for all users on the machine." },
            { command: "git config --global --edit", description: "Open the global Git config file in an editor." },
            { command: "git config --global color.ui auto", description: "Enable colored Git command output." },
        ],
    },
    {
        id: "other",
        title: "Other",
        items: [
            { command: "git var -l", description: "List Git environment variables." },
            { command: "git help <command>", description: "Open the manual for a specific command." },
        ],
    },
];

export const gitGlossary: GitGlossaryItem[] = [
    { term: "git", description: "A distributed version control system." },
    { term: "commit", description: "A snapshot of tracked changes stored in the repository history." },
    { term: "branch", description: "A movable pointer to a commit, usually used for parallel work." },
    { term: "clone", description: "A full local copy of a remote repository." },
    { term: "remote", description: "A shared repository hosted elsewhere, such as GitHub or GitLab." },
    { term: "fork", description: "A personal copy of another repository, usually on a hosting platform." },
    { term: "pull request", description: "A request to review and merge a proposed set of changes." },
    { term: "HEAD", description: "A symbolic pointer to the current commit or checked-out branch." },
];
