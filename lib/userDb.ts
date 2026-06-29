import { getDb } from "./db";
import sql from "mssql";

export async function createUser(
    name: string,
    email: string,
    password: string,
    department: string,
    subUnit: string,
    role: "employee" | "supervisor"
) {
    const pool = await getDb();
    await pool.request()
        .input("name", sql.VarChar, name)
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, password)
        .input("department", sql.VarChar, department)
        .input("subUnit", sql.VarChar, subUnit)
        .input("role", sql.VarChar, role)
        .query(`
    INSERT INTO userTable
    (
        name,
        email,
        password,
        role,
        department,
        subUnit
    )
    VALUES
    (
        @name,
        @email,
        @password,
        @role,
        @department,
        @subUnit
    )
 `)
}

export async function getDepartment() {
  const pool = await getDb();

  const result = await pool
    .request()   
    .query(`
      SELECT ID, DepName, DepCode
      FROM DepTable
    `);

     return result.recordset; 

}

export async function getSubUnits(depId: number) {
  const pool = await getDb();

  const result = await pool
    .request()
    .input("depId", sql.Int, depId)
    .query(`
      SELECT ID, SubUnit
      FROM UnitTable
      WHERE DepID = @depId
    `);

  return result.recordset;
}