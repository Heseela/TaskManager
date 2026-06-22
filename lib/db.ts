import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

let pool: any;

export async function getDb() {
  try {
    if (!pool) {
      console.log("Connecting with:", {
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      });

      pool = await sql.connect(config);
      console.log("Connected successfully");
    }

    return pool;
  } catch (err) {
    console.error("SQL ERROR:", err);
    throw err;
  }
}