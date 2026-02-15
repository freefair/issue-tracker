# Issue Tracker

Self-hosted issue tracker with Kotlin/Spring Boot backend and Next.js frontend.

## Tech Stack

### Backend
- **Kotlin 1.9.22** - Modern JVM language
- **Spring Boot 3.2.2** - Framework
- **Spring WebFlux** - Reactive web framework
- **Spring Data R2DBC** - Reactive database access
- **Kotlin Coroutines** - Suspend functions & Flow
- **PostgreSQL** - Production database
- **H2** - Development database
- **Gradle 8.5** - Build tool with Kotlin DSL
- **Java 21** - Runtime (via jenv)

### Frontend (Planned)
- **Next.js 14+** - React framework
- **TypeScript** - Type safety
- **CSS Modules** - Styling (Apple-inspired design)

## Features

✅ **Boards Management**
- Create, read, update, delete boards
- Board descriptions

✅ **Tasks Management**
- Full CRUD operations
- 5 Status columns: BACKLOG, TODO, IN_PROGRESS, READY_FOR_DEPLOYMENT, DONE
- Task descriptions (Markdown support)
- Position management for drag & drop
- Tags system

✅ **Search & Filter**
- Search by title, description, or tags
- Filter by status
- Case-insensitive search

✅ **Reactive Architecture**
- Kotlin coroutines (suspend functions)
- Flow for streaming data
- Non-blocking I/O

## Project Structure

```
issue-tracker/
├── backend/
│   ├── src/main/kotlin/com/issuetracker/
│   │   ├── domain/          # Entities (Board, Task)
│   │   ├── repository/      # CoroutineCrudRepository
│   │   ├── service/         # Business logic
│   │   ├── web/             # REST Controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   └── exception/       # Custom exceptions
│   ├── src/main/resources/
│   │   ├── application.yml           # Main config
│   │   ├── application-dev.yml       # H2 config
│   │   ├── application-prod.yml      # PostgreSQL config
│   │   ├── schema.sql                # Database schema
│   │   └── data.sql                  # Sample data
│   └── src/test/kotlin/             # Tests (51 tests)
├── build.gradle.kts         # Root build config
├── settings.gradle.kts      # Version catalog & modules
└── README.md
```

## Getting Started

### Prerequisites

- Java 21 (via jenv, sdkman, or manual install)
- PostgreSQL (for production mode)

### Development Mode (H2 Database)

```bash
# Run the application
./gradlew :backend:bootRun

# The API will be available at:
# http://localhost:8080

# H2 Console (dev mode only):
# http://localhost:8080/h2-console
```

### Build

```bash
# Run tests
./gradlew :backend:test

# Build JAR
./gradlew :backend:build

# Build Docker image
./gradlew :backend:jibDockerBuild
```

### Production Mode (PostgreSQL)

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=issuetracker
export DB_USER=issuetracker
export DB_PASSWORD=your_password

# Run with prod profile
./gradlew :backend:bootRun --args='--spring.profiles.active=prod'
```

## API Endpoints

### Boards

```http
GET    /api/boards           # List all boards
GET    /api/boards/{id}      # Get board by ID
POST   /api/boards           # Create board
PUT    /api/boards/{id}      # Update board
DELETE /api/boards/{id}      # Delete board
```

### Tasks

```http
GET    /api/boards/{boardId}/tasks              # List tasks
GET    /api/boards/{boardId}/tasks?status=TODO  # Filter by status
GET    /api/tasks/{id}                          # Get task by ID
POST   /api/boards/{boardId}/tasks              # Create task
PUT    /api/tasks/{id}                          # Update task
PATCH  /api/tasks/{id}/move                     # Move task (drag & drop)
DELETE /api/tasks/{id}                          # Delete task
GET    /api/tasks/search?boardId={id}&q={query} # Search tasks
```

### Example Requests

**Create Board:**
```bash
curl -X POST http://localhost:8080/api/boards \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project board"
  }'
```

**Create Task:**
```bash
curl -X POST http://localhost:8080/api/boards/{boardId}/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature",
    "description": "Add user authentication",
    "status": "TODO",
    "position": 1,
    "tags": ["backend", "security"]
  }'
```

**Move Task (Drag & Drop):**
```bash
curl -X PATCH http://localhost:8080/api/tasks/{taskId}/move \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "position": 2
  }'
```

**Search Tasks:**
```bash
curl "http://localhost:8080/api/tasks/search?boardId={id}&q=authentication"
```

## Testing

```bash
# Run all tests
./gradlew :backend:test

# Run with coverage
./gradlew :backend:test jacocoTestReport

# Test structure:
# - Repository tests (13 tests)
# - Service tests (19 tests)
# - Controller tests (18 tests)
# - Application context test (1 test)
# Total: 51 tests
```

## Database Schema

**Boards:**
- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

**Tasks:**
- `id` (UUID, PK)
- `board_id` (UUID, FK → boards)
- `title` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `status` (ENUM: BACKLOG, TODO, IN_PROGRESS, READY_FOR_DEPLOYMENT, DONE)
- `position` (INT, for ordering)
- `tags` (TEXT, comma-separated)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Docker Deployment

```bash
# Build Docker image
./gradlew :backend:jibDockerBuild

# Run with Docker
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=issuetracker \
  -e DB_USER=issuetracker \
  -e DB_PASSWORD=password \
  issue-tracker:latest
```

## Configuration

### Java Version

The project uses Java 21. Configure via jenv:

```bash
jenv local 21.0.10
```

Or set `JAVA_HOME` manually.

### Database Configuration

**Development (H2):**
- Automatic - no setup required
- In-memory database
- Sample data auto-loaded

**Production (PostgreSQL):**
```sql
CREATE DATABASE issuetracker;
CREATE USER issuetracker WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE issuetracker TO issuetracker;
```

## Code Quality

- **Clean Architecture** - Domain, Repository, Service, Controller layers
- **Kotlin Coroutines** - Idiomatic async/reactive code
- **Type Safety** - Kotlin + DTOs + validation
- **Test Coverage** - 51 tests across all layers
- **Exception Handling** - @ResponseStatus annotations
- **Derived Queries** - Spring Data generated methods

## Development

### Gradle Tasks

```bash
./gradlew tasks                    # List all tasks
./gradlew :backend:bootRun         # Run app
./gradlew :backend:test            # Run tests
./gradlew :backend:build           # Build JAR
./gradlew :backend:jibDockerBuild  # Build Docker image
```

### Version Catalog

Dependencies are managed in `settings.gradle.kts` using Gradle's version catalog feature.

## License

MIT
