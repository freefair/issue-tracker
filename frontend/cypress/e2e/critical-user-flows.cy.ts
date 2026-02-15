describe('Critical User Flows', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Board Management', () => {
    it('should display boards in sidebar', () => {
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.get('[data-testid="board-list"]').should('exist');
    });

    it('should create a new board', () => {
      cy.get('[data-testid="create-board-button"]').click();
      cy.get('[data-testid="board-name-input"]').type('Test Project');
      cy.get('[data-testid="board-description-input"]').type('Test Description');
      cy.get('[data-testid="submit-board"]').click();
      cy.contains('Test Project').should('be.visible');
    });

    it('should switch between boards', () => {
      cy.get('[data-testid="board-list"]').find('[data-testid="board-item"]').first().click();
      cy.url().should('include', 'board=');
    });
  });

  describe('Task Management', () => {
    it('should create a task in TODO column', () => {
      cy.get('[data-testid="column-TODO"]').within(() => {
        cy.get('[data-testid="add-task-button"]').click();
      });
      cy.get('[data-testid="task-title-input"]').type('Implement feature X');
      cy.get('[data-testid="task-description-input"]').type('Description here');
      cy.get('[data-testid="submit-task"]').click();
      cy.contains('Implement feature X').should('be.visible');
    });

    it('should edit a task', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="edit-task-button"]').click();
      cy.get('[data-testid="task-title-input"]').clear().type('Updated Task Title');
      cy.get('[data-testid="submit-task"]').click();
      cy.contains('Updated Task Title').should('be.visible');
    });

    it('should delete a task with confirmation', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="delete-task-button"]').click();
      cy.get('[data-testid="confirm-delete"]').click();
      cy.get('[data-testid="task-card"]').should('not.exist');
    });

    it('should add tags to a task', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="task-tags-input"]').type('urgent{enter}');
      cy.get('[data-testid="task-tags-input"]').type('backend{enter}');
      cy.get('[data-testid="submit-task"]').click();
      cy.get('[data-testid="task-card"]')
        .first()
        .within(() => {
          cy.contains('urgent').should('be.visible');
          cy.contains('backend').should('be.visible');
        });
    });
  });

  describe('Search Functionality', () => {
    it('should focus search with Cmd+K', () => {
      cy.get('body').type('{cmd}k');
      cy.get('[data-testid="search-input"]').should('have.focus');
    });

    it('should search with free text', () => {
      cy.get('[data-testid="search-input"]').type('urgent bug');
      cy.get('[data-testid="search-results"]').should('be.visible');
    });

    it('should search with Board chip', () => {
      cy.get('[data-testid="search-input"]').type('Board:ProjectA urgent');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="query-chip"]').contains('Board:ProjectA').should('exist');
    });

    it('should search with Tag chip', () => {
      cy.get('[data-testid="search-input"]').type('Tag:urgent');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="query-chip"]').contains('Tag:urgent').should('exist');
    });

    it('should close search with ESC', () => {
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="search-results"]').should('not.exist');
    });
  });

  describe('Backlog Management', () => {
    it('should create a backlog category', () => {
      cy.get('[data-testid="view-toggle-backlog"]').click();
      cy.get('[data-testid="create-category-button"]').click();
      cy.get('[data-testid="category-name-input"]').type('High Priority');
      cy.get('[data-testid="submit-category"]').click();
      cy.contains('High Priority').should('be.visible');
    });

    it('should add task to category', () => {
      cy.get('[data-testid="view-toggle-backlog"]').click();
      cy.get('[data-testid="category-section"]')
        .first()
        .within(() => {
          cy.get('[data-testid="add-task-to-category"]').click();
        });
      cy.get('[data-testid="task-title-input"]').type('Task in category');
      cy.get('[data-testid="submit-task"]').click();
      cy.contains('Task in category').should('be.visible');
    });

    it('should move task from backlog to board', () => {
      cy.get('[data-testid="view-toggle-backlog"]').click();
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="move-to-board-button"]').click();
      cy.get('[data-testid="select-status"]').select('TODO');
      cy.get('[data-testid="confirm-move"]').click();
      cy.get('[data-testid="view-toggle-board"]').click();
      cy.get('[data-testid="column-TODO"]').within(() => {
        cy.get('[data-testid="task-card"]').should('exist');
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should drag task to different column', () => {
      const dataTransfer = new DataTransfer();
      cy.get('[data-testid="column-TODO"]')
        .find('[data-testid="task-card"]')
        .first()
        .trigger('dragstart', { dataTransfer });

      cy.get('[data-testid="column-IN_PROGRESS"]').trigger('drop', { dataTransfer });

      cy.get('[data-testid="column-IN_PROGRESS"]')
        .find('[data-testid="task-card"]')
        .should('have.length.at.least', 1);
    });

    it('should reorder tasks within column', () => {
      cy.get('[data-testid="column-TODO"]')
        .find('[data-testid="task-card"]')
        .first()
        .as('firstTask');

      cy.get('[data-testid="column-TODO"]')
        .find('[data-testid="task-card"]')
        .eq(1)
        .as('secondTask');

      cy.get('@firstTask').then($el => {
        const firstTaskText = $el.text();
        const dataTransfer = new DataTransfer();

        cy.get('@firstTask').trigger('dragstart', { dataTransfer });
        cy.get('@secondTask').trigger('drop', { dataTransfer });

        cy.get('[data-testid="column-TODO"]')
          .find('[data-testid="task-card"]')
          .eq(1)
          .should('contain', firstTaskText);
      });
    });
  });

  describe('Archive View', () => {
    it('should display archived tasks', () => {
      cy.get('[data-testid="view-toggle-archive"]').click();
      cy.get('[data-testid="archive-view"]').should('be.visible');
      cy.get('[data-testid="archived-tasks"]').should('exist');
    });

    it('should search within archived tasks', () => {
      cy.get('[data-testid="view-toggle-archive"]').click();
      cy.get('[data-testid="search-input"]').type('old task');
      cy.get('[data-testid="search-results"]').within(() => {
        cy.get('[data-testid="task-card"]').should('have.attr', 'data-archived', 'true');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with Tab key', () => {
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'data-testid');
    });

    it('should open modal with Enter key', () => {
      cy.get('[data-testid="task-card"]').first().focus().type('{enter}');
      cy.get('[data-testid="task-modal"]').should('be.visible');
    });

    it('should close modal with ESC key', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('body').type('{esc}');
      cy.get('[data-testid="task-modal"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should display error message on network failure', () => {
      cy.intercept('POST', '/api/tasks', { forceNetworkError: true });
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-title-input"]').type('Test Task');
      cy.get('[data-testid="submit-task"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Network error');
    });

    it('should display validation error for empty title', () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="submit-task"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Title is required');
    });

    it('should recover from error boundary', () => {
      // Trigger component error by dispatching error event
      cy.window().then(win => {
        const errorEvent = new Event('error');
        win.dispatchEvent(errorEvent);
      });
      cy.get('[data-testid="error-boundary"]').should('be.visible');
      cy.get('[data-testid="refresh-button"]').click();
      cy.get('[data-testid="error-boundary"]').should('not.exist');
    });
  });
});
