/**
 * @file metadata Table Migration
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
  await queryInterface.createTable("metadata", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    publisher: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    abstract: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    citation: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    copyright_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    keywords: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    owner_user_id: {
      type: Sequelize.INTEGER,
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

  await queryInterface.createTable("metadata_documents", {
    metadata_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "metadata", key: "id" },
      onDelete: "cascade",
    },
    document_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "documents", key: "id" },
      onDelete: "cascade",
    },
  });

  await queryInterface.createTable("metadata_communities", {
    metadata_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "metadata", key: "id" },
      onDelete: "cascade",
    },
    community_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: "communities", key: "id" },
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
  await queryInterface.dropTable("metadata");
}
