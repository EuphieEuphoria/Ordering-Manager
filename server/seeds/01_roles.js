/**
 * @file Roles seed
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports up the Up migration
 * @exports down the Down migration
 */

// Timestamp in the appropriate format for the database
const now = new Date().toISOString().slice(0, 23).replace("T", " ") + " +00:00";

// Array of objects to add to the database
const roles = [
  {
    id: 1,
    role: "manage_users",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    role: "manage_products",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    role: "manage_orders",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 4,
    role: "manage_movements",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 5,
    role: "manage_suppliers",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 6,
    role: "view_products",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 7,
    role: "view_movements",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 8,
    role: "view_orders",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 9,
    role: "view_suppliers",
    createdAt: now,
    updatedAt: now,
  }
];

const user_roles = [
  {
    user_id: 1,
    role_id: 1,
  },
  {
    user_id: 1,
    role_id: 2,
  },
  {
    user_id: 1,
    role_id: 3,
  },
  {
    user_id: 1,
    role_id: 4,
  },
  {
    user_id: 1,
    role_id: 5,
  },
  {
    user_id: 1,
    role_id: 6,
  },
  {
    user_id: 1,
    role_id: 7,
  },
  {
    user_id: 1,
    role_id: 8,
  },
  {
    user_id: 1,
    role_id: 9,
  },
  {
    user_id: 2,
    role_id: 3,
  },
  {
    user_id: 2,
    role_id: 4,
  },
  {
    user_id: 2,
    role_id: 6,
  },
  {
    user_id: 2,
    role_id: 7,
  },
  {
    user_id: 2,
    role_id: 8,
  },
  {
    user_id: 2,
    role_id: 9,
  },
  {
    user_id: 3,
    role_id: 6,
  },
];

/**
 * Apply the migration
 *
 * @param {queryInterface} context the database context to use
 */
export async function up({ context: queryInterface }) {
  await queryInterface.bulkInsert("roles", roles);
  await queryInterface.bulkInsert("user_roles", user_roles);
}

/**
 * Roll back the migration
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete("user_roles", {}, { truncate: true });
  await queryInterface.bulkDelete("roles", {}, { truncate: true });
}
