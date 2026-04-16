/**
 * @file Database models
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports User a Sequelize User model
 * @exports Role a Sequelize Role model
 * @exports UserRole a Sequelize UserRole model
 * @exports Community a Sequelize Community model
 * @exports County a Sequelize County model
 * @exports Document a Sequelize Document model
 * @exports Metadata a Sequelize Metadata model
 * @exports MetadataDocument a Sequelize MetadataDocument model
 * @exports MetadataCommunity a Sequelize MetadataCommunity model
 */

// Import database connection
import database from "../configs/database.js";

// Import Schemas
import UserSchema from "./users.js";
import RoleSchema from "./roles.js";
import UserRoleSchema from "./user_role.js";

// NEW SCHEMAS
import ProductSchema from "./products.js";
import ProductTypeSchema from "./product_types.js";
import ProductCountSchema from "./product_counts.js";
import MovementSchema from "./movements.js";
import ProductMovementSchema from "./product_movement.js";
import MovementTypeSchema from "./movement_types.js";
import ProductSizeSchema from "./product_sizes.js";
import SupplierSchema from "./suppliers.js";

// Create User model
const User = database.define(
  //Model Name
  "User",
  //Schema
  UserSchema,
  // Other Options
  {
    tableName: "users",
  },
);

// Create Role Model
const Role = database.define(
  // Model Name
  "Role",
  // Schema
  RoleSchema,
  // Other options
  {
    tableName: "roles",
  },
);

// Create UserRole Model
const UserRole = database.define(
  // Model Name
  "UserRole",
  // Schema
  UserRoleSchema,
  // Other options
  {
    tableName: "user_roles",
    timestamps: false,
    underscored: true,
  },
);

// // Create Community Model
// const Community = database.define(
//   // Model Name
//   "Community",
//   // Schema
//   CommunitySchema,
//   // Other options
//   {
//     tableName: "communities",
//   },
// );

// // Create County Model
// const County = database.define(
//   // Model Name
//   "County",
//   // Schema
//   CountySchema,
//   // Other options
//   {
//     tableName: "counties",
//   },
// );

// // Create Document Model
// const Document = database.define(
//   // Model Name
//   "Document",
//   // Schema
//   DocumentSchema,
//   // Other options
//   {
//     tableName: "documents",
//   },
// );

// // Create Metadata Model
// const Metadata = database.define(
//   // Model Name
//   "Metadata",
//   // Schema
//   MetadataSchema,
//   // Other options
//   {
//     tableName: "metadata",
//   },
// );

// // Create MetadataDocument Model
// const MetadataDocument = database.define(
//   // Model Name
//   "MetadataDocument",
//   // Schema
//   MetadataDocumentSchema,
//   // Other options
//   {
//     tableName: "metadata_documents",
//     timestamps: false,
//     underscored: true,
//   },
// );

// // Create MetadataCommunity Model
// const MetadataCommunity = database.define(
//   // Model Name
//   "MetadataCommunity",
//   // Schema
//   MetadataCommunitySchema,
//   // Other options
//   {
//     tableName: "metadata_communities",
//     timestamps: false,
//     underscored: true,
//   },
// );

// Create Product Model
const Product = database.define(
  //Model Name
  "Product",
  //Schema
  ProductSchema,
  // Other Options
  {
    tableName: "products",
  },
);

const MovementType = database.define(
  //Model Name
  "MovementType",
  //Schema
  MovementTypeSchema,
  //Other Options
  {
    tableName: "movement_types",
  },
);

const ProductCount = database.define(
  //Model Name
  "ProductCount",
  //Schema
  ProductCountSchema,
  //Other Options
  {
    tableName: "product_counts",
  },
);

const Movement = database.define(
  //Model Name
  "Movement",
  //Schema
  MovementSchema,
  //Other Options
  {
    tableName: "movements",
  },
);

const ProductType = database.define(
  //Model Name
  "ProductType",
  //Schema
  ProductTypeSchema,
  //Other Options
  {
    tableName: "product_types",
  },
);

const ProductSize = database.define(
  //Model Name
  "ProductSize",
  //Schema
  ProductSizeSchema,
  //Other Options
  {
    tableName: "product_sizes",
  },
);

const ProductMovement = database.define(
  //Model Name
  "ProductMovement",
  //Schema
  ProductMovementSchema,
  //Other Options
  {
    tableName: "product_movements",
  },
);

const Supplier = database.define(
  //Model Name
  "Supplier",
  //Schema
  SupplierSchema,
  //Other options
  {
    tableName: "suppliers",
  },
);

// Define Associations
Role.belongsToMany(User, { through: UserRole, unique: false, as: "users" });
User.belongsToMany(Role, { through: UserRole, unique: false, as: "roles" });

ProductMovement.belongsTo(Product, { foreignKey: "productID", as: "product" });

ProductMovement.belongsTo(Movement, {
  foreignKey: "movementID",
  as: "movement",
});

Product.hasMany(ProductMovement, {
  foreignKey: "productID",
  as: "product_movements",
});

Movement.hasMany(ProductMovement, {
  foreignKey: "movementID",
  as: "product_movements",
});

Product.hasOne(ProductCount, { foreignKey: "productId", as: "product_counts" });
ProductCount.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.belongsTo(ProductType, { foreignKey: "typeId", as: "product_types" });
ProductType.hasMany(Product, { foreignKey: "typeId", as: "products" });

Product.belongsTo(ProductSize, { foreignKey: "sizeId", as: "product_sizes" });
ProductSize.hasMany(Product, { foreignKey: "sizeId", as: "products" });

Product.belongsTo(Supplier, { foreignKey: "supplierId", as: "suppliers" });
Supplier.hasMany(Product, { foreignKey: "supplierId", as: "products" });

ProductMovement.belongsTo(MovementType, {
  foreignKey: "movementType",
  as: "movement_types",
});
MovementType.hasMany(ProductMovement, {
  foreignKey: "movementType",
  as: "product_movements",
});

// Metadata.belongsToMany(Document, {
//   through: MetadataDocument,
//   unique: false,
//   foreignKey: "metadata_id",
//   as: "documents",
// });
// Document.belongsToMany(Metadata, {
//   through: MetadataDocument,
//   unique: false,
//   foreignKey: "document_id",
//   as: "metadata",
// });

// Metadata.belongsToMany(Community, {
//   through: MetadataCommunity,
//   unique: false,
//   foreignKey: "metadata_id",
//   as: "communities",
// });
// Community.belongsToMany(Metadata, {
//   through: MetadataCommunity,
//   unique: false,
//   foreignKey: "community_id",
//   as: "metadata",
// });

// User.hasMany(Metadata, { foreignKey: "owner_user_id", as: "metadata" });
// Metadata.belongsTo(User, { foreignKey: "owner_user_id", as: "owner" });

// User.hasMany(Community, { foreignKey: "owner_user_id", as: "communities" });
// Community.belongsTo(User, {
//   foreignKey: "owner_user_id",
//   as: "owner",
// });

// County.hasMany(Community, { foreignKey: "county_id", as: "communities" });
// Community.belongsTo(County, { foreignKey: "county_id", as: "county" });

export {
  User,
  Role,
  UserRole,
  // NEW EXPORTS
  Product,
  ProductType,
  ProductSize,
  ProductCount,
  Movement,
  MovementType,
  ProductMovement,
  Supplier,
};
