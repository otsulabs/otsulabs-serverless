const { sql } = require('@vercel/postgres');

async function seed() {
  const createTable = await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      attachment VARCHAR(255),
      message TEXT,
      type VARCHAR(36) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;

  console.log(`Created 'contacts' table`);

  return {
    createTable,
  };
}

module.exports = { seed }
