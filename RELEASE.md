# Release Process

This document describes how to create a new release of the Issue Tracker application.

## Overview

The project uses **semantic versioning** (`MAJOR.MINOR.PATCH`, e.g., `1.0.0`) with Git tags to manage releases.

- **Development builds**: Push to `main` → Docker image tagged as `snapshot` (NO `latest` tag)
- **Release builds**: Create GitHub Release → Docker image tagged with version + `latest`, JAR uploaded as artifact

## Creating a Release

### 1. Prepare the Release

Ensure all changes are merged to `main` and tests pass:

```bash
git checkout main
git pull origin main
./gradlew clean build
```

### 2. Create a Git Tag

```bash
# Choose your version (e.g., 1.0.0)
VERSION="1.0.0"

# Create and push the tag
git tag -a "v${VERSION}" -m "Release version ${VERSION}"
git push origin "v${VERSION}"
```

### 3. Create GitHub Release

1. Go to **GitHub → Releases → Draft a new release**
2. Choose the tag you just created (`v1.0.0`)
3. **Release title**: `v1.0.0` or `Release 1.0.0`
4. **Description**: Describe the changes (changelog)
5. Click **Publish release**

### 4. Automated Build Process

When you publish the release, GitHub Actions automatically:

✅ Extracts version from tag (`v1.0.0` → `1.0.0`)
✅ Builds backend with version: `./gradlew build -Pversion=1.0.0`
✅ Creates JAR: `issue-tracker-1.0.0.jar`
✅ Uploads JAR to GitHub Release as artifact
✅ Builds Docker image with version
✅ Pushes Docker images to GitHub Container Registry:
   - `ghcr.io/owner/repo:1.0.0`
   - `ghcr.io/owner/repo:1` (major version)
   - `ghcr.io/owner/repo:1.0` (major.minor version)
   - `ghcr.io/owner/repo:latest` ⭐

## Versioning Guidelines

Follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (`2.0.0`): Breaking changes, incompatible API changes
- **MINOR** (`1.1.0`): New features, backwards-compatible
- **PATCH** (`1.0.1`): Bug fixes, backwards-compatible

### Examples

```bash
# First release
git tag -a "v1.0.0" -m "Initial release"

# Bug fix
git tag -a "v1.0.1" -m "Fix authentication bug"

# New feature
git tag -a "v1.1.0" -m "Add email notifications"

# Breaking change
git tag -a "v2.0.0" -m "Refactor API endpoints (breaking)"
```

## Using Released Artifacts

### Docker Image

```bash
# Pull latest version
docker pull ghcr.io/owner/repo:latest

# Pull specific version
docker pull ghcr.io/owner/repo:1.0.0

# Run the application
docker run -p 8080:8080 ghcr.io/owner/repo:latest
```

### JAR File

Download from GitHub Release page:

```bash
# Download from release
wget https://github.com/owner/repo/releases/download/v1.0.0/issue-tracker-1.0.0.jar

# Run locally
java -jar issue-tracker-1.0.0.jar
```

## Development Builds

Pushes to `main` without a release create **snapshot** builds:

- Docker image: `ghcr.io/owner/repo:snapshot`
- Docker image: `ghcr.io/owner/repo:main`
- Docker image: `ghcr.io/owner/repo:main-abc1234` (commit SHA)
- **NO `latest` tag**

```bash
# Pull snapshot build
docker pull ghcr.io/owner/repo:snapshot
```

## Troubleshooting

### Release workflow didn't trigger

- Ensure you **published** the release (not just drafted it)
- Check that the tag exists: `git tag -l`
- Verify workflows are enabled in **Settings → Actions**

### JAR not uploaded to release

- Check GitHub Actions logs
- Ensure the JAR was built: `backend/build/libs/issue-tracker-*.jar`
- Verify `GITHUB_TOKEN` has `contents: write` permission

### Docker image missing `latest` tag

- Only releases get the `latest` tag
- Check that the release was published (not drafted)
- Verify the workflow ran successfully

## CI/CD Pipeline Overview

```
┌─────────────────────────────────────────────────────────┐
│ Push to main                                            │
├─────────────────────────────────────────────────────────┤
│ • Build & Test                                          │
│ • Build JAR (version: 0.0.1-SNAPSHOT)                   │
│ • Push Docker image: snapshot, main, main-sha          │
│ • NO latest tag                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Create GitHub Release (v1.0.0)                          │
├─────────────────────────────────────────────────────────┤
│ • Extract version: v1.0.0 → 1.0.0                       │
│ • Build JAR with version: issue-tracker-1.0.0.jar       │
│ • Upload JAR to GitHub Release                          │
│ • Build Docker image with version                       │
│ • Push Docker images: 1.0.0, 1.0, 1, latest           │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

After release:

1. **Announce** the release (Changelog, Blog, etc.)
2. **Deploy** to production using the new Docker image
3. **Monitor** for issues
4. **Plan** the next release
