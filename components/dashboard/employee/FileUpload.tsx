'use client';

import { useState, useRef } from 'react';
import { X, File, Image, FileText, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';

interface FileUploadProps {
    onFileUploaded: (file: { name: string; url: string }) => void;
    onFileRemoved: (index: number) => void;
    uploadedFiles: Array<{ name: string; url: string; id?: string }>;
    maxFiles?: number;
}

export default function FileUpload({
    onFileUploaded,
    onFileRemoved,
    uploadedFiles,
    maxFiles = 5
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return <Image size={18} className="text-blue-500" />;
        }
        if (['pdf'].includes(extension || '')) {
            return <FileText size={18} className="text-red-500" />;
        }
        if (['doc', 'docx'].includes(extension || '')) {
            return <FileText size={18} className="text-blue-600" />;
        }
        return <File size={18} className="text-gray-500" />;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (uploadedFiles.length + files.length > maxFiles) {
            setUploadError(`Maximum ${maxFiles} files allowed`);
            setTimeout(() => setUploadError(null), 3000);
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                if (file.size > 10 * 1024 * 1024) {
                    setUploadError(`${file.name} exceeds 10MB limit`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Upload failed');
                }

                const data = await response.json();

                onFileUploaded({
                    name: data.name,
                    url: data.url,
                });
            }
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Upload failed');
            setTimeout(() => setUploadError(null), 3000);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    disabled={isUploading || uploadedFiles.length >= maxFiles}
                />
                
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || uploadedFiles.length >= maxFiles}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#0088D0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0088D0] border-t-transparent"></div>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Paperclip size={16} className="text-gray-500" />
                            <span>Attach Files</span>
                        </>
                    )}
                </button>
                
                <span className="text-xs text-gray-400">
                    {uploadedFiles.length}/{maxFiles} files
                </span>
            </div>

            {uploadError && (
                <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg text-xs">
                    <AlertCircle size={14} />
                    {uploadError}
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="space-y-1">
                    {uploadedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-1.5 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {getFileIcon(file.name)}
                                <span className="text-sm text-gray-700 truncate flex-1">
                                    {file.name}
                                </span>
                                <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                            </div>
                            <button
                                onClick={() => onFileRemoved(index)}
                                className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 ml-2"
                                title="Remove file"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}