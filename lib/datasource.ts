import { getDb } from "./db";

export const db = {
  createUser: async (userData: any) => {
    const conn = await getDb();

    await conn
      .request()
      .input("email", userData.email)
      .input("name", userData.name)
      .input("password", userData.password)
      .input("role", userData.role)
      .input("department",userData.department)
      .input("unit",userData.subUnit)
      
      .query(`
        INSERT INTO userTable
        (
          email,
          name,
          password,
          role,
          department,
          subUnit
        )
        VALUES
        (
          @email,  
          @name,
          @password,
          @role,
          @department,
          @subUnit
        )
      `);

    return userData;
  },

  getUser: async (email: string) => {
    const conn = await getDb();

    const result = await conn
      .request()
      .input("email", email)
      .query(`
        SELECT *
        FROM userTable
        WHERE email = @email
      `);

    return result.recordset[0] || null;
  }

  
};