/**
 * @file ProductSize model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports ProductSizeSchema the schema for the Product Size model
 */

// Import libraries
import Sequelize from "sequelize";

const ProductSizeSchema = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ounces: {
    type: Sequelize.INTEGER,
    allowNull: false,
    uniqueKey: true,
  },
  commonName: {
    type: Sequelize.STRING,
    allowNull: true,
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

export default ProductSizeSchema;
