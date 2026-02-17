/**
 * @file Metadata Document junction model
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports RoleSchema the schema for the MetadataDocument model
 */

// Import libraries
import Sequelize from "sequelize";

const MetadataDocumentSchema = {
  metadata_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "metadata", key: "id" },
    onDelete: "cascade",
  },
  document_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: "document", key: "id" },
    onDelete: "cascade",
  },
};

export default MetadataDocumentSchema;
