/**
 * @file Metadata Community junction model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports RoleSchema the schema for the MetadataCommunity model
 */

// Import libraries
import Sequelize from "sequelize";

const MetadataCommunitySchema = {
  metadata_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "metadata", key: "id" },
    onDelete: "cascade",
  },
  community_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "community", key: "id" },
    onDelete: "cascade",
  },
};

export default MetadataCommunitySchema;
