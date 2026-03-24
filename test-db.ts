import { Client } from "pg";

const client = new Client({
  
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for cloud DBs
  },
});

async function testDB() {
  try {
    console.log("DB URL:", process.env.DATABASE_URL);
    await client.connect();
    console.log("✅ Connected to DB");

    const res = await client.query("SELECT NOW()");
    console.log("🕒 Server time:", res.rows[0]);

    await client.end();
  } catch (err: any) {
    console.error("❌ Connection failed:", err.message);
  }
}

testDB();