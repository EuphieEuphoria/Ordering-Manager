/**
 * @file Roles table migration
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports up the Up migration
 * @exports down the Down migration
 */

// Import Libraries
import { Sequelize } from "sequelize";

/**
 * Apply the migration
 *
 * @param {queryInterface} context the database context to use
 */
export async function up({ context: queryInterface }) {
  await queryInterface.createTable("roles", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await queryInterface.createTable("user_roles", {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "users", key: "id" },
      onDelete: "cascade",
    },
    role_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "roles", key: "id" },
      onDelete: "cascade",
    },
  });
}

/**
 * Roll back the migration
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.dropTable("user_roles");
  await queryInterface.dropTable("roles");
}
