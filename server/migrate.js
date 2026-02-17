// Load environment (must be first)
import "@dotenvx/dotenvx/config";

// Import configurations
import migrations from "./configs/migrations.js";

// Run Umzug as CLI application
migrations.runAsCLI();
