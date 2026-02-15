CREATE TABLE backlog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_backlog_category_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX idx_backlog_categories_board_id ON backlog_categories(board_id);

-- Add backlog_category_id to tasks table
ALTER TABLE tasks ADD COLUMN backlog_category_id UUID;
ALTER TABLE tasks ADD CONSTRAINT fk_task_backlog_category FOREIGN KEY (backlog_category_id) REFERENCES backlog_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_backlog_category_id ON tasks(backlog_category_id);
