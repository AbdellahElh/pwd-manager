# Monorepo Git Workflow Guide

## Current Setup

This monorepo now contains both the frontend and backend packages with their complete commit histories preserved. The setup uses **git subtree** which is ideal for maintaining separate repositories while having a unified monorepo.

## Repository Structure

```
pwd-manager (main monorepo)
├── packages/
│   ├── face-pwd-manager-backend/    # From: git@github.com:AbdellahElh/pwd-manager-backend.git
│   └── face-pwd-manager-frontend/   # From: https://github.com/AbdellahElh/face-pwd-manager.git
├── package.json                     # Workspace configuration
├── README.md                        # Main documentation
└── .gitignore                       # Monorepo gitignore
```

## Workflow Options

### Option 1: Pure Monorepo (Recommended)
- Work directly in the monorepo
- All commits go to the monorepo repository
- Individual package repositories become read-only archives
- **Best for**: Teams that want unified development workflow

### Option 2: Bidirectional Sync
- Maintain both monorepo and individual repositories
- Sync changes between them using git subtree
- **Best for**: Teams that need to maintain separate package releases

### Option 3: Hybrid Approach
- Primary development in monorepo
- Periodic sync to individual repositories for releases
- **Best for**: Open source projects needing separate package distribution

## Recommended Workflow (Option 1)

### 1. Create New Monorepo Repository
```bash
# Create a new GitHub repository named "pwd-manager-monorepo"
# Then add it as remote:
git remote add origin https://github.com/AbdellahElh/pwd-manager-monorepo.git
git branch -M main
git push -u origin main
```

### 2. Development Workflow
```bash
# Regular development - work directly in packages
git add .
git commit -m "feat: add new feature to backend"
git push origin main

# For package-specific changes
git add packages/face-pwd-manager-backend/
git commit -m "fix(backend): resolve authentication issue"
git push origin main
```

### 3. Archive Individual Repositories
Update individual repository READMEs to point to the monorepo:

**For backend repository:**
```markdown
# ⚠️ Repository Moved

This repository has been moved to the monorepo:
**https://github.com/AbdellahElh/pwd-manager-monorepo**

Please use the monorepo for all future development and issues.
This repository is now read-only and maintained for historical purposes.
```

## Alternative: Bidirectional Sync Workflow

If you need to maintain individual repositories:

### Sync Changes FROM Individual Repos TO Monorepo
```bash
# Update backend from individual repo
git subtree pull --prefix=packages/face-pwd-manager-backend git@github.com:AbdellahElh/pwd-manager-backend.git main --squash

# Update frontend from individual repo  
git subtree pull --prefix=packages/face-pwd-manager-frontend https://github.com/AbdellahElh/face-pwd-manager.git main --squash
```

### Sync Changes FROM Monorepo TO Individual Repos
```bash
# Push backend changes to individual repo
git subtree push --prefix=packages/face-pwd-manager-backend git@github.com:AbdellahElh/pwd-manager-backend.git main

# Push frontend changes to individual repo
git subtree push --prefix=packages/face-pwd-manager-frontend https://github.com/AbdellahElh/face-pwd-manager.git main
```

## Best Practices for Big Projects

1. **Conventional Commits**: Use semantic commit messages
   ```
   feat(frontend): add password strength indicator
   fix(backend): resolve JWT token expiration
   docs: update API documentation
   ```

2. **Atomic Commits**: Each commit should represent a single logical change

3. **Branch Strategy**: 
   - `main`: stable production code
   - `develop`: integration branch for features
   - `feature/*`: individual feature branches
   - `hotfix/*`: urgent production fixes

4. **CI/CD Pipeline**: Set up workflows for:
   - Automated testing for both packages
   - Separate build/deploy for frontend and backend
   - Dependency security scanning
   - Code quality checks

5. **Package Versioning**: Use semantic versioning with workspace tools like Lerna or Changesets

## Examples from Big Projects

- **Google**: Single monorepo with millions of lines of code
- **Facebook**: React, Jest, and other tools in one monorepo
- **Microsoft**: TypeScript, VS Code extensions
- **Babel**: All plugins and tools in monorepo with Lerna

## Next Steps

1. **Create the monorepo repository on GitHub**
2. **Choose your workflow strategy** (Option 1 recommended)
3. **Set up CI/CD pipelines**
4. **Update documentation and team guidelines**
5. **Archive or update individual repositories**

This setup gives you the flexibility to work with a unified codebase while maintaining the ability to sync with individual repositories if needed.
