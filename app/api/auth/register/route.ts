import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db';
import { createUser, getDepartment, getSubUnits } from '@/lib/userDb';

export async function GET(req: NextRequest) {
  try {
    const depId = req.nextUrl.searchParams.get("depId");

    // subunits
    if (depId) {
      const subUnits = await getSubUnits(Number(depId));
      return NextResponse.json(subUnits);
    }

    // departments
    const depList = await getDepartment();
    return NextResponse.json(depList);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      role,
      department,
      subUnit
    } = body;

    // Validate required fields 
    if (!email || !password || !name || !role || !department) {
      return NextResponse.json(
        {
          error: 'Missing required fields: email, password, name, role, department',
        }, { status: 400 }
      );
    }

    // Validate role 
    if (role !== 'employee' && role !== 'supervisor') {
      return NextResponse.json(
        {
          error: 'Role must be employee or supervisor',
        },
        { status: 400 }
      );
    }

    // Validate password length 
    if (password.length < 5) {
      return NextResponse.json(
        {
          error: 'Password must be at least 5 characters long',
        },
        { status: 400 }
      );
    }

    // Employee must have subUnit 
    if (role === 'employee' && !subUnit) {
      return NextResponse.json(
        {
          error: 'Sub-unit is required for employees',
        },
        { status: 400 }
      );
    }

    // Check if email already exists 
    const existingUser = await getUser(email);
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }




    // Generate ID 
    const userId = Date.now().toString()

    // Insert into SQL Server 
    await createUser(
      name,
      email,
      password,
      department,
      subUnit || '',
      role
    );
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          name,
          email,
          role,
          department,
          subUnit,
        },
      },
      { status: 201 }
    );
  }
  catch (error: any) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}