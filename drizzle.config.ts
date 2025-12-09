import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local file explicitly
config({ path: ".env.local" });

export default defineConfig({
    out: "./drizzle",
    schema: "./src/drizzle/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
