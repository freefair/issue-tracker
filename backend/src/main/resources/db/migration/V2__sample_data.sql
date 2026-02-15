-- Sample data for development and testing

-- Sample board
INSERT INTO boards (id, name, description, created_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Default Board', 'Sample project board', CURRENT_TIMESTAMP);

-- Sample tasks demonstrating all statuses
INSERT INTO tasks (id, board_id, title, description, status, position, tags, created_at, updated_at)
VALUES
    -- DONE
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000',
     'Setup project structure', 'Initialize Gradle project with Kotlin and Spring Boot', 'DONE', 1, 'setup,gradle',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- IN_PROGRESS
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000',
     'Implement REST API', 'Create controllers and services for boards and tasks', 'IN_PROGRESS', 1, 'backend,api',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- TODO
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000',
     'Build frontend', 'Create Next.js application with Apple-inspired design', 'TODO', 1, 'frontend,nextjs',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000',
     'Add drag & drop', 'Implement task reordering with @dnd-kit', 'TODO', 2, 'frontend,interaction',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- BACKLOG
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000',
     'User authentication', 'Add login and user management', 'BACKLOG', 1, 'backend,security',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000',
     'Real-time updates', 'WebSocket support for live collaboration', 'BACKLOG', 2, 'backend,websocket',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
