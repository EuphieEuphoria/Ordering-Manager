/**
 * @file movementTypes seed
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports up the Up migration
 * @exports down the Down migration
 */

// Timestamp in the appropriate format for the database
const now = new Date().toISOString().slice(0, 23).replace("T", " ") + " +00:00";

// Array of objects to add to the database
const movementTypes = [
  {
    id: 1,
    type: "Out of Date",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    type: "Damaged",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    type: "Adjustment",
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Apply the migration
 *
 * @param {queryInterface} context the database context to use
 */
export async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert("movement_types", movementTypes);
}

/**
 * Roll back the migration
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete("movement_types", {}, { truncate: true });
}
