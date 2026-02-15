/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';
import 'cypress-axe';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to seed the database with test data
       * @example cy.seedDatabase()
       */
      seedDatabase(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('seedDatabase', () => {
  // TODO: Implement database seeding logic
  cy.log('Seeding database with test data...');
});

export {};
