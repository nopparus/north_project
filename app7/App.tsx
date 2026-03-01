import React, { useState, useCallback, useMemo } from 'react';
import { FileInfo, ValidationStatus, SheetInfo } from './types';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import FilePreviewTable from './components/FilePreviewTable';
import ActionButtons from './components/ActionButtons';

// Declare global variables from CDN scripts for TypeScript
declare var XLSX: any;
declare var saveAs: any;

const App: React.FC = () => {
    const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const processFile = (file: File): Promise<Omit<FileInfo, 'sheets'> & { sheets: Omit<SheetInfo, 'status'>[] }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = event.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });

                    const sheets: Omit<SheetInfo, 'status'>[] = workbook.SheetNames.map((sheetName: string) => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                        const headers = (jsonData[0] as string[] || []).map(h => String(h).trim());
                        const rows = jsonData.slice(1) as (string | number)[][];

                        return {
                            sheetName,
                            headers,
                            data: rows,
                            rowCount: rows.length,
                        };
                    });

                    resolve({
                        id: `${file.name}-${file.lastModified}`,
                        file,
                        sheets,
                    });
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsBinaryString(file);
        });
    };

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setFileInfos([]);
        setValidationError(null);

        try {
            const processedFiles = await Promise.all(files.map(file => processFile(file)));

            if (processedFiles.length === 0) return;

            const sheetsByName = new Map<string, (SheetInfo & { fileId: string })[]>();
            processedFiles.forEach(pf => {
                pf.sheets.forEach(sheet => {
                    const sheetWithContext = { ...sheet, status: ValidationStatus.Pending, fileId: pf.id };
                    if (!sheetsByName.has(sheet.sheetName)) {
                        sheetsByName.set(sheet.sheetName, []);
                    }
                    sheetsByName.get(sheet.sheetName)!.push(sheetWithContext);
                });
            });

            let hasMismatch = false;
            sheetsByName.forEach((sheets) => {
                if (sheets.length <= 1) {
                    sheets.forEach(s => s.status = ValidationStatus.Valid);
                    return;
                }

                const firstHeaders = JSON.stringify(sheets[0].headers);
                const areHeadersConsistent = sheets.every(s => JSON.stringify(s.headers) === firstHeaders);

                sheets.forEach(s => s.status = areHeadersConsistent ? ValidationStatus.Valid : ValidationStatus.Invalid);
                if (!areHeadersConsistent) hasMismatch = true;
            });
            
            if (hasMismatch) {
                setValidationError("ข้อผิดพลาด: พบไฟล์ที่มีหัวตารางไม่ตรงกันในบางชีท โปรดตรวจสอบรายละเอียด");
            } else {
                setValidationError(null);
            }

            const finalFileInfos: FileInfo[] = processedFiles.map(pf => ({
                ...pf,
                sheets: pf.sheets.map(originalSheet => {
                    const sheetGroup = sheetsByName.get(originalSheet.sheetName) || [];
                    const matchedSheet = sheetGroup.find(s => s.fileId === pf.id);
                    // This fallback should theoretically never happen in this flow
                    return matchedSheet ? { ...matchedSheet } : { ...originalSheet, status: ValidationStatus.Invalid };
                }),
            }));

            setFileInfos(finalFileInfos);

        } catch (error) {
            console.error("Error processing files:", error);
            setValidationError("เกิดข้อผิดพลาดในการอ่านไฟล์");
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const canMerge = useMemo(() => {
        return fileInfos.some(file => 
            file.sheets.some(sheet => sheet.status === ValidationStatus.Valid)
        );
    }, [fileInfos]);
    
    const handleMergeAndDownload = useCallback(() => {
        if (!canMerge) return;

        const newWorkbook = XLSX.utils.book_new();
        const validSheetsToMerge = new Map<string, SheetInfo[]>();

        fileInfos.forEach(fileInfo => {
            fileInfo.sheets.forEach(sheet => {
                if (sheet.status === ValidationStatus.Valid) {
                    if (!validSheetsToMerge.has(sheet.sheetName)) {
                        validSheetsToMerge.set(sheet.sheetName, []);
                    }
                    validSheetsToMerge.get(sheet.sheetName)!.push(sheet);
                }
            });
        });

        if (validSheetsToMerge.size === 0) {
            setValidationError("ไม่มีชีทที่ถูกต้องสำหรับรวมไฟล์");
            return;
        }
        
        try {
            validSheetsToMerge.forEach((sheets, sheetName) => {
                const sheetsToProcess = sheets.filter(s => s.rowCount > 0);
                if (sheets.length > 0) {
                    const headers = sheets[0].headers;
                    const allData = sheets.flatMap(sheet => sheet.data);
                    const mergedData = [headers, ...allData];
                    
                    const newWorksheet = XLSX.utils.aoa_to_sheet(mergedData);
                    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
                }
            });

            const wbout = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, 'merged_files.xlsx');

        } catch (error) {
            console.error("Error during merge and download:", error);
            setValidationError("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
        }
    }, [fileInfos, canMerge]);

    const handleClear = useCallback(() => {
        setFileInfos([]);
        setValidationError(null);
        setIsProcessing(false);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <Header />
                <main className="mt-8 bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 md:p-8">
                    {fileInfos.length === 0 ? (
                        <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
                    ) : (
                        <>
                            <FilePreviewTable fileInfos={fileInfos} validationError={validationError} />
                            <ActionButtons
                                onMerge={handleMergeAndDownload}
                                onClear={handleClear}
                                canMerge={canMerge}
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;