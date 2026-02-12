
import { GroupRule } from './types';

export const RD05_COLS = [
  "PEA", "Route_Name", "Tag", "Owner", "Concession",
  "Line_Type", "Diameter", "Cores", "Total_Poles", "Poles_in_Area",
  "Total_Distance", "Distance_in_Area", "Installation", "Compensation",
  "Start_Coordinates", "End_Coordinates", "Tag_of_Poles_Pass",
  "Data_Source", "Username", "Name_Lastname", "Date_Edit"
];

export const RD03_COLS = [
  "PEA", "Route_Name", "Tag", "Owner", "Concession",
  "Line_Type", "Diameter", "Cores", "Total_Poles", "Poles_in_Area",
  "Total_Distance", "Distance_in_Area", "Installation", "Notes",
  "Start_Coordinates", "End_Coordinates", "Tag_of_Poles_Pass",
  "Data_Source", "Username", "Name_Lastname"
];

// รายชื่อสำหรับการจัดกลุ่ม GroupConcession ตามสคริปต์ Python
export const DIGI_LIST = [
  'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม', 
  'กระทรวงดิจิทัลเศรษฐกิจและสังคมตรวจสอบเส้นทางแล้ว'
];

export const NBTC_LIST = ['NBTC/CAT', 'NBTC/TOT'];

export const NT_LIST = [
  '-', 'บริษัท กสท โทรคมนาคม จำกัด(มหาชน)', 'บริษัท ทีโอที จำกัด(มหาชน)',
  'ย้ายข้อมูลจากTAMS1', 'Cleansing ข้อมูลสายสื่อสาร', 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)'
];

export const CON_NT_LIST = [
  'บริษัท ทีทีแอนด์ที จำกัด (มหาชน)', 'บริษัท แอดวานซ์ อินโฟร์เซอร์วิส จำกัด (มหาชน)',
  'CAT-TAC #สัมปทาน', 'TOT/AIS #สัมปทาน', 'TOT-TT&T #สัมปทาน',
  'บริษัท โทเทิ่ล แอ็คเซ็ส คอมมูนิเคชั่น จำกัด (มหาชน)', 'บริษัท บีเอฟเคที จำกัด'
];

export const NON_NT_LIST = [
  'Big Patrol', 'CAT-SINET #สัมปทาน', 'CAT-TRUE #สัมปทาน', 'เคเบิ้ลทีวี (รวม)',
  'บริษัท เอแอลที เทเลคอม จำกัด (มหาชน)', 'บริษัท แอดวานซ์ ไวร์เลส เน็ทเวอร์ค จำกัด',
  'บริษัท ไซแมท เทคโนโลยี จำกัด (มหาชน)', 'บริษัท ดีแทค ไตรเน็ต จำกัด',
  'บริษัท ทริปเปิลที บรอดแบนด์ จำกัด (มหาชน)', 'บริษัท ทริปเปิลที อินเทอร์เน็ต จำกัด',
  'บริษัท ทรู มูฟ เอช ยูนิเวอร์แซล คอมมิวนิเคชั่น จำกัด', 'บริษัท ทรู มูฟ จำกัด (มหาชน)',
  'บริษัท ทรู อินเทอร์เน็ต คอร์ปอเรชั่น จำกัด', 'บริษัท พีทีที  ไอซีที โซลูชั่น จำกัด',
  'บริษัท ยูไนเต็ด อินฟอร์เมชั่น ไฮเวย์ จำกัด', 'บริษัท อินเตอร์ลิ้งค์ เทเลคอม จำกัด (มหาชน)',
  'บริษัท ฮัทชิสัน ซีเอที ไวร์เลส มัลติมีเดีย จำกัด', 'สำนักงานบริหารเทคโนโลยีสารสนเทศเพื่อพัฒนาการศึกษา (สกอ.)'
];

// เงื่อนไขเริ่มต้นของ RD03 ที่ถอดจาก Python Logic
export const DEFAULT_RD03_RULES: GroupRule[] = [
  // Group 1 Logic
  { 
    id: '1.1', name: 'กระทรวงดิจิทัล', priority: 1,
    conditions: [{ column: 'GroupConcession', operator: 'equals', value: 'กระทรวงดิจิทัล' }]
  },
  { 
    id: '1.2', name: 'กสทช', priority: 2,
    conditions: [{ column: 'GroupConcession', operator: 'equals', value: 'กสทช' }]
  },
  { 
    id: '1.3', name: 'Coaxial Cable', priority: 3,
    conditions: [{ column: 'Line_Type', operator: 'equals', value: 'เส้นทองแดง(Coaxial)' }]
  },
  { 
    id: '1.4', name: 'ไม่ใช่สัมปทาน NT', priority: 4,
    conditions: [{ column: 'GroupConcession', operator: 'equals', value: 'ไม่ใช่สัมปทาน NT' }]
  },
  { 
    id: '1.4', name: 'สัมปทาน NT (ADSS/ARSS/Dropwire)', priority: 5,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'สัมปทาน NT' },
      { column: 'Line_Type', operator: 'in_list', value: ['เส้นใยแก้วนำแสง(ADSS)', 'เส้นใยแก้วนำแสง(ARSS)', 'เส้นใยแก้วนำแสง(dropwire)'] }
    ]
  },
  
  // Group 2 Logic (NT)
  { 
    id: '2.1.2', name: 'NT Copper Dropwire', priority: 10,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นทองแดง(Dropwire)' }
    ]
  },
  { 
    id: '2.2.1', name: 'NT Fiber Dropwire (Small & Short)', priority: 11,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นใยแก้วนำแสง(dropwire)' },
      { column: 'Diameter', operator: 'between', value: [5, 8] },
      { column: 'Cores', operator: 'in_list', value: [1, 2] },
      { column: 'Total_Distance', operator: 'between', value: [0.0001, 0.5] }
    ]
  },
  { 
    id: '2.2.3', name: 'NT Fiber Dropwire (Large or Long)', priority: 12,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นใยแก้วนำแสง(dropwire)' },
      { column: 'Cores', operator: 'in_list', value: [1, 2] },
      { column: 'Total_Distance', operator: 'between', value: [0.50001, 999999] }
    ]
  },

  // Group 3 Logic
  { 
    id: '3.1.2', name: 'NT Copper CU', priority: 20,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นทองแดง(CU)' }
    ]
  },

  // Group 4 Logic (NT Fiber Figs)
  { 
    id: '4.1.1', name: 'NT Fig.8 Standard Spec', priority: 30,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นใยแก้วนำแสง(Fig.8)' }
    ]
  },
  { 
    id: '4.2.1', name: 'NT ADSS Standard Spec', priority: 31,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นใยแก้วนำแสง(ADSS)' }
    ]
  }
];

export const DEFAULT_RD05_RULES: GroupRule[] = [
  { 
    id: '1.1', name: 'กระทรวงดิจิทัล', priority: 1,
    conditions: [{ column: 'GroupConcession', operator: 'equals', value: 'กระทรวงดิจิทัล' }]
  },
  { 
    id: '2.1', name: 'NT Fiber Dropwire (Short)', priority: 2,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นใยแก้วนำแสง(dropwire)' },
      { column: 'Diameter', operator: 'between', value: [5, 8] },
      { column: 'Total_Distance', operator: 'between', value: [0.0001, 0.4999] }
    ]
  },
  { 
    id: '2.2', name: 'NT Copper Dropwire', priority: 3,
    conditions: [
      { column: 'GroupConcession', operator: 'equals', value: 'NT' },
      { column: 'Line_Type', operator: 'equals', value: 'เส้นทองแดง(Dropwire)' }
    ]
  },
  { 
    id: '3.0', name: 'Default Others', priority: 100,
    conditions: [] // Fallback rule
  }
];
