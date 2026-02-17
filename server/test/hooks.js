/**
 * @file Root Mocha Hooks
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports mochaHooks A Mocha Root Hooks Object
 */

// Load environment (must be first)
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config({ path: ".env.test" });

// Import libraries
import sinon from "sinon";

// Import configuration
import database from "../configs/database.js";
import migrations from "../configs/migrations.js";
import seeds from "../configs/seeds.js";

// Root Hook Runs Before Each Test
export const mochaHooks = {
  // Hook runs once before any tests are executed
  beforeAll(done) {
    // Test database connection
    database.authenticate().then(() => {
      // Run migrations
      migrations.up().then(() => {
        done();
      });
    });
  },

  // Hook runs before each individual test
  beforeEach(done) {
    // Seed the database
    seeds.up().then(() => {
      done();
    });
  },

  // Hook runs after each individual test
  afterEach(done) {
    // Restore Sinon mocks
    sinon.restore();

    // Remove all data from the database
    seeds.down({ to: 0 }).then(() => {
      done();
    });
  },
};
