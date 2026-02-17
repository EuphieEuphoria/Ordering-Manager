/**
 * @file metadata seed
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports up the Up migration
 * @exports down the Down migration
 */

// Import libraries
const csvToJson = import("convert-csv-to-json");

// Timestamp in the appropriate format for the database
const now = new Date().toISOString().slice(0, 23).replace("T", " ") + " +00:00";

/**
 * Apply the seed
 *
 * @param {queryInterface} context the database context to use
 */
export async function up({ context: queryInterface }) {
  // Read data from CSV file
  let metadata = (await csvToJson)
    .formatValueByType()
    .supportQuotedField(true)
    .fieldDelimiter(",")
    .getJsonFromCsv("./csv/metadata.csv");

  // append timestamps
  metadata.map((c) => {
    c.createdAt = now;
    c.updatedAt = now;
    return c;
  });

  // Read data from CSV file
  let metadata_documents = (await csvToJson)
    .formatValueByType()
    .supportQuotedField(true)
    .fieldDelimiter(",")
    .getJsonFromCsv("./csv/metadata_documents.csv");

  // Read data from CSV file
  let metadata_communities = (await csvToJson)
    .formatValueByType()
    .supportQuotedField(true)
    .fieldDelimiter(",")
    .getJsonFromCsv("./csv/metadata_communities.csv");

  // insert into database
  await queryInterface.bulkInsert("metadata", metadata);
  await queryInterface.bulkInsert("metadata_documents", metadata_documents);
  await queryInterface.bulkInsert("metadata_communities", metadata_communities);
}

/**
 * Roll back the seed
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete(
    "metadata_communities",
    {},
    { truncate: true },
  );
  await queryInterface.bulkDelete("metadata_documents", {}, { truncate: true });
  await queryInterface.bulkDelete("metadata", {}, { truncate: true });
}
