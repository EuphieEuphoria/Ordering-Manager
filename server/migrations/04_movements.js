/**
 * @file Movements table migration
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
  await queryInterface.createTable("movements", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movementType: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    applied: {
      type: Sequelize.BOOLEAN,
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

  await queryInterface.createTable("product_movements", {
    productID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "Product", key: "id" },
      onDelete: "cascade",
    },
    movementID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "Movement", key: "id" },
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
  await queryInterface.dropTable("product_movements");
  await queryInterface.dropTable("movements");
}
