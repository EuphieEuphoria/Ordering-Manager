/**
 * @file Supplier model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports MovementTypeSchema the schema for the supplier model
 */

// Import libraries
import Sequelize from "sequelize";

const SupplierSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    uniqueKey: true,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    uniqueKey: true,
  },
  description: {
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

export default SupplierSchema;
