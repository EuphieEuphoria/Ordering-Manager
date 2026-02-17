/**
 * @file Configuration for cookie sessions stored in Sequelize
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports sequelizeSession a Session instance configured for Sequelize
 */

// Import Libraries
import session from "express-session";
import connectSession from "connect-session-sequelize";

// Import Database
import database from "./database.js";
import logger from "./logger.js";

// Initialize Store
const sequelizeStore = connectSession(session.Store);
const store = new sequelizeStore({
  db: database,
});

// Create tables in Sequelize
store.sync();

if (!process.env.SESSION_SECRET) {
  logger.error(
    "Cookie session secret not set! Set a SESSION_SECRET environment variable.",
  );
}

// Session configuration
const sequelizeSession = session({
  name: process.env.SESSION_NAME || "connect.sid",
  secret: process.env.SESSION_SECRET,
  store: store,
  resave: false,
  proxy: true,
  saveUninitialized: false,
});

export default sequelizeSession;
