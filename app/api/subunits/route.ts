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
    const depId = searchParams.get('depId');

    const pool = await getDb();
    let query = `
      SELECT 
        u.ID,
        u.DepID,
        u.SubUnit,
        d.DepName,
        d.DepCode
      FROM UnitTable u
      INNER JOIN DepTable d ON u.DepID = d.ID
    `;
    
    const request_obj = pool.request();

    if (depId) {
      query += ` WHERE u.DepID = @depId`;
      request_obj.input('depId', sql.Int, parseInt(depId));
    }

    query += ` ORDER BY u.SubUnit`;

    const result = await request_obj.query(query);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching subunits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subunits' },
      { status: 500 }
    );
  }
}