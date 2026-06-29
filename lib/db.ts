import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
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
        database: process.env.DB_DATABASE,
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

  export async function getUser(
    email: string
  ) 
  { 
    const pool = await getDb(); 
    const result = await pool 
    .request() 
    .input(
      "email", 
      sql.VarChar, email
    ) 
    .query(`
       SELECT * 
       FROM userTable 
       WHERE email = @email 
      `); 
      return result.recordset[0]; 
}