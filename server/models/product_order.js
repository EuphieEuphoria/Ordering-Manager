/**
 * @file Product Order junction model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports ProductOrderSchema the schema for the ProductOrder model
 */

// Import libraries
import Sequelize from "sequelize";

const ProductOrderSchema = {
  productID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "products", key: "id" },
    onDelete: "cascade",
  },
  orderID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "orders", key: "id" },
    onDelete: "cascade",
  },
  quantityOrdered: {
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

export default ProductOrderSchema;
