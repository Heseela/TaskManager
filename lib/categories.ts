import { getDb } from './db';
import sql from 'mssql';
import { TaskCategory } from '@/types';

export async function getCategoriesBySubUnit(subUnitName: string): Promise<TaskCategory[]> {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .input('subUnitName', sql.VarChar, subUnitName)
      .query(`
        SELECT 
          c.CategoryName
        FROM CategoryTable c
        INNER JOIN UnitTable u ON c.SubUnitID = u.ID
        WHERE u.SubUnit = @subUnitName
        ORDER BY c.CategoryName
      `);

    return result.recordset.map((row: any) => row.CategoryName);
  } catch (error) {
    console.error('Error fetching categories by subunit:', error);
    return [];
  }
}

export async function getCategoriesBySubUnitId(subUnitId: number): Promise<TaskCategory[]> {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .input('subUnitId', sql.Int, subUnitId)
      .query(`
        SELECT 
          CategoryName
        FROM CategoryTable
        WHERE SubUnitID = @subUnitId
        ORDER BY CategoryName
      `);

    return result.recordset.map((row: any) => row.CategoryName);
  } catch (error) {
    console.error('Error fetching categories by subunit ID:', error);
    return [];
  }
}

export async function getAllCategoriesWithSubUnits() {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .query(`
        SELECT 
          u.ID AS SubUnitID,
          u.SubUnit AS SubUnitName,
          u.DepID,
          c.ID AS CategoryID,
          c.CategoryName
        FROM UnitTable u
        LEFT JOIN CategoryTable c ON u.ID = c.SubUnitID
        ORDER BY u.SubUnit, c.CategoryName
      `);

    // Group by subunit
    const grouped = result.recordset.reduce((acc: any, row: any) => {
      const key = row.SubUnitID;
      if (!acc[key]) {
        acc[key] = {
          subUnitId: row.SubUnitID,
          subUnitName: row.SubUnitName,
          depId: row.DepID,
          categories: []
        };
      }
      if (row.CategoryName) {
        acc[key].categories.push(row.CategoryName);
      }
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error('Error fetching all categories with subunits:', error);
    return [];
  }
}

export async function getSubUnitById(subUnitId: number) {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .input('subUnitId', sql.Int, subUnitId)
      .query(`
        SELECT 
          ID,
          DepID,
          SubUnit
        FROM UnitTable
        WHERE ID = @subUnitId
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error fetching subunit by ID:', error);
    return null;
  }
}

export async function getSubUnitByName(subUnitName: string) {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .input('subUnitName', sql.VarChar, subUnitName)
      .query(`
        SELECT 
          ID,
          DepID,
          SubUnit
        FROM UnitTable
        WHERE SubUnit = @subUnitName
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error fetching subunit by name:', error);
    return null;
  }
}

export async function createCategory(subUnitId: number, categoryName: string) {
  try {
    const pool = await getDb();
    
    const result = await pool.request()
      .input('subUnitId', sql.Int, subUnitId)
      .input('categoryName', sql.VarChar, categoryName)
      .query(`
        INSERT INTO CategoryTable (SubUnitID, CategoryName)
        VALUES (@subUnitId, @categoryName);
        
        SELECT SCOPE_IDENTITY() AS ID;
      `);

    return result.recordset[0]?.ID || null;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
}

export async function deleteCategory(categoryId: number) {
  try {
    const pool = await getDb();
    
    await pool.request()
      .input('categoryId', sql.Int, categoryId)
      .query(`
        DELETE FROM CategoryTable
        WHERE ID = @categoryId
      `);

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
}

export async function updateCategory(categoryId: number, newCategoryName: string) {
  try {
    const pool = await getDb();
    
    await pool.request()
      .input('categoryId', sql.Int, categoryId)
      .input('newCategoryName', sql.VarChar, newCategoryName)
      .query(`
        UPDATE CategoryTable
        SET CategoryName = @newCategoryName
        WHERE ID = @categoryId
      `);

    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
}