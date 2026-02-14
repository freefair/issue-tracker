-- Sample board
INSERT INTO boards (id, name, description, created_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Default Board', 'Sample project board', CURRENT_TIMESTAMP);

-- Sample tasks
INSERT INTO tasks (id, board_id, title, description, status, position, tags, created_at, updated_at)
VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000',
     'Setup project structure', 'Initialize Gradle project with Kotlin', 'DONE', 1, 'setup,gradle',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000',
     'Implement domain layer', 'Create entities and repositories', 'IN_PROGRESS', 2, 'backend,domain',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000',
     'Build REST API', 'Implement controllers and services', 'TODO', 3, 'backend,api',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000',
     'Design UI components', 'Create React components with Apple design', 'BACKLOG', 4, 'frontend,design',
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
