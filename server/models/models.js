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
import OrderSchema from "./orders.js";
import ProductOrderSchema from "./product_order.js";

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

//NEW MODELS------------------------------------------------------------------------

//Products
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

// Create ProductType Model
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

// Create ProductSize Model
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

// Create ProductCount Model
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

//Movmements
// Create Movement Model
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

// Create MovementType Model
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

// Create ProductMovement Model
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

//Orders
// Create Order Model
const Order = database.define(
  //Model Name
  "Order",
  //Schema
  OrderSchema,
  //Other Options
  {
    tableName: "orders",
  },
);

// Create Order Model
const ProductOrder = database.define(
  //Model Name
  "ProductOrder",
  //Schema
  ProductOrderSchema,
  //Other Options
  {
    tableName: "product_orders",
  },
);

// Create Supplier Model
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

//Associations ----------------------------------------------------------------------------------------------------------------------

// Define Associations
Role.belongsToMany(User, { through: UserRole, unique: false, as: "users" });
User.belongsToMany(Role, { through: UserRole, unique: false, as: "roles" });

//Products
Product.belongsTo(ProductType, { foreignKey: "typeId", as: "product_types" });
ProductType.hasMany(Product, { foreignKey: "typeId", as: "products" });

Product.belongsTo(ProductSize, { foreignKey: "sizeId", as: "product_sizes" });
ProductSize.hasMany(Product, { foreignKey: "sizeId", as: "products" });

Product.hasOne(ProductCount, { foreignKey: "productId", as: "product_counts" });
ProductCount.belongsTo(Product, { foreignKey: "productId", as: "product" });

Product.belongsTo(Supplier, { foreignKey: "supplierId", as: "suppliers" });
Supplier.hasMany(Product, { foreignKey: "supplierId", as: "products" });

//Movements
Movement.hasMany(ProductMovement, { foreignKey: "movementID", as: "product_movements" });
ProductMovement.belongsTo(Movement, { foreignKey: "movementID", as: "movement" });

Product.hasMany(ProductMovement, { foreignKey: "productID", as: "product_movements" });
ProductMovement.belongsTo(Product, { foreignKey: "productID", as: "product" });

ProductMovement.belongsTo(MovementType, { foreignKey: "movementType", as: "movement_types" });
MovementType.hasMany(ProductMovement, { foreignKey: "movementType", as: "product_movements" });

//Orders
Product.hasMany(ProductOrder, { foreignKey: "productID", as: "product_orders" });
ProductOrder.belongsTo(Product, { foreignKey: "productID", as: "product" });

Order.hasMany(ProductOrder, { foreignKey: "orderID", as: "product_orders" });
ProductOrder.belongsTo(Order, { foreignKey: "orderID", as: "order" });


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
  Order,
  ProductOrder,
  Supplier,
};
