import { format, isSaturday, isSunday, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';

export interface ThaiHoliday {
  date: string;
  name: string;
}

// Simple Thai Holiday calculation (static for common ones, could be improved)
// For a real app, we'd fetch this or use a more complex lunar calendar lib
export const DEFAULT_THAI_HOLIDAYS = (year: number): ThaiHoliday[] => [
  { date: `${year}-01-01`, name: 'วันขึ้นปีใหม่' },
  { date: `${year}-04-06`, name: 'วันจักรี' },
  { date: `${year}-04-13`, name: 'วันสงกรานต์' },
  { date: `${year}-04-14`, name: 'วันสงกรานต์' },
  { date: `${year}-04-15`, name: 'วันสงกรานต์' },
  { date: `${year}-05-01`, name: 'วันแรงงานแห่งชาติ' },
  { date: `${year}-05-04`, name: 'วันฉัตรมงคล' },
  { date: `${year}-06-03`, name: 'วันเฉลิมพระชนมพรรษาพระราชินี' },
  { date: `${year}-07-28`, name: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: `${year}-08-12`, name: 'วันแม่แห่งชาติ' },
  { date: `${year}-10-13`, name: 'วันคล้ายวันสวรรคต ร.9' },
  { date: `${year}-10-23`, name: 'วันปิยมหาราช' },
  { date: `${year}-12-05`, name: 'วันพ่อแห่งชาติ' },
  { date: `${year}-12-10`, name: 'วันรัฐธรรมนูญ' },
  { date: `${year}-12-31`, name: 'วันสิ้นปี' },
];

export interface MonthStats {
  month: string;
  monthIndex: number;
  year: number;
  totalDays: number;
  // Total counts (regardless of holidays)
  totalWorkDays: number;
  totalSaturdays: number;
  totalSundays: number;
  totalHolidays: number;
  // Specific counts
  holidaysOnWorkDays: number;
  // Net counts (exclusive for budget calculation)
  netWorkDays: number; // Mon-Fri non-holiday
  netHolidayDays: number; // Sat + Sun + Holidays on Mon-Fri
  dayOfWeekCounts: number[];
  holidayDates: string[];
}

export const getMonthStats = (month: number, year: number, customHolidays?: ThaiHoliday[]): MonthStats => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  const thaiHolidays = customHolidays || DEFAULT_THAI_HOLIDAYS(year);

  let totalHolidays = 0;
  let holidaysOnWorkDays = 0;
  let totalWorkDays = 0;
  let totalSaturdays = 0;
  let totalSundays = 0;
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
  const holidayDates: string[] = [];

  days.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const holiday = thaiHolidays.find(h => h.date === dateStr);
    const dayOfWeek = day.getDay();
    dayOfWeekCounts[dayOfWeek]++;

    if (holiday) {
      totalHolidays++;
      holidayDates.push(dateStr);
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        holidaysOnWorkDays++;
      }
    }

    if (dayOfWeek === 0) totalSundays++;
    else if (dayOfWeek === 6) totalSaturdays++;
    else totalWorkDays++;
  });

  return {
    month: format(start, 'MMMM'),
    monthIndex: month,
    year,
    totalDays: days.length,
    totalWorkDays,
    totalSaturdays,
    totalSundays,
    totalHolidays,
    holidaysOnWorkDays,
    netWorkDays: totalWorkDays - holidaysOnWorkDays,
    netHolidayDays: totalSaturdays + totalSundays + holidaysOnWorkDays,
    dayOfWeekCounts,
    holidayDates
  };
};

export const REGIONS = {
  BANGKOK: "กรุงเทพและปริมณฑล",
  CENTRAL: "ภาคกลาง",
  NORTH: "ภาคเหนือ",
  NORTHEAST: "ภาคตะวันออกเฉียงเหนือ",
  EAST: "ภาคตะวันออก",
  WEST: "ภาคตะวันตก",
  SOUTH: "ภาคใต้"
};

export const PROVINCE_REGIONS: Record<string, string> = {
  "กรุงเทพมหานคร": REGIONS.BANGKOK, "นครปฐม": REGIONS.BANGKOK, "นนทบุรี": REGIONS.BANGKOK, "ปทุมธานี": REGIONS.BANGKOK, "สมุทรปราการ": REGIONS.BANGKOK, "สมุทรสาคร": REGIONS.BANGKOK,
  "ชัยนาท": REGIONS.CENTRAL, "นครนายก": REGIONS.CENTRAL, "นครสวรรค์": REGIONS.CENTRAL, "พระนครศรีอยุธยา": REGIONS.CENTRAL, "พิจิตร": REGIONS.CENTRAL, "พิษณุโลก": REGIONS.CENTRAL, "ลพบุรี": REGIONS.CENTRAL, "สมุทรสงคราม": REGIONS.CENTRAL, "สระบุรี": REGIONS.CENTRAL, "สิงห์บุรี": REGIONS.CENTRAL, "สุโขทัย": REGIONS.CENTRAL, "สุพรรณบุรี": REGIONS.CENTRAL, "อ่างทอง": REGIONS.CENTRAL, "อุทัยธานี": REGIONS.CENTRAL, "กำแพงเพชร": REGIONS.CENTRAL, "เพชรบูรณ์": REGIONS.CENTRAL,
  "เชียงราย": REGIONS.NORTH, "เชียงใหม่": REGIONS.NORTH, "น่าน": REGIONS.NORTH, "พะเยา": REGIONS.NORTH, "แพร่": REGIONS.NORTH, "แม่ฮ่องสอน": REGIONS.NORTH, "ลำปาง": REGIONS.NORTH, "ลำพูน": REGIONS.NORTH, "อุตรดิตถ์": REGIONS.NORTH,
  "กาฬสินธุ์": REGIONS.NORTHEAST, "ขอนแก่น": REGIONS.NORTHEAST, "ชัยภูมิ": REGIONS.NORTHEAST, "นครพนม": REGIONS.NORTHEAST, "นครราชสีมา": REGIONS.NORTHEAST, "บึงกาฬ": REGIONS.NORTHEAST, "บุรีรัมย์": REGIONS.NORTHEAST, "มหาสารคาม": REGIONS.NORTHEAST, "มุกดาหาร": REGIONS.NORTHEAST, "ยโสธร": REGIONS.NORTHEAST, "ร้อยเอ็ด": REGIONS.NORTHEAST, "เลย": REGIONS.NORTHEAST, "ศรีสะเกษ": REGIONS.NORTHEAST, "สกลนคร": REGIONS.NORTHEAST, "สุรินทร์": REGIONS.NORTHEAST, "หนองคาย": REGIONS.NORTHEAST, "หนองบัวลำภู": REGIONS.NORTHEAST, "อำนาจเจริญ": REGIONS.NORTHEAST, "อุดรธานี": REGIONS.NORTHEAST, "อุบลราชธานี": REGIONS.NORTHEAST,
  "จันทบุรี": REGIONS.EAST, "ฉะเชิงเทรา": REGIONS.EAST, "ชลบุรี": REGIONS.EAST, "ตราด": REGIONS.EAST, "ปราจีนบุรี": REGIONS.EAST, "ระยอง": REGIONS.EAST, "สระแก้ว": REGIONS.EAST,
  "กาญจนบุรี": REGIONS.WEST, "ตาก": REGIONS.WEST, "ประจวบคีรีขันธ์": REGIONS.WEST, "เพชรบุรี": REGIONS.WEST, "ราชบุรี": REGIONS.WEST,
  "กระบี่": REGIONS.SOUTH, "ชุมพร": REGIONS.SOUTH, "ตรัง": REGIONS.SOUTH, "นครศรีธรรมราช": REGIONS.SOUTH, "นราธิวาส": REGIONS.SOUTH, "ปัตตานี": REGIONS.SOUTH, "พังงา": REGIONS.SOUTH, "พัทลุง": REGIONS.SOUTH, "ภูเก็ต": REGIONS.SOUTH, "ยะลา": REGIONS.SOUTH, "ระนอง": REGIONS.SOUTH, "สงขลา": REGIONS.SOUTH, "สตูล": REGIONS.SOUTH, "สุราษฎร์ธานี": REGIONS.SOUTH
};

export const PROVINCES = Object.keys(PROVINCE_REGIONS).sort((a, b) => a.localeCompare(b, 'th'));

export interface ShiftProfile {
  id: string;
  name: string;
  normalHours: number;
  otHours: number;
  shiftsPerPoint: number;
}

export const SHIFT_PROFILES: ShiftProfile[] = [
  {
    id: 'p1',
    name: 'ทำงานทุกวัน 24 ชั่วโมง ผลัดละ 8 ชั่วโมง (ไม่มี OT) 3 ผลัด เริ่ม 07.00 น.',
    normalHours: 8,
    otHours: 0,
    shiftsPerPoint: 3,
  },
  {
    id: 'p2',
    name: 'ทำงานกลางคืน 8 ชั่วโมง (ไม่มี OT) 1 ผลัด เริ่ม 19.00 น.',
    normalHours: 8,
    otHours: 0,
    shiftsPerPoint: 1,
  },
  {
    id: 'p3',
    name: 'ทำงานกลางคืน 12 ชั่วโมง (ไม่มี OT) 2 ผลัด เริ่ม 18.00 น.',
    normalHours: 12,
    otHours: 0,
    shiftsPerPoint: 2,
  },
  {
    id: 'p4',
    name: 'ทำงานกลางคืน 12 ชั่วโมง (มี OT 4 ชม.) 1 ผลัด เริ่ม 18.00 น.',
    normalHours: 8,
    otHours: 4,
    shiftsPerPoint: 1,
  }
];
