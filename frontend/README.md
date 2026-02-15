# Issue Tracker

Modern, accessible issue tracking application with Kanban boards, backlog management, and advanced search capabilities.

## Features

### Core Functionality
- **Multi-board Support**: Manage multiple projects with independent boards
- **Kanban Board View**: Visualize workflow with To Do, In Progress, Ready for Deployment, and Done columns
- **Backlog Management**: Organize tasks with custom categories before moving to the board
- **Advanced Search**: Query with chips (e.g., `Board:ProjectA Tag:urgent Status:TODO`)
- **Auto-Archive**: Automatically archive completed tasks older than 7 days
- **Drag & Drop**: Intuitive task reordering with mouse, touch, and keyboard support

### Technical Features
- **Feature-Based Architecture**: Clean separation of concerns by business domain
- **SOLID Principles**: Single Responsibility, Dependency Inversion throughout
- **Comprehensive Testing**: 161 unit tests with 80%+ coverage
- **Error Handling**: Retry logic, user-friendly error messages, error boundaries
- **Type Safety**: Strict TypeScript with no `any` types
- **Code Quality**: Zero ESLint warnings, Prettier formatting, pre-commit hooks

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **State Management**: React Context API with custom hooks
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **Testing**: Vitest (unit/component), Cypress (E2E)
- **Code Quality**: ESLint 9, Prettier, Husky, lint-staged

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Kotlin
- **Database**: H2 (development), PostgreSQL (production)
- **API**: RESTful with OpenAPI documentation

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd issue-tracker
   ```

2. **Start the backend**
   ```bash
   cd backend
   ./gradlew bootRun
   ```
   Backend runs on http://localhost:8080

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:3000

4. **Run tests**
   ```bash
   cd frontend
   npm test              # Unit tests
   npm run cypress:open  # E2E tests
   ```

## Architecture

### Feature-Based Structure
```
frontend/features/
├── board-management/     # Boards: CRUD, filtering (44 tests)
├── task-management/      # Tasks: CRUD, filters, drag & drop (61 tests)
├── search/               # Search with query chips (16 tests)
└── backlog-categories/   # Category management
```

Each feature contains ALL related code (not split by type):
- ✅ Components, hooks, services, types, tests together
- ❌ NOT `/hooks`, `/contexts`, `/components` at root

### Clean Code & SOLID
- **Single Responsibility**: Each module has one reason to change
- **No Magic Numbers**: All constants in `app-constants.ts`
- **DRY**: No code duplication
- **Error Boundaries**: Graceful degradation

## Development

### Pre-commit Hooks
Automatically runs on `git commit`:
- ESLint --fix
- Prettier --write  
- TypeScript check
- Unit tests

### Search Query Syntax
```bash
urgent bug                      # Free text
Board:ProjectA urgent           # Board-scoped
Tag:frontend Tag:bug critical   # Tag filtering
Status:TODO high priority       # Status filtering
```

## Testing

**161 tests passing** across all features:
```bash
npm test                 # Run all unit tests
npm run test:coverage    # With coverage report
npm run cypress:open     # E2E tests
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with Clean Code principles and SOLID architecture**
