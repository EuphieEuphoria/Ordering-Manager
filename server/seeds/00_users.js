/**
 * @file Users seed
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports up the Up migration
 * @exports down the Down migration
 */

// Timestamp in the appropriate format for the database
const now = new Date().toISOString().slice(0, 23).replace("T", " ") + " +00:00";

// Array of objects to add to the database
// Array of objects to add to the database
const users = [
  {
    id: 1,
    username: "admin",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    username: "contributor",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    username: "manager",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 4,
    username: "user",
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Apply the seed
 *
 * @param {queryInterface} context the database context to use
 */
export async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert("users", users);
}

/**
 * Roll back the seed
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete("users", {}, { truncate: true });
}
