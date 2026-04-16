/**
 * @file Product Movement junction model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports ProductMovementSchema the schema for the ProductMovement model
 */

// Import libraries
import Sequelize from "sequelize";

const ProductMovementSchema = {
  productID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "products", key: "id" },
    onDelete: "cascade",
  },
  movementID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "movements", key: "id" },
    onDelete: "cascade",
  },
  movementType: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  amountChanged: {
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

export default ProductMovementSchema;
