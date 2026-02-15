import 'cypress-axe';

/**
 * Accessibility Tests (WCAG 2.1 Level AA)
 * Uses cypress-axe to check for accessibility violations
 */
describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  describe('Page-level Accessibility', () => {
    it('should have no accessibility violations on home page', () => {
      cy.checkA11y();
    });

    it('should have no violations in board view', () => {
      cy.get('[data-testid="view-toggle-board"]').click();
      cy.checkA11y();
    });

    it('should have no violations in backlog view', () => {
      cy.get('[data-testid="view-toggle-backlog"]').click();
      cy.checkA11y();
    });

    it('should have no violations in archive view', () => {
      cy.get('[data-testid="view-toggle-archive"]').click();
      cy.checkA11y();
    });
  });

  describe('Modal Accessibility', () => {
    it('should have no violations in task modal', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="task-modal"]').should('be.visible');
      cy.checkA11y('[role="dialog"]');
    });

    it('should have no violations in create board modal', () => {
      cy.get('[data-testid="create-board-button"]').click();
      cy.get('[data-testid="board-modal"]').should('be.visible');
      cy.checkA11y('[role="dialog"]');
    });

    it('should have no violations in create task modal', () => {
      cy.get('[data-testid="column-TODO"]').within(() => {
        cy.get('[data-testid="add-task-button"]').click();
      });
      cy.get('[data-testid="task-modal"]').should('be.visible');
      cy.checkA11y('[role="dialog"]');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard-only navigation', () => {
      // Focus search with Cmd+K
      cy.get('body').type('{cmd}k');
      cy.get('[data-testid="search-input"]').should('have.focus');

      // Tab through interactive elements
      cy.focused().type('{tab}');
      cy.focused().should('have.attr', 'role');

      // ESC to close search
      cy.get('body').type('{esc}');
      cy.get('[data-testid="search-results"]').should('not.exist');
    });

    it('should open task modal with Enter key', () => {
      cy.get('[data-testid="task-card"]').first().focus().type('{enter}');
      cy.get('[data-testid="task-modal"]').should('be.visible');
    });

    it('should close modal with ESC key', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="task-modal"]').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="task-modal"]').should('not.exist');
    });

    it('should navigate search results with arrow keys', () => {
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('{downarrow}');
      cy.get('[data-testid="search-result-item"]').first().should('have.class', 'selected');
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast', () => {
      cy.checkA11y(undefined, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    it('should have sufficient contrast in dark mode', () => {
      cy.get('[data-testid="theme-toggle"]').click();
      cy.checkA11y(undefined, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44x44px touch targets for buttons', () => {
      cy.get('[role="button"]').each($btn => {
        cy.wrap($btn).invoke('outerWidth').should('be.gte', 44);
        cy.wrap($btn).invoke('outerHeight').should('be.gte', 44);
      });
    });

    it('should have minimum 44x44px touch targets for task cards', () => {
      cy.get('[data-testid="task-card"]').each($card => {
        cy.wrap($card).invoke('outerHeight').should('be.gte', 44);
      });
    });

    it('should have minimum 44x44px touch targets for board items', () => {
      cy.get('[data-testid="board-item"]').each($item => {
        cy.wrap($item).invoke('outerHeight').should('be.gte', 44);
      });
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators on all interactive elements', () => {
      cy.get('button, a, input, [role="button"]').each($el => {
        cy.wrap($el)
          .focus()
          .then($focused => {
            const focusOutline = $focused.css('outline');
            const focusRing = $focused.css('box-shadow');
            expect(focusOutline !== 'none' || focusRing !== 'none').to.be.true;
          });
      });
    });

    it('should trap focus within modal', () => {
      cy.get('[data-testid="task-card"]').first().click();
      cy.get('[data-testid="task-modal"]').should('be.visible');

      // Tab should cycle within modal
      cy.focused().type('{tab}');
      cy.focused().parents('[role="dialog"]').should('exist');

      // Shift+Tab should also stay within modal
      cy.focused().type('{shift}{tab}');
      cy.focused().parents('[role="dialog"]').should('exist');
    });

    it('should restore focus after closing modal', () => {
      const taskCard = cy.get('[data-testid="task-card"]').first();
      taskCard.click();
      cy.get('[data-testid="task-modal"]').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="task-modal"]').should('not.exist');
      taskCard.should('have.focus');
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      cy.get('button').each($btn => {
        const hasLabel =
          $btn.attr('aria-label') || $btn.attr('aria-labelledby') || $btn.text().trim().length > 0;
        expect(hasLabel).to.be.true;
      });
    });

    it('should have proper ARIA roles on custom components', () => {
      cy.get('[data-testid="search-input"]').should('have.attr', 'role', 'searchbox');
      cy.get('[data-testid="board-list"]').should('have.attr', 'role', 'list');
    });

    it('should announce dynamic content changes', () => {
      cy.get('[data-testid="create-board-button"]').click();
      cy.get('[data-testid="board-name-input"]').type('New Board');
      cy.get('[data-testid="submit-board"]').click();

      // Should have aria-live region for announcements
      cy.get('[aria-live="polite"]').should('contain', 'Board created successfully');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have semantic HTML structure', () => {
      cy.get('header').should('exist');
      cy.get('nav').should('exist');
      cy.get('main').should('exist');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
        let previousLevel = 0;
        $headings.each((_, heading) => {
          const level = parseInt(heading.tagName.charAt(1));
          expect(level).to.be.at.most(previousLevel + 1);
          previousLevel = level;
        });
      });
    });

    it('should have descriptive labels for form inputs', () => {
      cy.get('[data-testid="create-board-button"]').click();
      cy.get('input, textarea, select').each($input => {
        const hasLabel =
          $input.attr('aria-label') ||
          $input.attr('aria-labelledby') ||
          cy.get(`label[for="${$input.attr('id')}"]`).should('exist');
        expect(hasLabel).to.exist;
      });
    });

    it('should announce loading states', () => {
      cy.intercept('/api/boards', { delay: 1000, body: [] });
      cy.reload();
      cy.get('[aria-busy="true"]').should('exist');
      cy.get('[aria-label*="Loading"]').should('exist');
    });
  });

  describe('Form Accessibility', () => {
    it('should associate error messages with form fields', () => {
      cy.get('[data-testid="create-board-button"]').click();
      cy.get('[data-testid="submit-board"]').click();

      cy.get('[data-testid="board-name-input"]').should('have.attr', 'aria-invalid', 'true');
      cy.get('[data-testid="board-name-input"]').should('have.attr', 'aria-describedby');

      const errorId = cy.get('[data-testid="board-name-input"]').invoke('attr', 'aria-describedby');
      cy.get(`#${errorId}`).should('contain', 'required');
    });

    it('should support autocomplete attributes', () => {
      cy.get('[data-testid="search-input"]').should('have.attr', 'autocomplete');
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should be accessible on mobile viewport', () => {
      cy.checkA11y();
    });

    it('should have accessible mobile navigation', () => {
      cy.get('[data-testid="mobile-menu-toggle"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="mobile-menu-toggle"]').click();
      cy.get('[data-testid="sidebar"]').should('be.visible');
    });

    it('should support touch gestures', () => {
      // Verify swipe actions have keyboard alternatives
      cy.get('[data-testid="task-card"]').first().trigger('swipeleft');
      cy.get('[data-testid="task-actions"]').should('be.visible');

      // Should also be accessible via keyboard
      cy.get('[data-testid="task-card"]').first().focus().type('{enter}');
      cy.get('[data-testid="task-modal"]').should('be.visible');
    });
  });

  describe('Reduced Motion', () => {
    it('should respect prefers-reduced-motion', () => {
      cy.window().then(win => {
        win.matchMedia = query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        });
      });

      cy.reload();

      // Animations should be disabled or significantly reduced
      cy.get('[data-testid="task-card"]')
        .first()
        .should('have.css', 'transition-duration')
        .and('match', /^0(s|ms)$/);
    });
  });
});
