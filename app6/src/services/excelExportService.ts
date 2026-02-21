import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format, parse } from 'date-fns';

interface ExportData {
    rows: any[];
    startDate: string;
    endDate: string;
    settings: any;
    periodStats: any;
    profiles: any[];
    calculateBudget: (row: any) => any;
}

export const exportBudgetToExcel = async (data: ExportData) => {
    const { rows, startDate, endDate, settings, periodStats, profiles, calculateBudget } = data;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Security Budget');

    // Set default column widths
    worksheet.columns = [
        { width: 5 },  // No.
        { width: 30 }, // Location
        { width: 12 }, // Min Wage
        { width: 15 }, // Daily Rate
        { width: 12 }, // Points
        { width: 10 }, // People
        { width: 12 }, // Shifts
        { width: 18 }, // Base Total
        { width: 18 }, // Management Fee
        { width: 18 }, // Social Security
        { width: 20 }, // Grand Total
    ];

    // Title
    const titleRow = worksheet.addRow(['รายงานสรุปงบประมาณค่าจ้างรักษาความปลอดภัย']);
    titleRow.font = { size: 16, bold: true };
    worksheet.mergeCells(`A${titleRow.number}:K${titleRow.number}`);
    titleRow.alignment = { horizontal: 'center' };

    // Period
    const startD = parse(startDate, 'yyyy-MM', new Date());
    const endD = parse(endDate, 'yyyy-MM', new Date());
    const periodText = `ประจำช่วงเวลา ${format(startD, 'MMMM yyyy')} ถึง ${format(endD, 'MMMM yyyy')}`;
    const periodRow = worksheet.addRow([periodText]);
    periodRow.font = { size: 12 };
    worksheet.mergeCells(`A${periodRow.number}:K${periodRow.number}`);
    periodRow.alignment = { horizontal: 'center' };

    worksheet.addRow([]); // Empty row

    // Header
    const headerRow = worksheet.addRow([
        'ลำดับ',
        'สถานที่',
        'ค่าแรงขั้นต่ำ',
        'ปฏิบัติงานปกติ (8 ชม.)',
        'จำนวนสถานที่ (จุด รปภ.)',
        'จำนวนคน',
        'จำนวนผลัด',
        `ค่าจ้างแรงงาน ${periodStats ? Math.floor(periodStats.totalDays / 30) : 0} เดือน`,
        `ค่าใช้จ่ายบริหารจัดการ ${settings.managementFeeRate}%`,
        `เงินสมทบ ${settings.socialSecurityRate}%`,
        'รวม (บาท)'
    ]);

    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' } // slate-100
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    headerRow.height = 40;

    // Data Rows
    rows.forEach((row, index) => {
        const b = calculateBudget(row);
        if (!b) return;

        const profile = profiles.find(p => p.id === row.selectedProfileId) || profiles[0];
        const dailyRatePerPerson = (profile.normalHours * (row.minWage / 8));
        const peopleCount = row.points * Math.max(profile.shiftsPerPointNormal, profile.shiftsPerPointHoliday);
        const totalShifts = b.totalShiftsCombined * row.points;

        const dataRow = worksheet.addRow([
            index + 1,
            `${row.location}${row.province !== 'กรุงเทพมหานคร' ? ` (${row.province})` : ''}`,
            row.minWage,
            dailyRatePerPerson,
            row.points,
            peopleCount,
            totalShifts,
            b.baseTotal,
            b.managementFee,
            b.socialSecurity,
            b.grandTotal
        ]);

        dataRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Number formatting
            if (colNumber >= 3) {
                cell.numFmt = colNumber >= 8 ? '#,##0.00' : '#,##0';
                cell.alignment = { horizontal: colNumber >= 8 ? 'right' : 'center' };
            } else {
                cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left' };
            }
        });
    });

    // Footer Totals Row
    const totalBase = rows.reduce((acc, r) => acc + (calculateBudget(r)?.baseTotal || 0), 0);
    const totalManagement = rows.reduce((acc, r) => acc + (calculateBudget(r)?.managementFee || 0), 0);
    const totalSocial = rows.reduce((acc, r) => acc + (calculateBudget(r)?.socialSecurity || 0), 0);
    const totalGrand = rows.reduce((acc, r) => acc + (calculateBudget(r)?.grandTotal || 0), 0);
    const totalPoints = rows.reduce((acc, r) => acc + r.points, 0);
    const totalPeople = rows.reduce((acc, r) => {
        const p = profiles.find(pr => pr.id === r.selectedProfileId) || profiles[0];
        return acc + (r.points * Math.max(p.shiftsPerPointNormal, p.shiftsPerPointHoliday));
    }, 0);
    const totalShiftsCombined = rows.reduce((acc, r) => acc + ((calculateBudget(r)?.totalShiftsCombined || 0) * r.points), 0);

    const footerRow = worksheet.addRow([
        'รวมทั้งสิ้น',
        '',
        '',
        '',
        totalPoints,
        totalPeople,
        totalShiftsCombined,
        totalBase,
        totalManagement,
        totalSocial,
        totalGrand
    ]);

    worksheet.mergeCells(`A${footerRow.number}:D${footerRow.number}`);
    footerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' } // slate-50
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        if (colNumber >= 5) {
            cell.numFmt = colNumber >= 8 ? '#,##0.00' : '#,##0';
            cell.alignment = { horizontal: colNumber >= 8 ? 'right' : 'center' };
        } else {
            cell.alignment = { horizontal: 'center' };
        }
    });

    worksheet.addRow([]); // Empty row

    // VAT and Net Total
    const vat = totalGrand * 0.07;
    const netTotal = totalGrand * 1.07;

    const vatRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', 'ภาษีมูลค่าเพิ่ม 7%', vat]);
    vatRow.getCell(10).font = { bold: true };
    vatRow.getCell(11).numFmt = '#,##0.00';
    vatRow.getCell(11).border = { bottom: { style: 'thin' } };

    const netTotalRow = worksheet.addRow(['', '', '', '', '', '', '', '', '', 'วงเงินเสนอราคารวมภาษีมูลค่าเพิ่ม', netTotal]);
    netTotalRow.getCell(10).font = { bold: true };
    netTotalRow.getCell(11).font = { bold: true };
    netTotalRow.getCell(11).numFmt = '#,##0.00';
    netTotalRow.alignment = { horizontal: 'right' };

    // Generate and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `security-budget-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
