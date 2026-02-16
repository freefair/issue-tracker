# Issue Tracker

Modern, self-hosted issue tracker with Kotlin/Spring Boot backend and Next.js frontend. Features a powerful Kanban board, backlog management, advanced search, and drag & drop functionality.

## Tech Stack

### Backend
- **Kotlin 1.9+** - Modern JVM language
- **Spring Boot 3.x** - Application framework
- **Spring WebFlux** - Reactive web framework
- **Spring Data R2DBC** - Reactive database access
- **Kotlin Coroutines** - Suspend functions & Flow for async operations
- **PostgreSQL** - Database (required)
- **Flyway** - Database migrations
- **Gradle (Kotlin DSL)** - Build tool
- **Java 21** - Runtime

### Frontend
- **Next.js 16** - React framework (App Router)
- **React 19** - UI library
- **TypeScript 5.9** - Type safety (strict mode)
- **Tailwind CSS** - Utility-first styling
- **@dnd-kit/react** - Accessible drag & drop
- **Static Export** - Served from backend `/static`

## Features

### 🗂️ Multi-Board Organization
- Create unlimited boards for projects, teams, or workflows
- Quick board switching via sidebar
- Filter boards by name (client-side search)
- Board state persisted in URL (`?board={uuid}`)

### 📊 Three-View Workflow

**Board View (Kanban)**
- 4 status columns: To Do, In Progress, Ready for Deployment, Done
- Drag & drop tasks between columns
- Keyboard navigation support

**Backlog View**
- Custom categories (e.g., "Critical", "Tech Debt", "Nice to have")
- Drag & drop to reorder categories by priority
- Drag & drop tasks within and between categories
- Uncategorized section for unassigned tasks
- Quick promotion from Backlog to To Do

**Archive View**
- Review completed tasks
- Search archived tasks
- Restore tasks to active columns

### 🔍 Advanced Search
- **Structured Query Syntax:**
  - `Board:[Name]` - Search specific board
  - `Tag:[TagName]` - Filter by tag
  - `Status:[StatusName]` - Filter by status
- **Query Chips** - Structured filters become visual bubbles
- **Autocomplete** - Field names and values suggested
- **Board/Global Scope** - Search current board or all boards
- **Keyboard Shortcut** - `Cmd+K` / `Ctrl+K` to focus search
- **Debounced** - 300ms delay to reduce API load

### 🏷️ Flexible Tagging
- Multiple tags per task
- Tag autocomplete based on existing tags
- Visual tag chips in UI
- Search integration

### 📱 Responsive Design
- Desktop: Full multi-column layout with persistent sidebar
- Mobile: Collapsible sidebar, touch-optimized drag & drop
- Touch support: Long-press to drag, swipe-friendly

### ⚡ Performance & UX
- Optimistic UI updates (instant feedback)
- Reactive backend (non-blocking I/O)
- Indexed database queries
- Client-side filtering where possible

## Project Structure

```
issue-tracker/
├── backend/
│   └── src/main/
│       ├── kotlin/com/issuetracker/
│       │   ├── domain/          # Entities (Board, Task, BacklogCategory)
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── repository/      # R2DBC repositories
│       │   ├── service/         # Business logic
│       │   ├── web/             # REST controllers
│       │   └── exception/       # Custom exceptions
│       └── resources/
│           ├── db/migration/    # Flyway SQL migrations (V1__, V2__, ...)
│           ├── application.properties  # Main config
│           └── static/          # Deployed frontend (auto-generated)
├── frontend/
│   ├── app/                     # Next.js App Router pages
│   ├── components/              # React components
│   ├── lib/                     # API client, utilities
│   ├── types/                   # TypeScript interfaces
│   ├── out/                     # Build output (→ backend/static)
│   └── next.config.mjs          # Static export config
├── gradlew                      # Gradle wrapper
├── build.gradle.kts             # Root build config
├── CLAUDE.md                    # Development guidelines
├── FEATURES.md                  # Detailed feature documentation
└── openapi.json                 # API specification
```

## Installation

### Option 1: Docker with PostgreSQL

The easiest way to run Issue Tracker is using Docker Compose with PostgreSQL:

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: issue-tracker-db
    environment:
      POSTGRES_DB: issuetracker
      POSTGRES_USER: issuetracker
      POSTGRES_PASSWORD: changeme
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U issuetracker"]
      interval: 10s
      timeout: 5s
      retries: 5

  issue-tracker:
    image: ghcr.io/freefair/issue-tracker:latest
    container_name: issue-tracker
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      # Spring Profile
      SPRING_PROFILES_ACTIVE: prod

      # Database Configuration
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: issuetracker
      DB_USER: issuetracker
      DB_PASSWORD: changeme

      # CORS Configuration (set to your domain in production)
      CORS_ALLOWED_ORIGINS: http://localhost:8080
    restart: unless-stopped

volumes:
  postgres_data:
```

**Start:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f issue-tracker
```

**Stop:**
```bash
docker-compose down
```

Access the application at http://localhost:8080

### Option 2: Docker with External Database

If you already have a PostgreSQL database:

```bash
docker run -d \
  --name issue-tracker \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=issuetracker \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e CORS_ALLOWED_ORIGINS=https://yourdomain.com \
  ghcr.io/freefair/issue-tracker:latest
```

### Option 3: From Source

For development or custom builds, see the [Getting Started](#getting-started) section below.

---

## Getting Started

### Prerequisites

- **Java 21** (via jenv, sdkman, or manual install)
- **Node.js 18+** and npm (for frontend development)
- **PostgreSQL 12+** (for local development)

### Quick Start (Development)

1. **Setup PostgreSQL database:**
   ```bash
   # Create database and user
   psql -U postgres -c "CREATE DATABASE issuetracker;"
   psql -U postgres -c "CREATE USER issuetracker WITH PASSWORD 'postgres';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE issuetracker TO issuetracker;"
   ```

2. **Build and deploy frontend:**
   ```bash
   cd frontend
   npm install
   npm run build         # Builds to out/
   npm run deploy        # Copies out/ → backend/src/main/resources/static/
   ```

3. **Start backend:**
   ```bash
   cd ..
   ./gradlew bootRun     # Uses dev profile with localhost PostgreSQL
   ```

4. **Access application:**
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api
   - Health Check: http://localhost:8080/health

### Development Workflow

**Frontend hot reload:**
```bash
cd frontend
npm run dev     # Starts Next.js dev server on http://localhost:3000
```

**Backend auto-restart:**
```bash
./gradlew bootRun --continuous
```

**Full deployment (after changes):**
```bash
# Kill existing backend
pkill -f "gradle.*bootRun"

# Build and deploy frontend
cd frontend && npm run deploy

# Restart backend
cd ..
./gradlew bootRun > /tmp/backend.log 2>&1 &

# Verify
sleep 5 && curl -s http://localhost:8080/api/boards | jq
```

## API Endpoints

### Boards
```http
GET    /api/boards           # List all boards
GET    /api/boards/{id}      # Get board by ID
POST   /api/boards           # Create board
PUT    /api/boards/{id}      # Update board
DELETE /api/boards/{id}      # Delete board (cascades to tasks)
```

### Tasks
```http
GET    /api/boards/{boardId}/tasks              # List tasks for board
GET    /api/boards/{boardId}/tasks?status=TODO  # Filter by status
GET    /api/tasks/{id}                          # Get task by ID
POST   /api/boards/{boardId}/tasks              # Create task
PATCH  /api/tasks/{id}                          # Update task (partial)
PATCH  /api/tasks/{id}/move                     # Move task (status + position)
DELETE /api/tasks/{id}                          # Delete task
```

### Search
```http
GET    /api/tasks/search?boardId={id}&q={query} # Search in board
GET    /api/tasks/search/global?q={query}       # Search across all boards
```

### Tags
```http
GET    /api/boards/{boardId}/tags               # Get all tags for board
GET    /api/boards/{boardId}/tags?q={query}     # Filter tags
```

### Backlog Categories
```http
GET    /api/boards/{boardId}/backlog-categories      # List categories
POST   /api/boards/{boardId}/backlog-categories      # Create category
GET    /api/backlog-categories/{id}                  # Get category
PATCH  /api/backlog-categories/{id}                  # Update category
DELETE /api/backlog-categories/{id}                  # Delete category
```

### Example Requests

**Create Board:**
```bash
curl -X POST http://localhost:8080/api/boards \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "Main development board"}'
```

**Create Task:**
```bash
curl -X POST http://localhost:8080/api/boards/{boardId}/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement user authentication",
    "description": "Add JWT-based auth",
    "status": "TODO",
    "position": 0,
    "tags": ["backend", "security"]
  }'
```

**Update Task:**
```bash
curl -X PATCH http://localhost:8080/api/tasks/{taskId} \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS", "position": 1}'
```

**Search Tasks:**
```bash
curl "http://localhost:8080/api/tasks/search?boardId={id}&q=authentication"
curl "http://localhost:8080/api/tasks/search/global?q=Tag:backend"
```

## Database

### Schema Overview

**Tables:**
- `boards` - Board definitions
- `tasks` - All tasks (linked to boards)
- `backlog_categories` - Custom backlog categories per board
- `flyway_schema_history` - Migration tracking

**Key Relationships:**
- `tasks.board_id` → `boards.id` (CASCADE DELETE)
- `tasks.backlog_category_id` → `backlog_categories.id` (SET NULL)
- `backlog_categories.board_id` → `boards.id` (CASCADE DELETE)

### Migrations

Database schema managed with **Flyway**. Migrations located in:
```
backend/src/main/resources/db/migration/
├── V1__initial_schema.sql
├── V2__add_backlog_categories.sql
└── ...
```

**Creating new migrations:**
1. Create file: `V{N}__{description}.sql`
2. Use sequential version numbers (V1, V2, V3, ...)
3. Flyway auto-applies on next backend start
4. **Never modify existing migrations** - always create new ones

**Reset database:**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS issuetracker;"
psql -U postgres -c "CREATE DATABASE issuetracker;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE issuetracker TO issuetracker;"

# Restart application - Flyway will run migrations
pkill -f gradle
./gradlew bootRun
```

## Configuration

### Environment Variables

**Frontend:**
- `NEXT_PUBLIC_API_URL` - API base URL (default: `http://localhost:8080/api`)

**Backend:**

**Database Configuration:**
- `DB_HOST` - Database host (default: `localhost`)
- `DB_PORT` - Database port (default: `5432`)
- `DB_NAME` - Database name (default: `issuetracker`)
- `DB_USER` - Database user (default: `issuetracker`)
- `DB_PASSWORD` - Database password (default: `changeme`)

**Application Configuration:**
- `SPRING_PROFILES_ACTIVE` - Spring profile (`dev` or `prod`)
  - `dev` - Development settings (hardcoded localhost PostgreSQL)
  - `prod` - Production settings (uses environment variables)
- `CORS_ALLOWED_ORIGINS` - **Required for production** - Comma-separated allowed origins (e.g., `https://yourdomain.com,https://www.yourdomain.com`)
- `SERVER_PORT` - Server port (default: `8080`)
- `LOGGING_LEVEL_ROOT` - Log level (default: `INFO`)

**Java Version:**
```bash
# Using jenv
jenv local 21

# Or set JAVA_HOME
export JAVA_HOME=/path/to/java-21
```

## Production Deployment

### Build for Production

```bash
# 1. Build frontend (static export)
cd frontend
npm run build
npm run deploy

# 2. Build backend JAR (includes frontend)
cd ..
./gradlew build

# 3. JAR location
# backend/build/libs/backend-*.jar
```

### Run Production JAR

```bash
java -jar backend/build/libs/backend-*.jar
```

### Environment Configuration

**Required:**
- `SPRING_PROFILES_ACTIVE=prod` - Enable production profile
- Database connection (see below)
- `CORS_ALLOWED_ORIGINS` - Your production domain(s)

**PostgreSQL Database Setup:**

First, create the database:
```sql
CREATE DATABASE issuetracker;
CREATE USER issuetracker WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE issuetracker TO issuetracker;
```

**Run with PostgreSQL:**
```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=issuetracker
export DB_USER=issuetracker
export DB_PASSWORD=your_secure_password
export CORS_ALLOWED_ORIGINS=https://tracker.example.com

java -jar backend/build/libs/backend-*.jar
```

**Or use a .env file and docker-compose** (see [Installation](#installation))

## Architecture Highlights

### Backend Patterns

**R2DBC Persistable Pattern:**
- Entities implement `Persistable<UUID>` interface
- Manual UUID generation via `UUID.randomUUID()`
- Call `.withPersistedFlag()` after loading from DB

**Reactive Streams:**
- Kotlin `Flow` for streaming responses
- Suspend functions for single-value responses
- Non-blocking I/O throughout

### Frontend Patterns

**Optimistic UI Updates:**
- Immediate local state update on user action
- Backend update in background
- Revert only on error

**URL State Management:**
- Board selection: `?board={uuid}`
- View selection: `?view=board|backlog|archive`
- Both required for full state restoration

**Drag & Drop (@dnd-kit/react):**
- Unified API across all views
- Position recalculation from 0 on every move
- Update ALL affected tasks, never use relative positions

## Development Tips

**View backend logs:**
```bash
tail -f /tmp/backend.log
```

**Check health:**
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/boards
```

**Frontend dev server:**
```bash
cd frontend
npm run dev
# Access at http://localhost:3000
```

**Clean build:**
```bash
rm -rf frontend/out frontend/.next backend/src/main/resources/static
```

## Documentation

- **CLAUDE.md** - Development guidelines, architecture patterns, gotchas
- **FEATURES.md** - Detailed feature descriptions and workflows
- **openapi.json** - Complete API specification (OpenAPI 3.0)

## Code Quality

- **Clean Architecture** - Clear separation: Domain, Repository, Service, Controller
- **Type Safety** - TypeScript (strict) + Kotlin type system
- **Reactive** - Non-blocking I/O with coroutines and Flow
- **Validation** - Jakarta Bean Validation on all inputs
- **Error Handling** - Consistent exception handling with meaningful messages

## Security Notes

**Current State (Development):**
- No authentication (single-user mode)
- CORS disabled by default
- Input validation via Bean Validation
- XSS prevention via React auto-escaping

**Production Requirements:**
- ⚠️ **Set `CORS_ALLOWED_ORIGINS`** environment variable
- Add authentication (JWT, OAuth, etc.)
- Enable HTTPS
- Add rate limiting
- Review and sanitize all inputs

## License

MIT

## Support

For detailed development guidelines, see **CLAUDE.md**.
For feature documentation, see **FEATURES.md**.
For API details, see **openapi.json**.
