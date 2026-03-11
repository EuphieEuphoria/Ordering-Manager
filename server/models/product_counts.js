/**
 * @file ProductCount Schema
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports InentorySchema the schema for the inventory model
 */

//Import Libraries
import { Sequelize } from "sequelize";

const ProductCountSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: "product", key: "id" },
    onDelete: "cascade",
  },
  quantity: {
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
};

export default ProductCountSchema;
