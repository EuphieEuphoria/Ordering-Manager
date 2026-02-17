// Load environment (must be first)
import "@dotenvx/dotenvx/config";

// Import configurations
import seeds from "./configs/seeds.js";

// Run Umzug as CLI application
seeds.runAsCLI();
