import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const filename = params.filename;
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'reports', filename);

        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        const fileBuffer = await fs.readFile(filePath);
        const fileExtension = path.extname(filename).toLowerCase();
        
        let contentType = 'application/octet-stream';
        if (fileExtension === '.pdf') contentType = 'application/pdf';
        else if (['.jpg', '.jpeg'].includes(fileExtension)) contentType = 'image/jpeg';
        else if (fileExtension === '.png') contentType = 'image/png';
        else if (fileExtension === '.gif') contentType = 'image/gif';
        else if (fileExtension === '.doc') contentType = 'application/msword';
        else if (fileExtension === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (['.xls', '.xlsx'].includes(fileExtension)) contentType = 'application/vnd.ms-excel';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('File download error:', error);
        return NextResponse.json(
            { error: 'Failed to download file' },
            { status: 500 }
        );
    }
}