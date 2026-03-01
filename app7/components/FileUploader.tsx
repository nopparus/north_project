
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, SpinnerIcon } from './Icons';

interface FileUploaderProps {
    onFilesSelected: (files: File[]) => void;
    isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesSelected(Array.from(event.target.files));
        }
    };

    const handleDrag = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDragIn = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(event.dataTransfer.files));
            event.dataTransfer.clearData();
        }
    }, [onFilesSelected]);

    const handleClick = () => {
        fileInputRef.current?.click();
    }

    const dragDropClasses = isDragging
        ? 'border-orange-500 bg-orange-900/20'
        : 'border-slate-700 bg-slate-800 hover:border-orange-400';

    return (
        <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer ${dragDropClasses}`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                onChange={handleFileChange}
                disabled={isProcessing}
            />
            {isProcessing ? (
                <>
                    <SpinnerIcon className="h-12 w-12 text-orange-400" />
                    <p className="mt-4 text-lg font-medium text-slate-200">กำลังประมวลผลไฟล์...</p>
                    <p className="text-slate-400">กรุณารอสักครู่</p>
                </>
            ) : (
                <>
                    <UploadIcon className="h-12 w-12 text-slate-500" />
                    <p className="mt-4 text-lg font-medium text-slate-200">ลากไฟล์มาวางที่นี่ หรือ <span className="text-orange-400 font-semibold">คลิกเพื่อเลือกไฟล์</span></p>
                    <p className="mt-1 text-sm text-slate-400">รองรับไฟล์ .xlsx, .xls, .csv</p>
                </>
            )}
        </div>
    );
};

export default FileUploader;
