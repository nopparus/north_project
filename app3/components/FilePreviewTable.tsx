import React, { useState } from 'react';
import { FileInfo, ValidationStatus } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, FileIcon, ChevronRightIcon } from './Icons';

interface FilePreviewTableProps {
    fileInfos: FileInfo[];
    validationError: string | null;
}

const StatusIndicator: React.FC<{ status: ValidationStatus }> = ({ status }) => {
    switch (status) {
        case ValidationStatus.Valid:
            return (
                <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-medium">ถูกต้อง</span>
                </div>
            );
        case ValidationStatus.Invalid:
            return (
                <div className="flex items-center gap-2 text-red-400">
                    <ExclamationCircleIcon className="h-5 w-5" />
                    <span className="font-medium">หัวตารางไม่ตรงกัน</span>
                </div>
            );
        default:
            return null;
    }
};

const FileRow: React.FC<{ fileInfo: FileInfo }> = ({ fileInfo }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalRows = fileInfo.sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);

    return (
        <>
            <tr className="bg-slate-900 border-b border-slate-700 last:border-b-0 hover:bg-slate-800 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-slate-400" />
                    {fileInfo.file.name}
                </td>
                <td className="px-6 py-4 text-center">{fileInfo.sheets.length.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">{totalRows.toLocaleString()}</td>
                 <td className="px-6 py-4 text-center">
                    <button aria-label={`Details for ${fileInfo.file.name}`} className="p-1 rounded-full hover:bg-slate-700">
                        <ChevronRightIcon className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-slate-800/50">
                    <td colSpan={4} className="p-0">
                        <div className="px-6 py-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">รายละเอียดชีท</h4>
                            <div className="border border-slate-700 rounded-md bg-slate-900 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-slate-400 bg-slate-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold">ชื่อชีท</th>
                                            <th className="px-4 py-2 text-right font-semibold">จำนวนแถว</th>
                                            <th className="px-4 py-2 text-left font-semibold">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileInfo.sheets.map((sheet, index) => (
                                            <tr key={sheet.sheetName} className={index > 0 ? "border-t border-slate-700" : ""}>
                                                <td className="px-4 py-3 font-medium text-slate-300">{sheet.sheetName}</td>
                                                <td className="px-4 py-3 text-right text-slate-300">{sheet.rowCount.toLocaleString()}</td>
                                                <td className="px-4 py-3"><StatusIndicator status={sheet.status} /></td>
                                            </tr>
                                        ))}
                                        {fileInfo.sheets.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-center text-slate-500">ไม่พบชีทในไฟล์นี้</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


const FilePreviewTable: React.FC<FilePreviewTableProps> = ({ fileInfos, validationError }) => {
    const totalSheets = fileInfos.reduce((sum, info) => sum + info.sheets.length, 0);
    const totalRows = fileInfos.reduce((sum, info) => sum + info.sheets.reduce((s, sheet) => s + sheet.rowCount, 0), 0);

    return (
        <div>
            <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-200">ไฟล์ที่เลือก</h3>
                <span className="text-sm sm:text-base text-slate-400 font-medium text-right">
                    {fileInfos.length} ไฟล์ | {totalSheets} ชีท | รวม {totalRows.toLocaleString()} แถว
                </span>
            </div>

            {validationError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg flex items-center gap-3">
                    <ExclamationCircleIcon className="h-5 w-5" />
                    <p className="font-medium">{validationError}</p>
                </div>
            )}

            <div className="overflow-x-auto border border-slate-700 rounded-lg">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">ชื่อไฟล์</th>
                            <th scope="col" className="px-6 py-3 text-center">จำนวนชีท</th>
                            <th scope="col" className="px-6 py-3 text-right">รวมจำนวนแถว</th>
                            <th scope="col" className="px-6 py-3 text-center w-24">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fileInfos.map((info) => (
                            <FileRow key={info.id} fileInfo={info} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FilePreviewTable;