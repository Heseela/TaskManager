// import sql from 'mssql';
// import { getDb } from './db';
// import { Report } from '@/types';

// export async function createReport(report: {
//     userId: number;
//     userName: string;
//     tasks: string[];
//     hoursWorked: number;
//     challenges: string;
//     tomorrowPlan: string[];
//     subUnit: string;
//     taskDescription: string;
//     status: string;
// }) {
//     const pool = await getDb();

//     const result = await pool
//         .request()
//         .input('userId', sql.Int, report.userId)
//         .input('userName', sql.NVarChar, report.userName)
//         .input('tasks', sql.NVarChar(sql.MAX), JSON.stringify(report.tasks))
//         .input('taskDescription', sql.NVarChar(sql.MAX), report.taskDescription)
//         .input('hoursWorked', sql.Decimal(4, 1), report.hoursWorked)
//         .input('challenges', sql.NVarChar(sql.MAX), report.challenges)
//         .input(
//             'tomorrowPlan',
//             sql.NVarChar(sql.MAX),
//             JSON.stringify(report.tomorrowPlan)
//         )
//         .input('subUnit', sql.NVarChar, report.subUnit)
//         .input('status', sql.VarChar, report.status)
//         .query(`
//       INSERT INTO Report
//       (
//         UserID,
//         UserName,
//         ReportDate,
//         Tasks,
//         TaskDescription,
//         HoursWorked,
//         Challenges,
//         TomorrowPlan,
//         SubUnit,
//         Status,
//         SubmittedAt
//       )
//       OUTPUT INSERTED.*
//       VALUES
//       (
//         @userId,
//         @userName,
//         CAST(GETDATE() AS DATE),
//         @tasks,
//         @taskDescription,
//         @hoursWorked,
//         @challenges,
//         @tomorrowPlan,
//         @subUnit,
//         @status,
//         GETDATE()
//       )
//     `);

//     const newReport = result.recordset[0];

//     return {
//         ...newReport,
//         tasks: JSON.parse(newReport.Tasks || '[]'),
//         tomorrowPlan: JSON.parse(newReport.TomorrowPlan || '[]'),
//     };
// }

// export async function getReportsByUser(
//     userId: number
// ) {
//     const pool = await getDb();

//     const result = await pool
//         .request()
//         .input('userId', sql.Int, userId)
//         .query(`
//       SELECT *
//       FROM Report
//       WHERE UserID = @userId
//       ORDER BY SubmittedAt DESC
//     `);

//     const reports: Report[] = result.recordset.map((r: any) => ({
//         id: r.ID,
//         userId: r.UserID,
//         userName: r.UserName,
//         date: r.ReportDate,
//         tasks: JSON.parse(r.Tasks || '[]'),
//         taskDescription: r.TaskDescription ?? '',
//         hoursWorked: Number(r.HoursWorked),
//         challenges: r.Challenges ?? '',
//         tomorrowPlan: JSON.parse(r.TomorrowPlan || '[]'),
//         subUnit: r.SubUnit ?? '',
//         status: r.Status,
//         submittedAt: r.SubmittedAt,
//     }));

//     return reports;
// }

import sql from 'mssql';
import { getDb } from './db';
import { Report } from '@/types';

export async function createReport(report: {
    userId: number;
    userName: string;
    tasks: string[];
    hoursWorked: number;
    challenges: string;
    tomorrowPlan: string[];
    subUnit: string;
    taskDescription: string;
    status: string;
}) {
    const pool = await getDb();

    const result = await pool
        .request()
        .input('userId', sql.Int, report.userId)
        .input('userName', sql.NVarChar, report.userName)
        .input('tasks', sql.NVarChar(sql.MAX), JSON.stringify(report.tasks))
        .input('taskDescription', sql.NVarChar(sql.MAX), report.taskDescription)
        .input('hoursWorked', sql.Decimal(4, 1), report.hoursWorked)
        .input('challenges', sql.NVarChar(sql.MAX), report.challenges)
        .input(
            'tomorrowPlan',
            sql.NVarChar(sql.MAX),
            JSON.stringify(report.tomorrowPlan)
        )
        .input('subUnit', sql.NVarChar, report.subUnit)
        .input('status', sql.VarChar, report.status)
        .query(`
      INSERT INTO ReportTable
      (
        UserID,
        UserName,
        ReportDate,
        Tasks,
        TaskDescription,
        HoursWorked,
        Challenges,
        TomorrowPlan,
        SubUnit,
        Status,
        SubmittedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @userId,
        @userName,
        CAST(GETDATE() AS DATE),
        @tasks,
        @taskDescription,
        @hoursWorked,
        @challenges,
        @tomorrowPlan,
        @subUnit,
        @status,
        GETDATE()
      )
    `);

    const newReport = result.recordset[0];

    return {
        id: newReport.ID,
        userId: newReport.UserID,
        userName: newReport.UserName,
        date: newReport.ReportDate,
        tasks: JSON.parse(newReport.Tasks || '[]'),
        taskDescription: newReport.TaskDescription || '',
        hoursWorked: Number(newReport.HoursWorked),
        challenges: newReport.Challenges || '',
        tomorrowPlan: JSON.parse(newReport.TomorrowPlan || '[]'),
        subUnit: newReport.SubUnit || '',
        status: newReport.Status,
        submittedAt: newReport.SubmittedAt,
    };
}

export async function getReportsByUser(userId: number): Promise<Report[]> {
    const pool = await getDb();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT 
        ID,
        UserID,
        UserName,
        ReportDate,
        Tasks,
        TaskDescription,
        HoursWorked,
        Challenges,
        TomorrowPlan,
        SubUnit,
        Status,
        SubmittedAt
      FROM ReportTable
      WHERE UserID = @userId
      ORDER BY SubmittedAt DESC
    `);

    const reports: Report[] = result.recordset.map((r: any) => ({
        id: r.ID,
        userId: r.UserID,
        userName: r.UserName,
        date: r.ReportDate,
        tasks: JSON.parse(r.Tasks || '[]'),
        taskDescription: r.TaskDescription || '',
        hoursWorked: Number(r.HoursWorked),
        challenges: r.Challenges || '',
        tomorrowPlan: JSON.parse(r.TomorrowPlan || '[]'),
        subUnit: r.SubUnit || '',
        status: r.Status,
        submittedAt: r.SubmittedAt,
    }));

    return reports;
}

export async function getAllReports(): Promise<Report[]> {
    const pool = await getDb();

    const result = await pool
        .request()
        .query(`
            SELECT 
                ID,
                UserID,
                UserName,
                ReportDate,
                Tasks,
                TaskDescription,
                HoursWorked,
                Challenges,
                TomorrowPlan,
                SubUnit,
                Status,
                SubmittedAt
            FROM ReportTable
            ORDER BY SubmittedAt DESC
        `);

    const reports: Report[] = result.recordset.map((r: any) => ({
        id: r.ID,
        userId: r.UserID,
        userName: r.UserName,
        date: r.ReportDate,
        tasks: JSON.parse(r.Tasks || '[]'),
        taskDescription: r.TaskDescription || '',
        hoursWorked: Number(r.HoursWorked),
        challenges: r.Challenges || '',
        tomorrowPlan: JSON.parse(r.TomorrowPlan || '[]'),
        subUnit: r.SubUnit || '',
        status: r.Status,
        submittedAt: r.SubmittedAt,
    }));

    return reports;
}

// Optional: Get reports with user details (for supervisor view)
export async function getAllReportsWithUserDetails(): Promise<Report[]> {
    const pool = await getDb();

    const result = await pool
        .request()
        .query(`
            SELECT 
                r.ID,
                r.UserID,
                r.UserName,
                r.ReportDate,
                r.Tasks,
                r.TaskDescription,
                r.HoursWorked,
                r.Challenges,
                r.TomorrowPlan,
                r.SubUnit AS ReportSubUnit,
                r.Status,
                r.SubmittedAt,
                u.name AS UserFullName,
                u.email,
                u.department,
                u.subUnit AS UserSubUnit
            FROM ReportTable r
            LEFT JOIN userTable u ON r.UserID = u.id
            ORDER BY r.SubmittedAt DESC
        `);

    const reports: Report[] = result.recordset.map((r: any) => ({
        id: r.ID,
        userId: r.UserID,
        userName: r.UserFullName || r.UserName,
        date: r.ReportDate,
        tasks: JSON.parse(r.Tasks || '[]'),
        taskDescription: r.TaskDescription || '',
        hoursWorked: Number(r.HoursWorked),
        challenges: r.Challenges || '',
        tomorrowPlan: JSON.parse(r.TomorrowPlan || '[]'),
        subUnit: r.ReportSubUnit || '',
        status: r.Status,
        submittedAt: r.SubmittedAt,
        email: r.email,
        department: r.department,
        userSubUnit: r.UserSubUnit,
    }));

    return reports;
}