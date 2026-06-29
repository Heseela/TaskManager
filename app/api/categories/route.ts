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

        if (!subUnitName) {
            return NextResponse.json({ error: 'SubUnit name required' }, { status: 400 });
        }

        const pool = await getDb();

        const result = await pool.request()
            .input('subUnitName', sql.VarChar, subUnitName)
            .query(`
        SELECT CategoryName
        FROM TaskCategory c
        INNER JOIN UnitTable u ON c.SubUnitID = u.ID
        WHERE u.SubUnit = @subUnitName
        ORDER BY c.CategoryName
      `);

        const categories = result.recordset.map(
            (row: { CategoryName: string }) => row.CategoryName
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