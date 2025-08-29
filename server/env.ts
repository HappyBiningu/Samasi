import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the project root (one level up from server/)
const envPath = join(__dirname, '..', '.env');

// Load .env file
const result = config({ path: envPath });

if (result.error) {
  console.log("No .env file found at:", envPath);
  console.log("Using environment variables or defaults");
} else {
  console.log("✓ .env file loaded successfully from:", envPath);
}

export default result;