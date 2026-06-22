import { getDb } from "./db";

export const db = {
  createUser: async (userData: any) => {
    const conn = await getDb();

    await conn
      .request()
      .input("username", userData.name)
      .input("email", userData.email)
      .input("password", userData.password)
      .input("role", userData.role)
      .input("unit",userData.unit)
      .input("department",userData.department)
      .query(`
        INSERT INTO userTable
        (
          username,
          email,
          password,
          Role,
          Department,
          unit
        )
        VALUES
        (
          @username,
          @email,
          @password,
          @role,
          @department,
          @unit
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