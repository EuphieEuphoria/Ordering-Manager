/**
 * @file Order Schema
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports OrderSchema the schema for the Order model
 */

// Import Libraries
import Sequelize from "sequelize";

const OrderSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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

export default OrderSchema;
