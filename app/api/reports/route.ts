import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

let reports: any[] = [];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');

  let filteredReports = [...reports];

  if (userId && session.user.role === 'cto') {
    filteredReports = filteredReports.filter(r => r.userId === userId);
  } else if (session.user.role === 'employee') {
    filteredReports = filteredReports.filter(r => r.userId === session.user.id);
  }

  if (date) {
    filteredReports = filteredReports.filter(r => r.date === date);
  }

  return NextResponse.json(filteredReports);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'employee') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newReport = {
    id: Date.now().toString(),
    userId: session.user.id,
    userName: session.user.name,
    date: new Date().toISOString().split('T')[0],
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    ...body,
  };

  reports.unshift(newReport);
  
  return NextResponse.json(newReport, { status: 201 });
}