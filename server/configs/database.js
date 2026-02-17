/**
 * @file Configuration information for Sequelize database ORM
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports sequelize a Sequelize instance
 */

// Import libraries
import Sequelize from "sequelize";

// Import logger configuration
import logger from "./logger.js";

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DATABASE_FILE || ":memory:",
  logging: logger.sql.bind(logger),
});

export default sequelize;
