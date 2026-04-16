/**
 * @file Movement Schema
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports UserSchema the schema for the User model
 */

// Import Libraries
import Sequelize from "sequelize";

const MovementSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
};

export default MovementSchema;
