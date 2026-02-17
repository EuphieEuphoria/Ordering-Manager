/**
 * @file Main Express Application
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports app Express Application
 */

// Load envoiroment (must be first)
import "@dotenvx/dotenvx/config";

// Import libraries
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import path from "path";
import swaggerUi from "swagger-ui-express";
import passport from "passport";

// Import configurations
import logger from "./configs/logger.js";
import openapi from "./configs/openapi.js";
import sessions from "./configs/sessions.js";

// Import middlewares
import requestLogger from "./middlewares/request-logger.js";

// Import routers
import indexRouter from "./routes/index.js";
import apiRouter from "./routes/api.js";
import authRouter from "./routes/auth.js";

// Create Express Application
var app = express();

// Use libraries
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

// Use middlewares
app.use(requestLogger);

// Serve static files
app.use(express.static(path.join(import.meta.dirname, "public")));

// Serve routers
app.use("/", indexRouter);
app.use("/api", apiRouter);

// Use sessions
app.use(sessions);
app.use(passport.authenticate("session"));

// Use auth routes
app.use("/auth", authRouter);

// Serve OpenAPI documentation if enabled
if (process.env.OPENAPI_VISIBLE === "true") {
  logger.warn("OpenAPI documentation visible!");
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi, { explorer: true }),
  );
}

export default app;
