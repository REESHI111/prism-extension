# 🚀 PRISM - Git Setup & Version Control Guide

## 📋 Initial Setup

### Step 1: Configure Git (First Time Only)
```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

### Step 2: Clean Current State
```bash
# Check current status
git status

# Commit the cleanup changes
git add .gitignore
git add package.json
git add backend/package.json
git add backend/.env.example
git add PHASE_EXECUTION_PLAN.md
git add GIT_SETUP_GUIDE.md

git commit -m "chore: project cleanup and setup

- Update .gitignore with comprehensive exclusions
- Fix package.json with all dependencies
- Create backend package.json
- Add phase-wise execution plan
- Remove deprecated files
- Setup proper project structure

Status: Ready for Phase 0 completion"

git push origin phase-2-privacy-guardian
```

### Step 3: Create Proper Branch Structure
```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop to remote
git push -u origin develop

# Set develop as default branch (do this on GitHub)
# Settings → Branches → Default branch → develop
```

### Step 4: Setup Branch Protection (On GitHub)

#### For `main` branch:
1. Go to repository Settings → Branches
2. Add rule for `main`
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require approvals (at least 1)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Do not allow bypassing the above settings

#### For `develop` branch:
1. Add rule for `develop`
2. Enable:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass

---

## 🌳 Branch Strategy

### Main Branches
- **`main`**: Production-ready code only
- **`develop`**: Integration branch for all features

### Feature Branches
Each phase gets its own feature branch:
```
feature/phase-1-foundation
feature/phase-2-privacy-guardian
feature/phase-3-privacy-scoring
feature/phase-4-fake-data
feature/phase-5-phishing-detection
feature/phase-6-ml-training
feature/phase-7-ml-integration
feature/phase-8-ui-enhancement
feature/phase-9-testing
feature/phase-10-deployment
```

### Hotfix Branches (if needed)
```
hotfix/critical-bug-fix
```

---

## 🔄 Workflow for Each Phase

### Starting a New Phase
```bash
# Make sure you're on develop and it's up to date
git checkout develop
git pull origin develop

# Create feature branch for the phase
git checkout -b feature/phase-X-name

# Verify you're on the correct branch
git branch
```

### During Development
```bash
# Check what files changed
git status

# See specific changes
git diff

# Add files to staging
git add <file1> <file2>
# Or add all changes
git add .

# Commit with meaningful message
git commit -m "feat(phase-X): description of what you did

Detailed explanation if needed

Tests: ✅ All passed
Status: In progress"

# Push to remote regularly
git push origin feature/phase-X-name
```

### Completing a Phase
```bash
# Make sure all changes are committed
git status

# Run all tests
npm test
npm run lint

# Final commit
git add .
git commit -m "feat(phase-X): complete phase X implementation

- Feature 1 implemented
- Feature 2 implemented
- All tests passing
- Performance benchmarks met
- Documentation updated

Tests: ✅ 100% passed
Performance: <metrics>
Status: ✅ Ready for next phase"

# Push to remote
git push origin feature/phase-X-name

# Create Pull Request on GitHub
# Go to repository → Pull Requests → New Pull Request
# Base: develop ← Compare: feature/phase-X-name
# Add description, screenshots, test results
# Request review from team member

# After approval, merge
git checkout develop
git merge feature/phase-X-name

# Tag the phase completion
git tag -a v1.0-phaseX -m "Phase X Complete: Description"

# Push develop and tags
git push origin develop
git push origin --tags

# Delete feature branch (optional)
git branch -d feature/phase-X-name
git push origin --delete feature/phase-X-name
```

---

## 📝 Commit Message Guidelines

### Format
```
<type>(scope): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

#### Good Commit Messages
```bash
git commit -m "feat(phase-2): implement tracker blocking

- Add tracker domain database (100+ domains)
- Implement declarativeNetRequest rules
- Track blocked requests per domain
- Update popup to show blocked count

Tests: ✅ All passed
Performance: <5% page load impact"
```

```bash
git commit -m "fix(privacy-scorer): correct score calculation

Fixed bug where HTTPS score wasn't weighted properly
in the final calculation.

Tests: ✅ Added test case for HTTPS weighting
Status: Ready for review"
```

```bash
git commit -m "test(phase-3): add privacy scoring tests

- Unit tests for score calculation
- Integration tests for history tracking
- Performance tests for dashboard load

Coverage: 95%
All tests passing: ✅"
```

#### Bad Commit Messages (Avoid These)
```bash
# Too vague
git commit -m "fixed stuff"

# No context
git commit -m "update"

# Mixed changes
git commit -m "add feature and fix 5 bugs and update docs"
```

---

## 🏷️ Tagging Strategy

### Phase Completion Tags
```bash
# Format: v1.0-phaseX
git tag -a v1.0-phase1 -m "Phase 1: Extension Foundation Complete"
git tag -a v1.0-phase2 -m "Phase 2: Privacy Guardian Complete"
git tag -a v1.0-phase3 -m "Phase 3: Privacy Scoring Complete"
# ... and so on
```

### Release Tags
```bash
# Alpha release (after phase 5)
git tag -a v1.0.0-alpha -m "Alpha Release: Core Features Complete"

# Beta release (after phase 8)
git tag -a v1.0.0-beta -m "Beta Release: Feature Complete"

# Release Candidate (after phase 9)
git tag -a v1.0.0-rc1 -m "Release Candidate 1"

# Production release (after phase 10)
git tag -a v1.0.0 -m "Production Release: PRISM v1.0.0"
```

### Viewing Tags
```bash
# List all tags
git tag

# Show tag details
git show v1.0-phase1

# Push all tags
git push origin --tags

# Push specific tag
git push origin v1.0-phase1
```

---

## 🔍 Useful Git Commands

### Checking Status
```bash
# See what's changed
git status

# See detailed changes
git diff

# See changes for specific file
git diff <filename>

# See staged changes
git diff --staged
```

### Viewing History
```bash
# View commit history
git log

# View compact history
git log --oneline

# View history with graph
git log --oneline --graph --all

# View history for specific file
git log <filename>

# View changes in specific commit
git show <commit-hash>
```

### Undoing Changes
```bash
# Discard changes in working directory
git restore <filename>

# Unstage file (keep changes)
git restore --staged <filename>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) - CAREFUL!
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert <commit-hash>
```

### Stashing Changes
```bash
# Save changes temporarily
git stash

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove stash
git stash pop

# Clear all stashes
git stash clear
```

### Remote Operations
```bash
# View remote repositories
git remote -v

# Fetch updates from remote
git fetch origin

# Pull updates (fetch + merge)
git pull origin develop

# Push to remote
git push origin branch-name

# Push all tags
git push origin --tags
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Merge Conflicts
```bash
# When merge conflict occurs
git status  # Shows conflicted files

# Open conflicted files and resolve manually
# Look for markers: <<<<<<<, =======, >>>>>>>

# After resolving
git add <resolved-files>
git commit -m "fix: resolve merge conflicts"
```

### Issue 2: Accidentally Committed to Wrong Branch
```bash
# Move last commit to new branch
git branch new-branch-name
git reset --hard HEAD~1
git checkout new-branch-name
```

### Issue 3: Need to Update Feature Branch with Latest Develop
```bash
git checkout develop
git pull origin develop
git checkout feature/phase-X
git merge develop
# Resolve any conflicts
git push origin feature/phase-X
```

### Issue 4: Accidentally Committed Sensitive Data
```bash
# Remove file from last commit
git rm --cached <sensitive-file>
echo "<sensitive-file>" >> .gitignore
git add .gitignore
git commit --amend -m "chore: remove sensitive file"

# If already pushed - contact team lead
# May need to use git-filter-branch or BFG Repo-Cleaner
```

---

## 📊 Phase Completion Checklist

Before creating Pull Request for phase completion:

### Code Quality
- [ ] All features implemented as per plan
- [ ] Code follows project style guidelines
- [ ] No console.log or debug code left
- [ ] No commented-out code
- [ ] All imports used, no unused variables

### Testing
- [ ] All unit tests pass (100%)
- [ ] All integration tests pass
- [ ] Manual testing completed
- [ ] Performance benchmarks met
- [ ] No regression in existing features

### Documentation
- [ ] Code comments added where needed
- [ ] README updated if needed
- [ ] Phase completion documented
- [ ] Known issues documented

### Git
- [ ] All changes committed
- [ ] Commit messages clear and descriptive
- [ ] Branch up to date with develop
- [ ] No merge conflicts
- [ ] Pushed to remote

### Pull Request
- [ ] PR title clear and descriptive
- [ ] PR description includes:
  - What was implemented
  - How to test
  - Screenshots/videos if UI changes
  - Test results
  - Performance metrics
- [ ] Linked to relevant issues
- [ ] Requested review from team member

---

## 🎯 Quick Reference

### Phase Start
```bash
git checkout develop
git pull origin develop
git checkout -b feature/phase-X-name
```

### During Development
```bash
git add .
git commit -m "feat(phase-X): what you did"
git push origin feature/phase-X-name
```

### Phase Complete
```bash
# Create PR on GitHub
# After merge:
git checkout develop
git pull origin develop
git tag -a v1.0-phaseX -m "Phase X Complete"
git push origin --tags
```

### Emergency Fixes
```bash
git checkout -b hotfix/bug-description
# Fix the bug
git commit -m "fix: description"
# Create PR to develop
```

---

## 🤝 Team Collaboration

### Code Review Guidelines
1. **Review within 24 hours**
2. **Be constructive and kind**
3. **Check for**:
   - Logic errors
   - Performance issues
   - Security vulnerabilities
   - Code style consistency
   - Test coverage
4. **Approve only when**:
   - All comments addressed
   - Tests pass
   - No conflicts with develop

### Communication
- **Slack/Discord**: Daily updates, quick questions
- **PR Comments**: Code-specific discussions
- **Issues**: Bug reports, feature requests
- **Wiki**: Documentation, guides
- **Meetings**: Weekly progress reviews

---

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching Strategy](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Remember**: Commit often, push regularly, test thoroughly! 🚀
