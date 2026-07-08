import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db';
import { createUser, getDepartment, getSubUnits } from '@/lib/userDb';
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    const depId = req.nextUrl.searchParams.get("depId");

    if (depId) {
      const subUnits = await getSubUnits(Number(depId));
      return NextResponse.json(subUnits);
    }

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

    if (!email || !password || !name || !role || !department) {
      return NextResponse.json(
        {
          error: 'Missing required fields: email, password, name, role, department',
        }, { status: 400 }
      );
    }

    if (role !== 'employee' && role !== 'supervisor') {
      return NextResponse.json(
        {
          error: 'Role must be employee or supervisor',
        },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        {
          error: 'Password must be at least 5 characters long',
        },
        { status: 400 }
      );
    }

    if (role === 'employee' && !subUnit) {
      return NextResponse.json(
        {
          error: 'Sub-unit is required for employees',
        },
        { status: 400 }
      );
    }

    const existingUser = await getUser(email);
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    const userId = Date.now().toString()

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(
      name,
      email,
      hashedPassword,
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