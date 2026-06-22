import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/datasource';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'supervisor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

 // const employees = await db.getUser(email);
  //return NextResponse.json(employees);
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
    return NextResponse.json(
      { error: 'User with this email already exists' },
      { status: 409 }
    );
  
}
