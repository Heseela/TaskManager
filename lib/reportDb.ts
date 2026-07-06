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
    previousTaskDescription: string;
    status: string;
    fileAttachments?: Array<{ name: string; url: string }>;
}) {
    const pool = await getDb();

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const result = await transaction
            .request()
            .input('userId', sql.Int, report.userId)
            .input('userName', sql.NVarChar, report.userName)
            .input('tasks', sql.NVarChar(sql.MAX), JSON.stringify(report.tasks))
            .input('taskDescription', sql.NVarChar(sql.MAX), report.taskDescription)
            .input(
                'previousTaskDescription',
                sql.NVarChar(sql.MAX),
                report.previousTaskDescription
            ).input('hoursWorked', sql.Decimal(4, 1), report.hoursWorked)
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
                    PreviousTaskDescription,
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
                    @previousTaskDescription,
                    @hoursWorked,
                    @challenges,
                    @tomorrowPlan,
                    @subUnit,
                    @status,
                    GETDATE()
                )
            `);

        const newReport = result.recordset[0];
        const reportId = newReport.ID;

        if (report.fileAttachments && report.fileAttachments.length > 0) {
            for (const file of report.fileAttachments) {

                const fileResult = await transaction
                    .request()
                    .input('reportId', sql.Int, reportId)
                    .input('name', sql.NVarChar, file.name)
                    .input('url', sql.NVarChar(sql.MAX), file.url)
                    .query(`
                        INSERT INTO FileAttachmentTable
                        (ReportID, Name, Url)
                        OUTPUT INSERTED.*
                        VALUES
                        (@reportId, @name, @url)
                    `);
            }
        }

        await transaction.commit();

        return {
            id: newReport.ID,
            userId: newReport.UserID,
            userName: newReport.UserName,
            date: newReport.ReportDate,
            tasks: JSON.parse(newReport.Tasks || '[]'),
            taskDescription: newReport.TaskDescription || '',
            previousTaskDescription:
                newReport.PreviousTaskDescription || '',
            hoursWorked: Number(newReport.HoursWorked),
            challenges: newReport.Challenges || '',
            tomorrowPlan: JSON.parse(newReport.TomorrowPlan || '[]'),
            subUnit: newReport.SubUnit || '',
            status: newReport.Status,
            submittedAt: newReport.SubmittedAt,
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating report:', error);
        throw error;
    }
}

export async function getReportsByUser(userId: number): Promise<Report[]> {
    const pool = await getDb();

    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query(`
      SELECT 
        r.ID,
        r.UserID,
        r.UserName,
        r.ReportDate,
        r.Tasks,
        r.TaskDescription,
        r.PreviousTaskDescription,
        r.HoursWorked,
        r.Challenges,
        r.TomorrowPlan,
        r.SubUnit,
        r.Status,
        r.SubmittedAt,
        (
          SELECT 
            f.ID,
            f.Name,
            f.Url
          FROM FileAttachmentTable f
          WHERE f.ReportID = r.ID
          FOR JSON PATH
        ) AS FileAttachments
      FROM ReportTable r
      WHERE UserID = @userId
      ORDER BY SubmittedAt DESC
    `);

    const reports: Report[] = result.recordset.map((r: any) => {
        let fileAttachments = [];
        if (r.FileAttachments) {
            try {
                const parsed = JSON.parse(r.FileAttachments);
                fileAttachments = parsed.map((file: any) => ({
                    id: file.ID,
                    reportId: file.ReportID,
                    name: file.Name,
                    url: file.Url
                }));
            } catch (e) {
                console.error('Error parsing file attachments:', e);
            }
        }

        return {
            id: r.ID,
            userId: r.UserID,
            userName: r.UserName,
            date: r.ReportDate,
            tasks: JSON.parse(r.Tasks || '[]'),
            taskDescription: r.TaskDescription || '',
            previousTaskDescription:
                r.PreviousTaskDescription || '',
            hoursWorked: Number(r.HoursWorked),
            challenges: r.Challenges || '',
            tomorrowPlan: JSON.parse(r.TomorrowPlan || '[]'),
            subUnit: r.SubUnit || '',
            status: r.Status,
            submittedAt: r.SubmittedAt,
            fileAttachments: fileAttachments
        };
    });

    return reports;
}

export async function getAllReports(): Promise<Report[]> {
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
                r.PreviousTaskDescription,
                r.HoursWorked,
                r.Challenges,
                r.TomorrowPlan,
                r.SubUnit,
                r.Status,
                r.SubmittedAt,
                (
                    SELECT 
                        f.ID,
                        f.Name,
                        f.Url
                    FROM FileAttachmentTable f
                    WHERE f.ReportID = r.ID
                    FOR JSON PATH
                ) AS FileAttachments
            FROM ReportTable r
            ORDER BY SubmittedAt DESC
        `);

    const reports: Report[] = result.recordset.map((r: any) => {
        let fileAttachments = [];
        if (r.FileAttachments) {
            try {
                const parsed = JSON.parse(r.FileAttachments);
                fileAttachments = parsed.map((file: any) => ({
                    id: file.ID,
                    reportId: file.ReportID,
                    name: file.Name,
                    url: file.Url
                }));
            } catch (e) {
                console.error('Error parsing file attachments:', e);
            }
        }

        return {
            id: r.ID,
            userId: r.UserID,
            userName: r.UserName,
            date: r.ReportDate,
            tasks: JSON.parse(r.Tasks || '[]'),
            taskDescription: r.TaskDescription || '',
            previousTaskDescription:
                r.PreviousTaskDescription || '',
            hoursWorked: Number(r.HoursWorked),
            challenges: r.Challenges || '',
            tomorrowPlan: JSON.parse(r.TomorrowPlan || '[]'),
            subUnit: r.SubUnit || '',
            status: r.Status,
            submittedAt: r.SubmittedAt,
            fileAttachments: fileAttachments
        };
    });

    return reports;
}