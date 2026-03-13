/**
 * @file Product Schema
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports ProductSchema the schema for the Product model
 */

// Import libraries
import Sequelize from "sequelize";

const ProductSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplierId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: "productComposite",
  },
  typeId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: "productComposite",
  },
  sizeId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: "productComposite",
  },
  caseSize: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
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

export default ProductSchema;
