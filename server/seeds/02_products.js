/**
 * @file Counties seed
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
  let products = (await csvToJson)
    .formatValueByType()
    .supportQuotedField(true)
    .fieldDelimiter(",")
    .getJsonFromCsv("./csv/products.csv");

  // append timestamps and parse fields
  products.map((c) => {
    // handle parsing numbers with comma separators
    c.createdAt = now;
    c.updatedAt = now;
    return c;
  });

  // For each product, create a random quantity between 0 and 100 and insert into product_counts
  let productCounts = [];
  for (const product of products) {
    const quantity = Math.floor(Math.random() * 101);
    productCounts.push({
      productId: product.id,
      quantity,
      createdAt: now,
      updatedAt: now,
    });
  }

  // insert into database
  await queryInterface.bulkInsert("products", products);
  await queryInterface.bulkInsert("product_counts", productCounts);
}

/**
 * Roll back the seed
 *
 * @param {queryInterface} context the database context to use
 */
export async function down({ context: queryInterface }) {
  await queryInterface.bulkDelete("product_counts", {}, { truncate: true });
  await queryInterface.bulkDelete("products", {}, { truncate: true });
}
