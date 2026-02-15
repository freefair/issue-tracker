# CI/CD Pipeline

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### ci-cd.yml

Main CI/CD pipeline that runs on every push and pull request.

#### Triggers
- **Push**: `main`, `develop` branches
- **Pull Request**: to `main`, `develop` branches

#### Jobs

##### 1. build-and-test
Runs on every push and PR:
- ✅ Checkout code
- ✅ Set up Java 17 and Node.js 18
- ✅ Install frontend dependencies
- ✅ Run frontend linting (`npm run lint`)
- ✅ Run frontend tests (`npm test`)
- ✅ Build frontend (`npm run build`)
- ✅ Run backend tests (`./gradlew test`)
- ✅ Build complete application (`./gradlew clean build`)
- ✅ Upload test reports as artifacts
- ✅ Upload JAR artifact

**Artifacts**:
- `test-reports`: Backend test reports and frontend coverage
- `issue-tracker-snapshot`: Built JAR file

##### 2. deploy-snapshot
Runs only on push to `main` or `develop` after successful build-and-test:
- ✅ Rebuild application
- ✅ Log in to GitHub Container Registry (ghcr.io)
- ✅ Build Docker image
- ✅ Push Docker image with tags:
  - `snapshot` (for main branch)
  - `latest` (for main branch)
  - `<branch-name>` (for all branches)
  - `<branch>-<commit-sha>` (for all commits)
- ✅ Create build summary

## Docker Image

The Docker image is built and pushed to GitHub Container Registry:

```
ghcr.io/tf-tech/issue-tracker:snapshot
ghcr.io/tf-tech/issue-tracker:latest
ghcr.io/tf-tech/issue-tracker:main
ghcr.io/tf-tech/issue-tracker:main-<sha>
```

### Pulling the Image

```bash
# Pull the latest snapshot
docker pull ghcr.io/tf-tech/issue-tracker:snapshot

# Run the container
docker run -p 8080:8080 ghcr.io/tf-tech/issue-tracker:snapshot
```

### Image Details

- **Base Image**: `eclipse-temurin:17-jre-alpine`
- **Size**: Optimized with Alpine Linux
- **User**: Non-root user (`appuser`)
- **Health Check**: Automatic health checks on `/actuator/health`
- **JVM Options**: Container-aware, G1GC, 75% max RAM

## Environment Variables

The workflow uses the following environment variables:

- `REGISTRY`: GitHub Container Registry (`ghcr.io`)
- `IMAGE_NAME`: Repository name (`${{ github.repository }}`)
- `JAVA_VERSION`: Java version (`17`)
- `NODE_VERSION`: Node.js version (`18`)

## Permissions

Required permissions for the workflow:

```yaml
permissions:
  contents: read
  packages: write
```

## Security

- ✅ Docker image runs as non-root user
- ✅ Uses official Eclipse Temurin base image
- ✅ Minimal Alpine Linux base
- ✅ No secrets exposed in logs
- ✅ GITHUB_TOKEN used for registry authentication

## Testing Locally

To test the workflow locally before pushing:

### 1. Build and Test
```bash
# Frontend
cd frontend
npm ci
npm run lint
npm test -- --run
npm run build

# Backend
cd ..
./gradlew test
./gradlew clean build
```

### 2. Build Docker Image
```bash
docker build -t issue-tracker:local .
```

### 3. Run Container
```bash
docker run -p 8080:8080 issue-tracker:local
```

### 4. Test Health
```bash
curl http://localhost:8080/actuator/health
```

## Troubleshooting

### Build Fails on Frontend Tests
- Check `npm test` locally
- Review test reports in artifacts
- Ensure Node.js version matches (18)

### Build Fails on Backend Tests
- Check `./gradlew test` locally
- Review test reports in `backend/build/reports/tests/`
- Ensure Java version matches (17)

### Docker Push Fails
- Verify `packages: write` permission is set
- Check GitHub Container Registry settings
- Ensure repository allows package publishing

### Image Pull Fails
- Verify you're authenticated: `echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin`
- Check image exists: `docker pull ghcr.io/tf-tech/issue-tracker:snapshot`
- Verify image visibility (public/private)

## Future Enhancements

- [ ] Add Cypress E2E tests to CI
- [ ] Add accessibility tests with cypress-axe
- [ ] Add code coverage reporting
- [ ] Add performance testing
- [ ] Add security scanning (Trivy, Snyk)
- [ ] Add automatic changelog generation
- [ ] Add staging deployment
- [ ] Add production deployment with approval
