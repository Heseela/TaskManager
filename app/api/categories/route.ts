// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { getDb } from '@/lib/db';
// import sql from 'mssql';

// export async function GET(request: Request) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         const { searchParams } = new URL(request.url);
//         const subUnitName = searchParams.get('subUnitName');

//         if (!subUnitName) {
//             return NextResponse.json({ error: 'SubUnit name required' }, { status: 400 });
//         }

//         const pool = await getDb();

//         const result = await pool.request()
//             .input('subUnitName', sql.VarChar, subUnitName)
//             .query(`
//         SELECT CategoryName
//         FROM TaskCategory c
//         INNER JOIN UnitTable u ON c.SubUnitID = u.ID
//         WHERE u.SubUnit = @subUnitName
//         ORDER BY c.CategoryName
//       `);

//         const categories = result.recordset.map(
//             (row: { CategoryName: string }) => row.CategoryName
//         );
//         return NextResponse.json({ categories });
//     } catch (error) {
//         console.error('Error fetching categories:', error);
//         return NextResponse.json(
//             { error: 'Failed to fetch categories' },
//             { status: 500 }
//         );
//     }
// }  


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import sql from 'mssql';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subUnitName = searchParams.get('subUnitName');
    const subUnitId = searchParams.get('subUnitId');

    const pool = await getDb();
    let query = `
      SELECT 
        c.ID AS CategoryID,
        c.SubUnitID,
        u.SubUnit AS SubUnitName,
        c.CategoryName,
        c.CreatedAt
      FROM TaskCategory c
      INNER JOIN UnitTable u ON c.SubUnitID = u.ID
    `;
    
    const request_obj = pool.request();

    if (subUnitName) {
      query += ` WHERE u.SubUnit = @subUnitName`;
      request_obj.input('subUnitName', sql.VarChar, subUnitName);
    } else if (subUnitId) {
      query += ` WHERE c.SubUnitID = @subUnitId`;
      request_obj.input('subUnitId', sql.Int, parseInt(subUnitId));
    }

    query += ` ORDER BY c.CategoryName`;

    const result = await request_obj.query(query);

    const categories = result.recordset.map(
      (row: any) => row.CategoryName
    );
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'supervisor') {
      return NextResponse.json(
        { error: 'Unauthorized - Only supervisors can add categories' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subUnitId, categoryName } = body;

    if (!subUnitId || !categoryName) {
      return NextResponse.json(
        { error: 'SubUnit ID and Category Name are required' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // Check if category already exists for this subunit
    const checkResult = await pool.request()
      .input('subUnitId', sql.Int, subUnitId)
      .input('categoryName', sql.VarChar, categoryName)
      .query(`
        SELECT COUNT(*) AS Count
        FROM TaskCategory
        WHERE SubUnitID = @subUnitId AND CategoryName = @categoryName
      `);

    if (checkResult.recordset[0].Count > 0) {
      return NextResponse.json(
        { error: 'Category already exists for this subunit' },
        { status: 409 }
      );
    }

    // Get subunit name for logging
    const subunitResult = await pool.request()
      .input('subUnitId', sql.Int, subUnitId)
      .query(`
        SELECT SubUnit
        FROM UnitTable
        WHERE ID = @subUnitId
      `);

    const subunitName = subunitResult.recordset[0]?.SubUnit || 'Unknown';

    // Insert the new category
    const result = await pool.request()
      .input('subUnitId', sql.Int, subUnitId)
      .input('categoryName', sql.VarChar, categoryName)
      .query(`
        INSERT INTO TaskCategory (SubUnitID, CategoryName, CreatedAt)
        VALUES (@subUnitId, @categoryName, GETDATE());
        
        SELECT SCOPE_IDENTITY() AS ID;
      `);

    return NextResponse.json({
      success: true,
      message: `Category "${categoryName}" added successfully for "${subunitName}"`,
      categoryId: result.recordset[0]?.ID,
      subunitName: subunitName,
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { error: 'Failed to add category' },
      { status: 500 }
    );
  }
}