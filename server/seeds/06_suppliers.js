/**
 * @file Suppliers seed
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
  let suppliers = (await csvToJson)
    .formatValueByType()
    .supportQuotedField(true)
    .fieldDelimiter(",")
    .getJsonFromCsv("./csv/suppliers.csv");

  // append timestamps and parse fields
  suppliers.map((c) => {
    // handle parsing numbers with comma separators
    c.createdAt = now;
    c.updatedAt = now;
    return c;
  });

  // insert into database
  await queryInterface.bulkInsert("suppliers", suppliers);
}

/**
 * Roll back the seed
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete("suppliers", {}, { truncate: true });
}
