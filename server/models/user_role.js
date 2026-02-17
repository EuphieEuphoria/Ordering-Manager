/**
 * @file User role junction model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports RoleSchema the schema for the UserRole model
 */

// Import libraries
import Sequelize from "sequelize";

const UserRoleSchema = {
  userId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "User", key: "id" },
    onDelete: "cascade",
  },
  roleId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "Role", key: "id" },
    onDelete: "cascade",
  },
};

export default UserRoleSchema;
