/**
 * @file MovementType model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports MovementTypeSchema the schema for the Role model
 */

// Import libraries
import Sequelize from "sequelize";

const MovementTypeSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
    uniqueKey: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
};

export default MovementTypeSchema;
