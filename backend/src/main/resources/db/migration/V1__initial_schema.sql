-- Initial schema for issue tracker

-- Boards table
CREATE TABLE boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL,
    position INT NOT NULL,
    tags TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_position ON tasks(position);

-- Comments for documentation
COMMENT ON TABLE boards IS 'Project boards for organizing tasks';
COMMENT ON TABLE tasks IS 'Individual tasks within boards';
COMMENT ON COLUMN tasks.status IS 'Task status: BACKLOG, TODO, IN_PROGRESS, READY_FOR_DEPLOYMENT, DONE';
COMMENT ON COLUMN tasks.position IS 'Position within the status column for drag & drop ordering';
COMMENT ON COLUMN tasks.tags IS 'Comma-separated list of tags';
