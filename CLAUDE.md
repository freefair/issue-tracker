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
