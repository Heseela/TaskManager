import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DepartmentType, SubUnitType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, department, subUnit } = body;

    if (!email || !password || !name || !role || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, role, department' },
        { status: 400 }
      );
    }

    if (role !== 'supervisor' && role !== 'employee') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "supervisor" or "employee"' },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { error: 'Password must be at least 5 characters long' },
        { status: 400 }
      );
    }

    // Validate department
    const validDepartments = ['IT'];
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: 'Invalid department' },
        { status: 400 }
      );
    }

    // Validate sub-unit for employees
    if (role === 'employee' && !subUnit) {
      return NextResponse.json(
        { error: 'Sub-unit is required for employees' },
        { status: 400 }
      );
    }

    const existingUser = await db.getUser(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const userId = Date.now().toString();
    const newUser = await db.createUser({
      id: userId,
      email,
      name,
      role,
      department: department as DepartmentType,
      subUnit: subUnit as SubUnitType | undefined,
      password,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          department: newUser.department,
          subUnit: newUser.subUnit,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}