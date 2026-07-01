import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { db } from '@/lib/datasource';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'supervisor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pool = await getDb();
    
    const result = await pool.request()
      .query(`
        SELECT 
          id,
          name,
          email,
          role,
          department,
          subUnit
        FROM userTable
        WHERE role = 'employee'
        ORDER BY name ASC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'supervisor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, department, subUnit, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.getUser(email);
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new employee
    await db.createUser({
      email,
      name,
      password,
      department: department || 'IT',
      subUnit: subUnit || null,
      role: role || 'employee'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Employee created successfully' 
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}