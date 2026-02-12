/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Since we are using browser globals, we need to declare them
declare const XLSX: any;
declare const JSZip: any;

interface TransformedRow {
    Province?: string;
    electricityNumber: string;
    deviceNumber: string;
    Year: number;
    Month: number;
    Baht: number;
    Unit: number;
}

interface DownloadableFile {
    fileName: string;
    blob: Blob;
    type: 'CSV' | 'Excel';
}

interface Result {
    originalFileName: string;
    downloads?: DownloadableFile[];
    error?: string;
    rowCount?: number;
}

function App() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            return savedTheme;
        }
        return 'dark';
    });
    const [files, setFiles] = useState<File[]>([]);
    const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
    const [sheetOptions, setSheetOptions] = useState<string[]>([]);
    const [outputFormat, setOutputFormat] = useState<'csv' | 'excel' | 'both'>(() => (localStorage.getItem('app2_output_format') as any) || 'csv');
    const [processMode, setProcessMode] = useState<'individual' | 'combined'>(() => (localStorage.getItem('app2_process_mode') as any) || 'individual');
    const [includeProvince, setIncludeProvince] = useState(() => localStorage.getItem('app2_include_province') !== 'false');
    const [isLoading, setIsLoading] = useState(false);
    const [isExtractingSheets, setIsExtractingSheets] = useState(false);
    const [results, setResults] = useState<Result[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => { localStorage.setItem('app2_output_format', outputFormat); }, [outputFormat]);
    useEffect(() => { localStorage.setItem('app2_process_mode', processMode); }, [processMode]);
    useEffect(() => { localStorage.setItem('app2_include_province', String(includeProvince)); }, [includeProvince]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const extractSheetNames = useCallback(async (fileList: File[]) => {
        if (fileList.length === 0) {
            setSheetOptions([]);
            setSelectedSheets([]);
            return;
        }

        setIsExtractingSheets(true);
        try {
            const sheetNamesByFile = await Promise.all(
                fileList.map(file => new Promise<string[]>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = e.target?.result;
                            const workbook = XLSX.read(data, { type: 'binary', bookSheets: true });
                            resolve(workbook.SheetNames);
                        } catch (err) {
                            reject(err);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsBinaryString(file);
                }))
            );

            if (sheetNamesByFile.length > 0) {
                const intersection = sheetNamesByFile.reduce((a, b) => a.filter(c => b.includes(c)));
                setSheetOptions(intersection);
                if (intersection.length === 1) {
                    setSelectedSheets(intersection);
                } else {
                    // Keep existing selections if they are still valid in the new intersection
                    setSelectedSheets(prev => prev.filter(s => intersection.includes(s)));
                }
            } else {
                 setSheetOptions([]);
                 setSelectedSheets([]);
            }
        } catch (error) {
            console.error("Error reading sheet names:", error);
            setSheetOptions([]);
            setSelectedSheets([]);
        } finally {
            setIsExtractingSheets(false);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = [...e.target.files];
            setFiles(fileList);
            extractSheetNames(fileList);
        }
    };
    
    const handleRemoveFile = (indexToRemove: number) => {
        const newFiles = files.filter((_, index) => index !== indexToRemove);
        setFiles(newFiles);
        extractSheetNames(newFiles);
    };

    const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const fileList = [...e.dataTransfer.files];
            setFiles(fileList);
            extractSheetNames(fileList);
            e.dataTransfer.clearData();
        }
    };
    
    const handleClear = () => {
        setFiles([]);
        setResults([]);
        setSheetOptions([]);
        setSelectedSheets([]);
    };

    const handleSheetSelectionChange = (sheetName: string, isChecked: boolean) => {
        setSelectedSheets(prevSelectedSheets => {
            if (isChecked) {
                // Add sheet if it's not already there
                return [...prevSelectedSheets, sheetName];
            } else {
                // Remove sheet
                return prevSelectedSheets.filter(name => name !== sheetName);
            }
        });
    };
    
    const extractProvinceFromFilename = (filename: string): string => {
        const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
        const parts = nameWithoutExtension.split(/[_-\s]/); 
        return parts[0] || 'Unknown'; 
    };

    const transformExcelData = (dataSource: any[], reportYear: number, province: string, shouldIncludeProvince: boolean): TransformedRow[] => {
        const transformedRows: TransformedRow[] = [];
        const monthsMap: { [key: string]: number } = {
            'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
            'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
        };

        dataSource.forEach(row => {
            const electricityNumberFinal = row.electricityNumber || '';
            const deviceNumber = row.deviceNumber || '';
            
            for (const [monthName, monthNum] of Object.entries(monthsMap)) {
                const bahtCol = `baht ${monthName}`;
                const unitCol = `unit ${monthName}`;
                
                let bahtValue = parseFloat(row[bahtCol]);
                let unitValue = parseFloat(row[unitCol]);

                if (isNaN(bahtValue)) bahtValue = 0.0;
                if (isNaN(unitValue)) unitValue = 0.0;
                
                const newRow: TransformedRow = {
                    electricityNumber: electricityNumberFinal,
                    deviceNumber: deviceNumber,
                    Year: reportYear,
                    Month: monthNum,
                    Baht: bahtValue,
                    Unit: unitValue
                };

                if (shouldIncludeProvince) {
                    newRow.Province = province;
                }

                transformedRows.push(newRow);
            }
        });
        return transformedRows;
    };

    const getReportYear = (sheet: string): number => {
        let extractedYearCE: number | null = null;
        if (sheet.toLowerCase().startsWith('data_')) {
            try {
                const yearStr = sheet.split('_').pop();
                if (yearStr) {
                    const beYear = parseInt(yearStr, 10);
                    if (!isNaN(beYear)) {
                        extractedYearCE = beYear - 543;
                    }
                }
            } catch (e) {
                console.warn(`Could not parse year from sheet name: ${sheet}`);
            }
        }
        return extractedYearCE || new Date().getFullYear();
    };
    
    const convertToCSV = (data: TransformedRow[], shouldIncludeProvince: boolean): string => {
        if (data.length === 0) return "";
        const baseHeaders = ['electricityNumber', 'deviceNumber', 'Year', 'Month', 'Baht', 'Unit'];
        const headers = shouldIncludeProvince ? ['Province', ...baseHeaders] : baseHeaders;
        const headerRow = headers.join(',');
        const rows = data.map(row => 
            headers.map(header => (row as any)[header]).join(',')
        );
        return `\uFEFF${headerRow}\n${rows.join('\n')}`;
    };

    const convertToExcelBlob = (data: TransformedRow[], shouldIncludeProvince: boolean): Blob => {
        const baseHeaders = ['electricityNumber', 'deviceNumber', 'Year', 'Month', 'Baht', 'Unit'];
        const headers = shouldIncludeProvince ? ['Province', ...baseHeaders] : baseHeaders;
        
        const dataForSheet = shouldIncludeProvince 
            ? data 
            : data.map(({ Province, ...rest }) => rest);

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TransformedData');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8;' });
    };

    const processFile = (file: File, sheetsToRead: string[], shouldIncludeProvince: boolean): Promise<{ originalFileName: string; transformedData?: TransformedRow[]; error?: string; rowCount?: number }> => {
        return new Promise((resolve) => {
            if (!file.name.toLowerCase().match(/\.(xls|xlsx)$/)) {
                resolve({ originalFileName: file.name, error: "ไม่ใช่ไฟล์ Excel" });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd' });
                    
                    let allSheetsData: TransformedRow[] = [];
                    const province = extractProvinceFromFilename(file.name);

                    for (const sheetName of sheetsToRead) {
                        if (!workbook.SheetNames.includes(sheetName)) {
                            resolve({ originalFileName: file.name, error: `ไม่พบชีทชื่อ '${sheetName}'` });
                            return;
                        }

                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            raw: false,
                            defval: '',
                            header: 1,
                        });

                        const headerRowIndex = jsonData.findIndex(row => (row as string[]).includes('electricityNumber'));
                        if (headerRowIndex === -1) {
                            resolve({ originalFileName: file.name, error: `ไม่พบแถวหัวข้อ (Header) ในชีท '${sheetName}'` });
                            return;
                        }
                        
                        const header = jsonData[headerRowIndex] as string[];
                        
                        const finalJsonData = XLSX.utils.sheet_to_json(worksheet, {
                           header: header,
                           range: headerRowIndex + 1
                        });
                        
                        const reportYear = getReportYear(sheetName);
                        const transformedData = transformExcelData(finalJsonData, reportYear, province, shouldIncludeProvince);
                        allSheetsData.push(...transformedData);
                    }

                    resolve({ originalFileName: file.name, transformedData: allSheetsData, rowCount: allSheetsData.length });
                } catch (err: any) {
                    resolve({ originalFileName: file.name, error: `เกิดข้อผิดพลาด: ${err.message}` });
                }
            };
            reader.onerror = (err) => resolve({ originalFileName: file.name, error: "ไม่สามารถอ่านไฟล์ได้" });
            reader.readAsBinaryString(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.length || selectedSheets.length === 0) return;

        setIsLoading(true);
        setResults([]);
        
        const intermediateResults = await Promise.all(files.map(file => processFile(file, selectedSheets, includeProvince)));
        let finalResults: Result[] = [];

        if (processMode === 'combined' && files.length > 1) {
            const processedResults = intermediateResults.filter(res => res.transformedData !== undefined);
            const errors = intermediateResults.filter(res => res.error);
            const contributingResults = processedResults.filter(res => res.rowCount && res.rowCount > 0);
            const allTransformedData = contributingResults.flatMap(res => res.transformedData as TransformedRow[]);

            if (allTransformedData.length > 0) {
                const downloads: DownloadableFile[] = [];
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const baseName = `Combined${contributingResults.length}_${today}`;
                
                if (outputFormat === 'csv' || outputFormat === 'both') {
                    const csvData = convertToCSV(allTransformedData, includeProvince);
                    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                    downloads.push({ fileName: `${baseName}.csv`, blob, type: 'CSV' });
                }

                if (outputFormat === 'excel' || outputFormat === 'both') {
                    const blob = convertToExcelBlob(allTransformedData, includeProvince);
                    downloads.push({ fileName: `${baseName}.xlsx`, blob, type: 'Excel' });
                }
                
                finalResults.push({ 
                    originalFileName: `Combined Result (${contributingResults.length} files)`, 
                    downloads, 
                    rowCount: allTransformedData.length 
                });
            }
            
            processedResults.forEach(res => {
                finalResults.push({
                    originalFileName: res.originalFileName,
                    rowCount: res.rowCount,
                });
            });

            errors.forEach(err => {
                finalResults.push({ 
                    originalFileName: err.originalFileName, 
                    error: err.error 
                });
            });

        } else {
            finalResults = intermediateResults.map(res => {
                if (res.error || !res.transformedData) {
                    return { originalFileName: res.originalFileName, error: res.error || "No data transformed." };
                }

                const downloads: DownloadableFile[] = [];
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const baseName = res.originalFileName.substring(0, res.originalFileName.lastIndexOf('.'));

                if (outputFormat === 'csv' || outputFormat === 'both') {
                    const csvData = convertToCSV(res.transformedData, includeProvince);
                    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                    downloads.push({
                        fileName: `${baseName}_transformed_${today}.csv`,
                        blob: blob,
                        type: 'CSV'
                    });
                }

                if (outputFormat === 'excel' || outputFormat === 'both') {
                    const blob = convertToExcelBlob(res.transformedData, includeProvince);
                     downloads.push({
                        fileName: `${baseName}_transformed_${today}.xlsx`,
                        blob: blob,
                        type: 'Excel'
                    });
                }

                return { originalFileName: res.originalFileName, downloads, rowCount: res.rowCount };
            });
        }
        
        setResults(finalResults);
        setIsLoading(false);
    };

    const downloadFile = (blob: Blob, fileName: string) => {
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        const successfulDownloads = results
            .flatMap(result => result.downloads || [])
            .filter(download => download !== undefined);

        if (successfulDownloads.length === 0) return;

        successfulDownloads.forEach(download => {
            zip.file(download.fileName, download.blob);
        });

        try {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            downloadFile(zipBlob, `transformed_files_${today}.zip`);
        } catch (error) {
            console.error("Error creating zip file:", error);
        }
    };

    const successfulResultsCount = results.filter(r => r.downloads && r.downloads.length > 0).length;

    return (
        <div className="container">
            <header>
                <h1>EMS แปลงข้อมูลค่าไฟฟ้า</h1>
                <button
                    onClick={toggleTheme}
                    className="theme-switcher"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
            </header>
            <main>
                <section className="controls">
                    <h2><i className="fa-solid fa-sliders"></i> ตั้งค่าและอัปโหลด</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="file-input">1. อัปโหลดไฟล์ Excel (.xls, .xlsx)</label>
                            <label 
                                htmlFor="file-input"
                                className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
                                onDragEnter={handleDragEvents}
                                onDragOver={handleDragEvents}
                                onDragLeave={handleDragEvents}
                                onDrop={handleDrop}
                            >
                                <i className="fa-solid fa-file-excel"></i>
                                <p>ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเพื่อเลือกไฟล์</strong></p>
                            </label>
                            <input
                                id="file-input"
                                type="file"
                                accept=".xls,.xlsx"
                                multiple
                                onChange={handleFileChange}
                            />
                            {files.length > 0 && (
                                <div className="file-list">
                                    {files.map((file, index) => (
                                        <div key={index} className="file-list-item">
                                            <span><i className="fa-regular fa-file-lines"></i> {file.name}</span>
                                            <button 
                                                type="button" 
                                                className="remove-file-btn" 
                                                onClick={() => handleRemoveFile(index)}
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label id="sheet-select-label">2. เลือกชีท (Select Sheet)</label>
                            <div className="sheet-select-group" role="group" aria-labelledby="sheet-select-label">
                                {isExtractingSheets ? (
                                    <p className="placeholder-text">กำลังอ่านชีท...</p>
                                ) : files.length === 0 ? (
                                    <p className="placeholder-text">กรุณาอัปโหลดไฟล์ก่อน</p>
                                ) : sheetOptions.length > 0 ? (
                                    sheetOptions.map(name => (
                                        <label key={name} className="checkbox-label sheet-select-item">
                                            <input
                                                type="checkbox"
                                                value={name}
                                                checked={selectedSheets.includes(name)}
                                                onChange={(e) => handleSheetSelectionChange(name, e.target.checked)}
                                            />
                                            {name}
                                        </label>
                                    ))
                                ) : (
                                    <p className="placeholder-text">ไม่พบชีทที่ตรงกันในไฟล์ทั้งหมด</p>
                                )}
                            </div>
                            {!isExtractingSheets && files.length > 0 && sheetOptions.length === 0 && 
                                <small className="error-text">ไม่พบชีทที่ตรงกันในไฟล์ทั้งหมดที่อัปโหลด</small>
                            }
                        </div>

                         <div className="form-group">
                            <label>3. รูปแบบไฟล์ผลลัพธ์ (Output Format)</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input type="radio" value="csv" checked={outputFormat === 'csv'} onChange={(e) => setOutputFormat(e.target.value as any)} /> CSV
                                </label>
                                <label className="radio-label">
                                    <input type="radio" value="excel" checked={outputFormat === 'excel'} onChange={(e) => setOutputFormat(e.target.value as any)} /> Excel (.xlsx)
                                </label>
                                <label className="radio-label">
                                    <input type="radio" value="both" checked={outputFormat === 'both'} onChange={(e) => setOutputFormat(e.target.value as any)} /> ทั้งสองอย่าง
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="process-mode-select">4. วิธีการประมวลผล (Processing Method)</label>
                            <select
                                id="process-mode-select"
                                className="input-field"
                                value={processMode}
                                onChange={(e) => setProcessMode(e.target.value as any)}
                                disabled={files.length < 2}
                            >
                                <option value="individual">ประมวลผลแยกแต่ละไฟล์</option>
                                <option value="combined">รวมข้อมูลทุกไฟล์เป็นไฟล์เดียว</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>5. ตัวเลือกเพิ่มเติม (Additional Options)</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={includeProvince} 
                                        onChange={(e) => setIncludeProvince(e.target.checked)} 
                                    /> 
                                    เพิ่มคอลัมน์ "จังหวัด" จากชื่อไฟล์
                                </label>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn" disabled={!files.length || selectedSheets.length === 0 || isLoading}>
                                {isLoading ? <span className="loader"></span> : <><i className="fa-solid fa-bolt"></i> เริ่มประมวลผล</>}
                            </button>
                             <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleClear}
                                disabled={files.length === 0 && results.length === 0 && !isLoading}
                                aria-label="Clear all files and results"
                            >
                                <i className="fa-solid fa-eraser"></i> ล้างข้อมูล
                            </button>
                        </div>
                    </form>
                </section>
                <section className="results">
                    <h2><i className="fa-solid fa-chart-simple"></i> ผลลัพธ์</h2>
                    {isLoading && (
                         <div className="results-placeholder">
                            <span className="loader" style={{width: '50px', height: '50px', borderTopColor: 'var(--primary-color)'}}></span>
                            <p>กำลังประมวลผลไฟล์...</p>
                         </div>
                    )}
                    {!isLoading && results.length === 0 && (
                        <div className="results-placeholder">
                            <i className="fa-solid fa-list-check"></i>
                            <p>ผลลัพธ์จากการประมวลผลจะแสดงที่นี่</p>
                            <small>กรุณาทำตามขั้นตอนด้านซ้ายเพื่อเริ่ม</small>
                        </div>
                    )}
                    {!isLoading && results.length > 0 && (
                        <>
                            {successfulResultsCount > 1 && (
                                <div className="download-all-container">
                                    <button onClick={handleDownloadAll} className="btn download-all-btn">
                                        <i className="fa-solid fa-file-zipper"></i> ดาวน์โหลดทั้งหมด (.zip)
                                    </button>
                                </div>
                             )}
                            <ul className="result-list">
                                {results.map((result, index) => (
                                    <li key={index} className={`result-card ${result.error ? 'error' : (result.downloads ? 'success' : 'info')}`}>
                                        <div className="result-info">
                                            <p className="filename">
                                                <span className="filename-text">{result.originalFileName}</span>
                                                {result.rowCount !== undefined && !result.error && 
                                                    <span className="row-count">({result.rowCount.toLocaleString()} แถว)</span>
                                                }
                                            </p>
                                            {result.error && <p className="message error-message">{result.error}</p>}
                                        </div>
                                        <div className="result-actions">
                                            {result.downloads?.map(download => (
                                                <a 
                                                    key={download.fileName}
                                                    href="#" 
                                                    className="download-btn" 
                                                    onClick={(e) => { e.preventDefault(); downloadFile(download.blob, download.fileName); }}>
                                                    <i className="fa-solid fa-download"></i>
                                                    ดาวน์โหลด {download.type}
                                                </a>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);