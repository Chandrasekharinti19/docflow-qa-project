import { closeDb } from "./utils/dbClient";

async function globalTeardown() {
  await closeDb();
}

export default globalTeardown;