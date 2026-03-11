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
    references: { model: "Product", key: "id" },
    onDelete: "cascade",
  },
  movementID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "Movement", key: "id" },
    onDelete: "cascade",
  },
};

export default ProductMovementSchema;
