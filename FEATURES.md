# Issue Tracker - Features & Functionality

## Project Overview

A modern, full-stack issue tracking application built with Kotlin Spring Boot (backend) and Next.js (frontend). Designed for managing tasks across multiple boards with a powerful Kanban-style interface.

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.x with Kotlin
- **Database:** PostgreSQL (required)
- **Data Access:** Spring Data R2DBC (reactive, non-blocking)
- **Migration:** Flyway for database versioning
- **API Style:** RESTful with reactive streams (Kotlin Flow)

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS
- **Build:** Static export (`output: 'export'`)
- **Drag & Drop:** @dnd-kit (accessible, modern)

## Core Features

### 1. Board Management

**Description:** Organize work into separate boards (projects, teams, or categories).

**Features:**
- Create, edit, and delete boards
- Each board has a name and optional description
- Sidebar navigation for quick board switching
- Filter boards by name (client-side search)
- Active board persisted in URL (`?board={id}`)

**Use Cases:**
- Separate boards per project or team
- Different boards for different product areas
- Personal vs. team boards

---

### 2. Multi-View Task Organization

**Description:** Three distinct views for different workflow stages.

#### Board View (Kanban)
- **4 columns:** To Do, In Progress, Ready for Deployment, Done
- **Drag & Drop:** Move tasks between columns with mouse, touch, or keyboard
- **Position tracking:** Tasks maintain order within columns
- **Visual feedback:** Hover states, drag overlays, smooth animations
- **Accessibility:** Full keyboard navigation, screen reader support

#### Backlog View
- **Dynamic Categories:** Create custom categories (e.g., "Critical", "Nice to have", "Tech Debt")
- **Drag & Drop Categories:** Reorder categories by priority
- **Category Management:** Rename, delete, create categories on the fly
- **Uncategorized Section:** Tasks without category appear at bottom
- **Quick Actions:** Move tasks from Backlog to To Do with one click

#### Archive View
- **Filtered View:** Shows tasks that have been in DONE status for >7 days
- **Search:** Filter archived tasks by title, description, or tags
- **Restore:** Move tasks back to active columns by changing status
- **Clean History:** Keep active boards focused on current work
- **Note:** Archive is a view filter, not a separate storage - tasks remain in DONE status

**View Persistence:**
- Active view stored in URL (`?view=board|backlog|archive`)
- View persists on page refresh and board switching
- Shareable URLs maintain view state

---

### 3. Advanced Task Search

**Description:** Powerful search with structured query syntax and autocomplete.

**Query Syntax:**
- **Free Text:** Search in title, description, tags
- **Structured Filters:**
  - `Board:[Name]` - Search in specific board
  - `Tag:[TagName]` - Filter by tag
  - `Status:[StatusName]` - Filter by status (Backlog, To Do, etc.)

**Features:**
- **Query Chips/Bubbles:** Structured queries become visual chips
- **Autocomplete:**
  - Field names (`Board:`, `Tag:`, `Status:`)
  - Field values (board names, existing tags, status options)
- **Scope Toggle:** Switch between Board (current) and Global (all boards)
- **Smart Focus:** Results only visible when search field is focused
- **Debounced Search:** 300ms delay to reduce API calls
- **Keyboard Shortcuts:**
  - `Cmd+K` / `Ctrl+K` - Focus search
  - Arrow keys - Navigate results
  - Enter - Select result
  - Backspace (empty input) - Remove last chip
  - Esc - Close search

**Search Behavior:**
- Default: `Board: [Current Board]` chip pre-selected
- Add filters without text → Shows all tasks matching filters
- Free text (≥2 chars) → Full-text search
- Combines filters and text search intelligently

---

### 4. Task Management

**CRUD Operations:**
- **Create:** Add tasks to any status column or backlog category
- **Update:** Edit title, description, status, position, tags, category
- **Delete:** Remove tasks with confirmation
- **Move:** Drag & drop or use action buttons

**Task Properties:**
- **Title:** Required (1-500 characters)
- **Description:** Optional, supports multiline text
- **Status:** BACKLOG, TODO, IN_PROGRESS, READY_FOR_DEPLOYMENT, DONE
- **Position:** Numeric ordering within status/category
- **Tags:** Multiple tags, comma-separated storage, displayed as chips
- **Backlog Category:** Optional assignment to custom category
- **Timestamps:** Created at, updated at (auto-managed)

**Task Modal:**
- Click any task to open detailed view
- Edit inline with auto-save
- Tag management with visual chips
- Quick status change buttons
- Delete with confirmation

---

### 5. Backlog Categories

**Description:** Organize backlog tasks into custom, sortable categories.

**Features:**
- **Dynamic Creation:** Create categories on demand
- **Naming:** Custom names (e.g., "Critical", "Low Priority", "Tech Debt")
- **Drag & Drop Ordering:** Reorder categories by importance
- **Task Assignment:** Assign tasks to categories
- **Visual Grouping:** Each category shows task count
- **Actions per Category:**
  - Rename (inline editing)
  - Delete (tasks move to Uncategorized)
  - Add Task (pre-assigns category)

**Implementation:**
- Categories stored with position field
- Foreign key relationship: tasks → categories
- Cascade delete: category deletion sets task.categoryId to null
- Persistent ordering via position updates

---

### 6. Tag System

**Description:** Flexible tagging for cross-cutting organization.

**Features:**
- **Multi-Tag:** Tasks can have unlimited tags
- **Auto-Suggest:** Search shows existing tags for reuse
- **Visual Display:** Tags shown as colored chips
- **Search Integration:** Filter by tag in advanced search
- **Unique Tags per Board:** Tag list scoped to current board

**Use Cases:**
- Label task types (bug, feature, enhancement)
- Technology markers (backend, frontend, database)
- Priority indicators (urgent, important)
- Team assignments (@team-a, @team-b)

---

### 7. Responsive Design

**Desktop (≥768px):**
- Sidebar always visible (240px fixed width)
- Full 4-column Kanban layout
- Horizontal space for drag & drop
- Multi-column category view

**Mobile (<768px):**
- Collapsible sidebar (hamburger menu)
- Sidebar overlay with backdrop
- Touch-optimized drag & drop
- Vertical stacking for columns
- Simplified layouts for small screens

**Touch Support:**
- Touch-optimized drag & drop via @dnd-kit
- Smooth touch scrolling
- Tap to select and open tasks
- Touch-friendly button sizes (minimum 44x44px)

---

### 8. Dark Mode

**Status:** Prepared but not currently active

**Implementation:**
- Tailwind `dark:` classes throughout codebase
- Ready for activation via `class="dark"` on `<html>` tag
- Consistent color scheme defined for all views
- Proper contrast ratios for accessibility

**To Enable:**
- Add system preference detection
- Add manual toggle switch
- Apply `dark` class to root element based on preference

---

### 9. Optimistic UI Updates

**Current Implementation:**
- Immediate local state update on user action
- Backend update in background
- Revert only on error (no re-fetch on success)
- Debounced search to reduce load (300ms)

**Pattern:**
```typescript
// Update state immediately
setTasks(prevTasks => /* optimistic update */);

// Send to backend
try {
  await taskApi.update(taskId, updates);
} catch (err) {
  // Only reload on error
  loadTasks(boardId);
}
```

**Future Enhancements:**
- WebSocket/SSE for live multi-user updates
- Conflict resolution for concurrent edits
- Presence indicators (who's viewing what)

---

## User Workflows

### Starting a New Project
1. Click "+ New Board" in sidebar
2. Enter project name and description
3. Board created, automatically selected
4. Start adding tasks to Backlog

### Processing Backlog
1. Switch to "Backlog" view
2. Create categories: "Critical", "Nice to have", etc.
3. Drag categories to prioritize
4. Add tasks to appropriate categories
5. Move high-priority tasks to "To Do" column

### Daily Work (Kanban)
1. Switch to "Board" view
2. Drag task from "To Do" to "In Progress"
3. Work on task, update description/tags as needed
4. Move to "Ready for Deployment" when done
5. QA verifies, moves to "Done"

### Finding Old Work
1. Switch to "Archive" view
2. Use search to find completed tasks
3. Review past work or restore if needed

### Global Task Search
1. Press `Cmd+K` to open search
2. Type keywords or use structured syntax:
   - `Tag:backend` → All backend tasks
   - `Status:Done` → All completed tasks
3. Toggle to "Global" scope for cross-board search
4. Click result to open task modal

---

## API Features

### RESTful Endpoints
- **Boards:** Full CRUD operations
- **Tasks:** CRUD + search + move operations
- **Categories:** CRUD + position management
- **Tags:** List and filter

### Reactive Streams
- Non-blocking I/O with Kotlin Flow
- Efficient for high-concurrency scenarios
- Backpressure handling built-in

### Search Capabilities
- Board-scoped search: `/api/tasks/search?boardId={id}&q={query}`
- Global search: `/api/tasks/search/global?q={query}`
- Multi-field matching: title, description, tags
- Case-insensitive search
- Deduplication across result sources

### Data Validation
- Jakarta Bean Validation annotations
- Input sanitization at API boundaries
- Constraint violations return clear error messages

---

## Security Features

### Input Validation
- All external input validated (size, format, type)
- No SQL injection (parameterized queries via R2DBC)
- XSS prevention through React's automatic escaping

### Data Integrity
- Foreign key constraints in database
- Cascade delete rules for data consistency
- Transaction support for multi-step operations

### Future Enhancements
- Authentication (JWT, OAuth)
- Authorization (role-based access)
- Rate limiting
- CORS configuration for production

---

## Performance Optimizations

### Frontend
- Static export for fast CDN delivery
- Code splitting (Next.js automatic)
- Image optimization (if applicable)
- Debounced search (300ms)
- Client-side filtering where possible

### Backend
- Reactive, non-blocking I/O (R2DBC)
- Connection pooling
- Indexed database columns (board_id, status, position)
- Efficient query patterns (avoid N+1)

### Caching Strategy (Future)
- Redis for session data
- ETag headers for conditional requests
- Browser caching for static assets

---

## Accessibility (a11y)

### Keyboard Navigation
- Full keyboard support for all interactions
- Tab order follows visual layout
- Focus indicators on all interactive elements
- Escape to close modals/dropdowns

### Drag & Drop
- Keyboard alternative (Space to grab, arrows to move)
- Screen reader announcements for state changes
- Visual feedback for drag states

### Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Meaningful alt text
- Form labels associated with inputs

### Color & Contrast
- WCAG AA compliant contrast ratios
- Not relying solely on color for information
- Focus indicators visible in all themes

---

## Development Features

### Hot Reload
- Frontend: Next.js Fast Refresh
- Backend: Spring Boot DevTools (if enabled)

### Type Safety
- TypeScript on frontend (strict mode)
- Kotlin type system on backend
- Shared type definitions via DTOs

### Code Quality
- ESLint + Prettier (frontend)
- Kotlin formatter (backend)
- Git hooks for pre-commit validation (if configured)

### Database Migrations
- Flyway versioned migrations
- Rollback capability
- Schema evolution tracking

---

## Deployment

### Frontend Build
- Static HTML/CSS/JS export
- Served from backend `/static` directory
- Single deployment artifact

### Backend
- Spring Boot fat JAR
- Embedded Tomcat server
- Environment-based configuration
- Health check endpoint (if implemented)

### Production Considerations
- Configure PostgreSQL with secure credentials
- Enable authentication & authorization
- Set `CORS_ALLOWED_ORIGINS` environment variable
- Set up structured logging (JSON format)
- Monitor with APM tools (e.g., Prometheus, Grafana)
- Regular database backups

---

## Future Roadmap

### Planned Features
- [ ] Dark mode toggle (UI classes already prepared)
- [ ] User authentication & multi-tenancy
- [ ] Real-time collaboration (WebSockets/SSE)
- [ ] File attachments on tasks
- [ ] Comments & activity log
- [ ] Email notifications
- [ ] Advanced reporting & analytics
- [ ] Custom workflows (beyond 4 columns)
- [ ] Task dependencies & blocking
- [ ] Time tracking
- [ ] Sprint/milestone management

### Technical Improvements
- [ ] End-to-end tests (Playwright)
- [ ] API documentation UI (Swagger/OpenAPI)
- [ ] Prometheus metrics
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Database backups & restore

---

## Browser Compatibility

**Supported Browsers:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers:**
- Safari iOS 14+
- Chrome Android 90+

**Progressive Enhancement:**
- Core functionality works without JavaScript (minimal)
- Graceful degradation for older browsers
- Polyfills for critical features (if needed)

---

## License & Contribution

This is a private project. Contribution guidelines and license to be determined.

## Support

For issues or questions, contact the development team or create an issue in the project repository.
