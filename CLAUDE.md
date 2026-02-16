# Code Clarity & Readability

## Comments & Documentation
- Write comments ONLY when code intent isn't obvious from reading
- Use doc-comments (JSDoc, docstrings, XML docs, etc.) when language supports it
- ALL comments and documentation in English
- Avoid redundant comments that just restate the code

## Naming Conventions
- Use descriptive, pronounceable names
- Avoid abbreviations unless universally understood
- Boolean variables: use is/has/can prefixes (isActive, hasPermission)
- Functions: verb-based (getUserData, calculateTotal)
- Classes/Types: noun-based (UserRepository, PaymentService)

## Code Structure & Clean Code Principles
- Follow technology-appropriate structure (framework conventions, ecosystem patterns)
- Single Responsibility Principle: functions/classes do ONE thing well
- Keep functions focused and cohesive
- Extract magic numbers/strings to named constants
- DRY: Don't Repeat Yourself - extract reusable logic
- Boy Scout Rule: leave code cleaner than you found it
- Meaningful distinctions: avoid names that vary only slightly
- Use intention-revealing names over comments

# Architecture & Design Principles

## SOLID Principles
- Single Responsibility: Each class/module has one reason to change
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Subtypes must be substitutable for base types
- Interface Segregation: Many specific interfaces > one general interface
- Dependency Inversion: Depend on abstractions, not concretions

## Core Design Principles
- Separation of Concerns: distinct layers (UI, business logic, data)
- Composition over inheritance
- DRY: Don't Repeat Yourself
- KISS: Keep It Simple, Stupid
- YAGNI: You Aren't Gonna Need It

## Architecture Patterns
- Frontend: MVVM (Model-View-ViewModel) when possible
- Backend: MVC (Model-View-Controller) frequently
- Follow established patterns for the technology stack
- Keep business logic independent of framework/library specifics

## Modularity & Boundaries
- Organize by feature/domain, not by technical layer
- Clear module boundaries with defined interfaces
- Minimize coupling between modules
- High cohesion within modules

# Error Handling & Resilience

## Exception Handling
- Fail fast: detect and report errors immediately
- Handle exceptions at appropriate levels (don't catch too early)
- Never swallow exceptions silently
- Use specific exception types over generic ones
- Provide meaningful error messages with context
- Clean up resources in finally blocks (or language equivalent)

## Defensive Programming
- Validate input at system boundaries (API endpoints, user input, external data)
- Use assertions for internal invariants
- Null/undefined checks for external data
- Graceful degradation when possible

## Logging Strategy
- Log all errors with sufficient context (timestamp, user, operation)
- Use appropriate log levels (ERROR, WARN, INFO, DEBUG)
- Include stack traces for exceptions
- Don't log sensitive data (passwords, tokens, PII)
- Structured logging when supported

## Error Recovery
- Provide fallback mechanisms where critical
- Retry logic with exponential backoff for transient failures
- Circuit breaker pattern for external dependencies
- Clear error boundaries (especially in UI)

# Testing & Quality

## Test-Driven Development (TDD)
- Write tests BEFORE implementation when possible
- Red-Green-Refactor cycle: failing test → make it pass → improve code
- Tests guide design decisions

## Test Structure & Organization
- Arrange-Act-Assert (AAA) pattern
- One assertion concept per test (focused tests)
- Descriptive test names that explain what's being tested
- Group related tests logically

## Test Coverage & Types
- Unit Tests: test individual functions/classes in isolation
- Integration Tests: test component interactions
- E2E Tests: test critical user flows
- Aim for high coverage of business-critical logic
- Don't test framework/library code

## Test Quality
- Tests should be fast and deterministic
- No flaky tests - fix or remove them
- Mock external dependencies (APIs, databases, file system)
- Test edge cases and error conditions, not just happy path
- Keep tests maintainable (refactor tests too)

## Testability
- Write testable code (small, focused functions)
- Avoid tight coupling to make mocking easier
- Dependency injection for better testability

# Security Basics

## Input Validation & Sanitization
- Validate ALL external input (user input, API data, file uploads)
- Whitelist validation over blacklist when possible
- Sanitize data before use (SQL injection, XSS prevention)
- Validate data types, formats, ranges
- Never trust client-side validation alone

## Secrets & Credentials Management
- NEVER commit secrets, API keys, passwords to version control
- Use environment variables or secret management services
- Use different credentials per environment (dev/staging/prod)

## Git Security
- Review .gitignore before first commit
- Use git-secrets or similar tools to prevent secret commits
- If secrets are committed: rotate immediately, use git history rewrite carefully
- Keep dependencies in lock files under version control
- Review dependencies for known vulnerabilities regularly

## Authentication & Authorization
- Never roll your own crypto
- Use established libraries for auth/encryption
- Implement proper session management
- Principle of least privilege for permissions
- Validate authorization on backend, not just frontend

## Common Vulnerabilities
- Protect against: SQL Injection, XSS, CSRF, Path Traversal
- Use parameterized queries/prepared statements
- Escape output appropriately for context
- Implement rate limiting for APIs
- Keep dependencies updated (security patches)

## Data Protection
- Don't log sensitive data (passwords, tokens, PII, credit cards)
- Encrypt sensitive data at rest and in transit
- Minimize data collection (only what's necessary)
- Implement proper data retention policies

# Version Control & Collaboration

## Commit Messages
- Write in English as readable sentences or bullet points
- Use imperative mood ("Add feature" not "Added feature")
- First line: concise summary (50-72 chars)
- Blank line, then detailed explanation if needed
- Explain WHY, not just WHAT
- Reference issue/ticket numbers when applicable
- **NO "Co-Authored-by" tags**

Examples:
- ✓ "Add user authentication with JWT tokens"
- ✓ "Fix memory leak in image cache"
- ✓ "Refactor payment processing for better error handling"

## Branching Strategy
- Work on main/master branch by default
- Create branches ONLY when:
  - Explicitly requested
  - Code review is required
  - Feature requires isolation
- Branch naming: descriptive and kebab-case (feature/user-auth, fix/memory-leak)

## Code Review Standards
- Review for: logic correctness, security issues, maintainability
- Provide constructive feedback
- Approve only when you'd be comfortable maintaining the code
- Check test coverage
- Verify no secrets in commits

## Commit Hygiene
- Atomic commits: each commit is a logical unit
- Don't commit commented-out code
- Don't commit TODO comments without tracking
- Keep commits focused (one concern per commit)
- Run tests before committing

---

# Project-Specific Information

## Tech Stack

### Backend
- **Language:** Kotlin 1.9+
- **Framework:** Spring Boot 3.x with WebFlux (reactive)
- **Database:** H2 (development), R2DBC for reactive access
- **Migrations:** Flyway
- **Build:** Gradle with Kotlin DSL

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS
- **Drag & Drop:** @dnd-kit
- **Build:** Static export served from backend

## Project Structure

```
issue-tracker/
├── backend/
│   └── src/main/
│       ├── kotlin/com/issuetracker/
│       │   ├── domain/          # Entities (Persistable pattern)
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── repository/      # R2DBC repositories
│       │   ├── service/         # Business logic
│       │   ├── web/             # Controllers (REST endpoints)
│       │   └── exception/       # Custom exceptions
│       └── resources/
│           ├── db/migration/    # Flyway SQL migrations
│           └── static/          # Deployed frontend (auto-generated)
└── frontend/
    ├── app/                     # Next.js App Router pages
    ├── components/              # React components
    ├── lib/                     # API client, utilities
    ├── types/                   # TypeScript interfaces
    └── out/                     # Build output (→ backend/static)
```

## Key Architecture Patterns

### Backend: Spring Data R2DBC Persistable Pattern
- **Problem:** R2DBC doesn't auto-generate UUIDs like JPA
- **Solution:** Implement `Persistable<UUID>` interface
- **Pattern:**
  ```kotlin
  @Table("table_name")
  data class Entity(
      @Id
      private val id: UUID? = null,
      // other fields
  ) : Persistable<UUID> {
      @Transient
      private var new: Boolean = true

      override fun getId(): UUID? = id
      override fun isNew(): Boolean = new

      fun withPersistedFlag(): Entity {
          this.new = false
          return this
      }
  }
  ```
- **Usage:** Call `.withPersistedFlag()` after loading from DB in service layer
- **Reason:** Prevents UPDATE errors on existing entities

### Frontend: Static Export with Backend Serving
- Frontend builds to `out/` directory
- Deployment script copies `out/` → `backend/src/main/resources/static/`
- Backend serves frontend from `/static` (Spring Boot default)
- **Single JAR deployment** with embedded frontend

### URL State Management
- Board selection: `?board={uuid}`
- View selection: `?view=board|backlog|archive`
- Both parameters required for full state restoration
- Sidebar links preserve current view when switching boards

### Task Search Architecture
- **Component:** `TaskSearch.tsx` with query chip pattern
- **Chips:** Board, Tag, Status become visual bubbles
- **Autocomplete:** Field names and values
- **Debounce:** 300ms to reduce API load
- **Focus-aware:** Results only show when input focused
- **Dual endpoints:**
  - Board-scoped: `/api/tasks/search?boardId={id}&q={query}`
  - Global: `/api/tasks/search/global?q={query}`

### Drag & Drop Architecture (@dnd-kit)
- **Unified API Usage (NEW @dnd-kit/react):**
  - All views now use the **new @dnd-kit/react API** for consistency
  - `BacklogView`: DragDropProvider with useSortable for categories and tasks
  - `BoardView`: DragDropProvider with useSortable for columns and tasks
  - `Column`: useSortable for droppable columns with nested SortableTask components
  - `TaskCardView`: Pure presentation component (no drag logic)
  - **No legacy @dnd-kit/core or @dnd-kit/sortable** - all migrated to @dnd-kit/react

- **Optimistic Updates Pattern:**
  ```typescript
  // In page.tsx (parent component)
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // 1. Optimistic UI update - immediate feedback
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );

    // 2. Backend update
    try {
      await taskApi.update(taskId, updates);
    } catch (err) {
      // 3. Revert on error
      loadTasks(currentBoard.id);
    }
  };
  ```

- **BacklogView onDragEnd Pattern:**
  ```typescript
  onDragEnd: async (event) => {
    // Get target from drag data, NOT from task state
    const targetGroup = target.data?.group || String(target.id);
    const targetCategoryId = targetGroup === 'uncategorized' ? undefined : targetGroup;

    // Build updates list
    const updates = [];

    if (categoryChanged) {
      // 1. Reindex source category (all tasks)
      sourceTasksWithoutMoved.forEach((task, index) => {
        updates.push({ id: task.id, updates: { position: index } });
      });

      // 2. Insert moved task into target and reindex (all tasks)
      targetWithInserted.forEach((task, index) => {
        if (task.id === movedTask.id) {
          // CRITICAL: Update BOTH position AND category
          updates.push({
            id: task.id,
            updates: { position: index, backlogCategoryId: targetCategoryId }
          });
        } else {
          updates.push({ id: task.id, updates: { position: index } });
        }
      });
    }

    // Execute ALL updates (no position checks)
    for (const { id, updates: taskUpdates } of updates) {
      await onUpdateTask(id, taskUpdates);
    }
  }
  ```

- **Position Management Rules:**
  - Always recalculate from 0 (0, 1, 2, 3, ...)
  - Never use relative adjustments (position - 1, position + 1)
  - Update ALL affected tasks, not just the moved task
  - No position checks (`if (task.position !== index)`) - always send updates
  - Backend validates: position must be >= 0

- **Category Reordering:**
  - Handle `source.type === 'category'` in onDragEnd
  - Update all category positions in backend
  - Use optimistic local state update (`setCategories`)
  - Reload on error to revert

## Database Schema Notes

### Tables
- `boards` - Board definitions
- `tasks` - All tasks with foreign key to boards
- `backlog_categories` - Custom backlog categories per board
- `flyway_schema_history` - Migration tracking

### Key Constraints
- `tasks.board_id` → `boards.id` (CASCADE DELETE)
- `tasks.backlog_category_id` → `backlog_categories.id` (SET NULL)
- `backlog_categories.board_id` → `boards.id` (CASCADE DELETE)

### Indexes
- `idx_tasks_board_id` on `tasks(board_id)`
- `idx_tasks_backlog_category_id` on `tasks(backlog_category_id)`
- `idx_backlog_categories_board_id` on `backlog_categories(board_id)`

## Common Development Tasks

### Deploy & Restart
```bash
# Build and deploy frontend
cd frontend && npm run deploy

# Restart backend
pkill -f "gradle.*bootRun"
sleep 2
cd /Users/dennisfricke/Projekte/TFSolution/issue-tracker
./gradlew bootRun > /tmp/backend.log 2>&1 &

# Verify backend
sleep 8 && curl -s http://localhost:8080/api/boards | jq
```

### Add New Migration
1. Create file: `backend/src/main/resources/db/migration/V{N}__{description}.sql`
2. Use sequential version numbers (V1, V2, V3, ...)
3. Flyway auto-applies on next backend start
4. **Never modify existing migrations** - create new ones

### Add New API Endpoint
1. Define DTO in `dto/` package
2. Add repository method (if needed)
3. Add service method with business logic
4. Add controller endpoint
5. Update `openapi.json` specification
6. Add frontend API method in `lib/api.ts`

### Update Documentation
- **FEATURES.md** - When adding/changing user-facing features
- **openapi.json** - When adding/changing API endpoints
- **CLAUDE.md** - When discovering important patterns or decisions
- **Commit regularly** with clear messages

## Important Gotchas

### Backend
- ⚠️ **Manual UUID generation required** - Use `UUID.randomUUID()` in service
- ⚠️ **Call `.withPersistedFlag()`** after loading entities from DB
- ⚠️ **Private `id` field** in entities to avoid JVM signature conflicts
- ⚠️ **Mutable `new` flag** in Persistable entities (not `val`)
- ⚠️ **Reactive Flows** - Use `.collect {}` not `.forEach {}`

### Frontend
- ⚠️ **'use client'** directive required for interactive components
- ⚠️ **URL updates** must include both `board` and `view` parameters
- ⚠️ **Search focus state** - Results only visible when focused
- ⚠️ **Static export** - Dynamic routes need `generateStaticParams()`
- ⚠️ **Debounce searches** to avoid excessive API calls

### Drag & Drop (@dnd-kit)
- ✅ **Unified API** - All components now use @dnd-kit/react (no more API mixing)
- ⚠️ **Target Group** - Get targetGroup from `target.data.group`, NOT from `targetTask.backlogCategoryId`
- ⚠️ **Moved Task Updates** - ALWAYS update BOTH position AND backlogCategoryId for moved tasks
- ⚠️ **Position Recalculation** - Recalculate ALL positions from 0, never use relative adjustments (position - 1)
- ⚠️ **Update ALL Tasks** - Send updates for ALL affected tasks, don't skip based on position checks
- ⚠️ **Category Reordering** - Handle both `source.type === 'task'` AND `source.type === 'category'` in onDragEnd

### Optimistic UI Updates
- ⚠️ **Parent Updates** - Optimistic updates MUST happen in parent (page.tsx), not in child components
- ⚠️ **useEffect Override** - BacklogView's useEffect overwrites local tasksByCategory state based on tasks prop
- ⚠️ **No Full Reloads** - Never call loadTasks() after update - use optimistic state updates instead
- ⚠️ **Error Revert** - Only reload data on error to revert optimistic changes
- ⚠️ **handleUpdateTask Pattern** - Update state immediately, send to backend, only reload on error
- ⚠️ **handleDeleteTask Pattern** - Remove from state immediately, send to backend, only reload on error

### Deployment
- ⚠️ **Order matters:** Build frontend BEFORE starting backend
- ⚠️ **Kill backend first** before deploying new frontend
- ⚠️ **Sleep between** kill and restart for clean shutdown
- ⚠️ **Check logs** at `/tmp/backend.log` if backend doesn't start

## Feature Flags / Configuration

### Environment Variables

**Frontend:**
- `NEXT_PUBLIC_API_URL` - API base URL (default: http://localhost:8080/api)

**Backend:**
- `CORS_ALLOWED_ORIGINS` - **CRITICAL** - Comma-separated list of allowed origins for CORS (e.g., `https://yourdomain.com,https://www.yourdomain.com`). Required for production deployment under a specific URL.
- Database connection configured in `application.properties`

### Build Modes
- Frontend: `npm run build` (static export)
- Backend: `./gradlew bootRun` (development) or `./gradlew build` (JAR)

## Testing Strategy

### Current State
- Manual testing via browser
- API testing via curl/Postman

### Future Enhancements
- Backend: JUnit 5 + MockK for Kotlin
- Frontend: Jest + React Testing Library
- E2E: Playwright for critical flows

## Performance Considerations

### Backend
- R2DBC connection pool sizing
- Reactive streams prevent blocking
- Indexed columns for common queries

### Frontend
- Debounced search (300ms)
- Client-side filtering where possible (boards, tags)
- Static export for fast CDN delivery

## Security Notes

### Current Implementation
- No authentication (development mode)
- Input validation via Jakarta Bean Validation
- XSS prevention via React auto-escaping
- CORS configuration via `CORS_ALLOWED_ORIGINS` environment variable

### Production Requirements
- Add JWT authentication
- Configure CORS properly (set `CORS_ALLOWED_ORIGINS` to production domains)
- Add rate limiting
- Enable HTTPS
- Sanitize all inputs
- Implement authorization

## Useful Commands

```bash
# View backend logs
tail -f /tmp/backend.log

# Check backend health
curl http://localhost:8080/api/boards

# Build frontend only
cd frontend && npm run build

# Clean build
rm -rf frontend/out backend/src/main/resources/static

# Database reset (H2 in-memory resets on restart)
pkill -f gradle && ./gradlew bootRun

# Git log with pretty format
git log --oneline --graph --all

# Check for uncommitted changes
git status --short
```

## Documentation Maintenance

### When to Update FEATURES.md
- New user-facing feature added
- Existing feature behavior changed
- New workflow or use case discovered

### When to Update openapi.json
- New endpoint added
- Endpoint path or method changed
- Request/response schema modified
- New query parameters or headers

### When to Update CLAUDE.md
- New architectural pattern discovered
- Important gotcha identified
- Common task procedure documented
- Configuration or environment change

**Frequency:** Update docs in same commit as code changes or in follow-up commit immediately after.
