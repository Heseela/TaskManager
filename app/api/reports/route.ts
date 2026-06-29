// In app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createReport, getReportsByUser, getAllReports } from '@/lib/reportDb';
import { Report } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    let reports: Report[] = [];

    // Supervisors can see all reports
    if (session.user.role === 'supervisor') {
      reports = await getAllReports();
      
      // Filter by user if specified
      if (userId) {
        reports = reports.filter(r => r.userId === Number(userId));
      }
    } 
    // Employees can only see their own reports
    else if (session.user.role === 'employee') {
      reports = await getReportsByUser(Number(session.user.id));
    } 
    else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Filter by date if provided
    if (date) {
      reports = reports.filter(r => r.date === date);
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('GET REPORTS ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'employee') {
      return NextResponse.json(
        { error: 'Unauthorized - Only employees can submit reports' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.tasks || body.tasks.length === 0) {
      return NextResponse.json(
        { error: 'At least one task is required' },
        { status: 400 }
      );
    }

    if (!body.hoursWorked || body.hoursWorked <= 0) {
      return NextResponse.json(
        { error: 'Valid hours worked is required' },
        { status: 400 }
      );
    }

    const report = await createReport({
      userId: Number(session.user.id),
      userName: session.user.name || 'Unknown',
      tasks: body.tasks,
      hoursWorked: body.hoursWorked,
      challenges: body.challenges || '',
      tomorrowPlan: body.tomorrowPlan || [],
      subUnit: body.subUnit || session.user.subUnit || '',
      taskDescription: body.taskDescription || '',
      status: 'submitted',
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('CREATE REPORT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}