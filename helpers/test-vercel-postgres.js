const { sql } = require('@vercel/postgres');
const { seed } = require('./seed');

async function testVercelPostgres() {
  return await new Promise(async (resolve, reject) => {
    try {
      data = await sql`SELECT * FROM contacts`
      if (data) {
        console.log('Connected to "otsu-labs-postgres"')
        resolve(true)
      }
    } catch (e) {
      if (e.message.includes('relation "contacts" does not exist')) {
        console.log(
          'Table does not exist, creating and seeding it with dummy data now...'
        )
        // Table is not created yet
        await seed()
        resolve(true)
      } else {
        reject(false)
        throw e
      }
    }
  });
}

module.exports = { testVercelPostgres };
