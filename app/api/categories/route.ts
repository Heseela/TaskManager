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
    const all = searchParams.get('all');

    const pool = await getDb();
    
    let query = `
      SELECT 
        c.ID,
        c.SubUnitID,
        u.SubUnit AS SubUnitName,
        c.CategoryName,
        c.CreatedAt
      FROM TaskCategory c
      INNER JOIN UnitTable u ON c.SubUnitID = u.ID
    `;
    
    const request_obj = pool.request();

    if (all === 'true') {
      // Return all categories
      query += ` ORDER BY u.SubUnit, c.CategoryName`;
    } else if (subUnitName) {
      query += ` WHERE u.SubUnit = @subUnitName`;
      request_obj.input('subUnitName', sql.VarChar, subUnitName);
      query += ` ORDER BY c.CategoryName`;
    } else if (subUnitId) {
      query += ` WHERE c.SubUnitID = @subUnitId`;
      request_obj.input('subUnitId', sql.Int, parseInt(subUnitId));
      query += ` ORDER BY c.CategoryName`;
    } else {
      query += ` ORDER BY u.SubUnit, c.CategoryName`;
    }

    const result = await request_obj.query(query);

    if (all === 'true') {
      return NextResponse.json({ categories: result.recordset });
    }

    const categories = result.recordset.map((row: any) => row.CategoryName);
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

    // Check if category already exists
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
      message: 'Category added successfully',
      categoryId: result.recordset[0]?.ID,
    });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { error: 'Failed to add category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'supervisor') {
      return NextResponse.json(
        { error: 'Unauthorized - Only supervisors can update categories' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { categoryName } = body;

    if (!categoryName) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // Check if category exists
    const checkResult = await pool.request()
      .input('categoryId', sql.Int, parseInt(categoryId))
      .query(`
        SELECT SubUnitID
        FROM TaskCategory
        WHERE ID = @categoryId
      `);

    if (checkResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update the category
    await pool.request()
      .input('categoryId', sql.Int, parseInt(categoryId))
      .input('categoryName', sql.VarChar, categoryName)
      .query(`
        UPDATE TaskCategory
        SET CategoryName = @categoryName
        WHERE ID = @categoryId
      `);

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'supervisor') {
      return NextResponse.json(
        { error: 'Unauthorized - Only supervisors can delete categories' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const pool = await getDb();

    // Check if category exists
    const checkResult = await pool.request()
      .input('categoryId', sql.Int, parseInt(categoryId))
      .query(`
        SELECT ID
        FROM TaskCategory
        WHERE ID = @categoryId
      `);

    if (checkResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Delete the category
    await pool.request()
      .input('categoryId', sql.Int, parseInt(categoryId))
      .query(`
        DELETE FROM TaskCategory
        WHERE ID = @categoryId
      `);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}