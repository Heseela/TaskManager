import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'supervisor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const employees = await db.getAllEmployees();
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'supervisor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { email, name, department } = body;

  if (!email || !name) {
    return NextResponse.json(
      { error: 'Email and name are required' },
      { status: 400 }
    );
  }

  const existing = await db.getUser(email);
  if (existing) {
    return NextResponse.json(
      { error: 'User with this email already exists' },
      { status: 409 }
    );
  }

  const newEmployee = await db.createUser({
    id: `user_${Date.now()}`,
    email,
    name,
    password: 'demo123',
    role: 'employee',
    department: department || undefined,
  });

  return NextResponse.json(newEmployee, { status: 201 });
}
