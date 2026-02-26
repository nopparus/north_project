(1/4) Installing ncurses-terminfo-base (6.5_p20251123-r0)
(2/4) Installing libncursesw (6.5_p20251123-r0)
(3/4) Installing readline (8.3.1-r0)
(4/4) Installing sqlite (3.51.2-r0)
Executing busybox-1.37.0-r30.trigger
OK: 10.6 MiB in 20 packages
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO users VALUES(1,'admin','$2a$10$lgONTZaas5tyWHbkyZQVzOBV8T79bblXn5W7DrKTJ7eeSHPR0lVQ6','admin','2026-02-06 10:06:38');
CREATE TABLE apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'Dev',
      color TEXT DEFAULT 'text-zinc-100',
      path TEXT NOT NULL,
      app_type TEXT DEFAULT 'internal',
      iframe_src TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO apps VALUES('rd-processor','RD Smart Processor','เครื่องมือจัดการข้อมูลมิเตอร์อัจฉริยะ RD03/RD05','Data','text-cyan-400','/app1','iframe','/app1/',0,'2026-02-06 10:18:46');
INSERT INTO apps VALUES('ems-transform','EMS แปลงค่าไฟฟ้า','แปลงข้อมูลค่าไฟฟ้าจาก Excel เป็น CSV','Cloud','text-yellow-400','/app2','iframe','/app2/',1,'2026-02-06 10:18:46');
INSERT INTO apps VALUES('file-merger','Excel & CSV Merger','รวม Excel/CSV หลายไฟล์เข้าเป็นหนึ่ง','Stack','text-orange-400','/app3','iframe','/app3/',2,'2026-02-06 10:18:46');
CREATE TABLE pms_projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      color TEXT DEFAULT '#3b82f6',
      equipment_types TEXT DEFAULT '[]',
      work_type TEXT NOT NULL DEFAULT 'PM',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO pms_projects VALUES('proj-pm-1','โครงการบำรุงรักษาประจำปี 2568 (ภาคเหนือ)','active','#3b82f6','["AC","Battery","Rectifier","Generator","Transformer"]','PM','2026-02-12 02:37:05');
INSERT INTO pms_projects VALUES('proj-pm-2','โครงการ PM ฉุกเฉินและซ่อมแซม Q1/2568','active','#8b5cf6','["AC","Battery","Generator"]','PM','2026-02-12 02:37:05');
INSERT INTO pms_projects VALUES('proj-survey-1','โครงการสำรวจสภาพชุมสายภาคเหนือ 2568','active','#10b981','["Infrastructure","Security","Environment","Power System"]','Survey','2026-02-12 02:37:05');
CREATE TABLE pms_locations (
      id TEXT PRIMARY KEY,
      province TEXT NOT NULL,
      site_name TEXT NOT NULL,
      num_facilities INTEGER DEFAULT 0,
      num_generators INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO pms_locations VALUES('loc-1','เชียงใหม่','ศูนย์เชียงใหม่ 1',54,50,'2026-02-12 02:37:05');
INSERT INTO pms_locations VALUES('loc-2','เชียงราย','ศูนย์เชียงราย 1',14,14,'2026-02-12 02:37:05');
INSERT INTO pms_locations VALUES('loc-3','ลำปาง','ศูนย์ลำปาง 1',22,18,'2026-02-12 02:37:05');
CREATE TABLE pms_records (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      work_type TEXT NOT NULL DEFAULT 'PM',
      site_id TEXT NOT NULL,
      equipment_type TEXT NOT NULL,
      date TEXT NOT NULL,
      inspector TEXT NOT NULL,
      co_inspector TEXT,
      status TEXT DEFAULT 'Pending',
      data TEXT DEFAULT '{}',
      notes TEXT,
      condition_rating INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES pms_projects(id) ON DELETE CASCADE
    );
INSERT INTO pms_records VALUES('rec-1','proj-pm-1','PM','loc-1','AC','2025-03-10','สมชาย มั่นใจ',NULL,'Normal','{}','PM1 ล้างคอยล์เรียบร้อย น้ำยาปกติ',NULL,'2026-02-12 02:37:05');
INSERT INTO pms_records VALUES('rec-2','proj-pm-1','PM','loc-2','Battery','2025-04-05','วิชัย สมาน','ประสิทธิ์ ดีงาม','Abnormal','{}','พบ Cell เสื่อมสภาพ 3 ลูก แรงดันต่ำกว่าเกณฑ์ ต้องเปลี่ยน',NULL,'2026-02-12 02:37:05');
INSERT INTO pms_records VALUES('rec-3','proj-survey-1','Survey','loc-3','Infrastructure','2025-02-20','เก่งกาจ สำรวจดี','สมหญิง รักดี','Normal','{}','โครงสร้างอาคารอยู่ในสภาพดี ไม่พบรอยร้าวหรือการทรุดตัว',5,'2026-02-12 02:37:05');
CREATE TABLE pms_schedule_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      equipment_type TEXT NOT NULL,
      start_month INTEGER NOT NULL,
      duration INTEGER NOT NULL DEFAULT 1,
      label TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES pms_projects(id) ON DELETE CASCADE
    );
INSERT INTO pms_schedule_items VALUES('sch-1','proj-pm-1','AC',2,2,'PM เครื่องปรับอากาศ (ล้างคอยล์)','2026-02-12 02:37:05');
INSERT INTO pms_schedule_items VALUES('sch-2','proj-pm-1','Battery',5,2,'PM แบตเตอรี่ (Capacity Test)','2026-02-12 02:37:05');
INSERT INTO pms_schedule_items VALUES('sch-3','proj-pm-1','Generator',8,3,'PM เครื่องกำเนิดไฟฟ้า (Annual Service)','2026-02-12 02:37:05');
CREATE TABLE app6_shift_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalHours INTEGER DEFAULT 8,
      otHours INTEGER DEFAULT 0,
      holidayNormalHours INTEGER DEFAULT 8,
      holidayOtHours INTEGER DEFAULT 0,
      shiftsPerPointNormal INTEGER DEFAULT 1,
      shiftsPerPointHoliday INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO app6_shift_profiles VALUES('p1','ทำงานทุกวัน 24 ชั่วโมง 8*3 ผลัด',8,0,8,0,3,3,'2026-02-21 09:29:05');
INSERT INTO app6_shift_profiles VALUES('p2','ทำงานทุกวัน 8 ชั่วโมง 1 ผลัด',8,0,8,0,1,1,'2026-02-21 09:29:05');
INSERT INTO app6_shift_profiles VALUES('p3','ทำงานทุกวัน 12 ชั่วโมง 2 ผลัด',6,0,6,0,2,2,'2026-02-21 09:29:05');
INSERT INTO app6_shift_profiles VALUES('p4','ทำงานทุกวัน 12 ชั่วโมง (มี OT 4 ชม.) 1 ผลัด',8,4,8,4,1,1,'2026-02-21 09:29:05');
INSERT INTO app6_shift_profiles VALUES('p1771666679662','ทำงานทุกวัน 16 ชั่วโมง 8*2 ผลัด เริ่ม 16.00 จบ 8.00',8,0,8,0,2,2,'2026-02-21 09:37:59');
INSERT INTO app6_shift_profiles VALUES('p1771667015959','วันทำงานปกติ 8 ชั่วโมง 1 ผลัด วันหยุด  24 ชั่วโมง 8*3 ผลัด',8,0,8,0,1,3,'2026-02-21 09:43:35');
INSERT INTO app6_shift_profiles VALUES('p1771675507655','วันทำงานปกติ 12 ชม. 1 ผลัด  วันหยุด 24 ชม. 12*2 ผลัด (No OT)',12,0,12,0,1,2,'2026-02-21 12:05:07');
INSERT INTO app6_shift_profiles VALUES('p1771677466292','วันทำงานปกติ 12 ชม. 1 ผลัด  วันหยุด 24 ชม. 12*2 ผลัด (OT)',8,4,8,4,1,2,'2026-02-21 12:37:46');
INSERT INTO app6_shift_profiles VALUES('p1771677630759','วันทำงานปกติ 12 ชม. 1 ผลัด (OT) วันหยุด 24 ชม. 8*3 ผลัด',8,4,8,0,1,3,'2026-02-21 12:40:31');
INSERT INTO app6_shift_profiles VALUES('p1771683464781','วันทำงานปกติ 12 ชม. 2 ผลัด วันหยุด 24 ชม. 8*3 ผลัด',6,0,8,0,2,3,'2026-02-21 14:17:45');
CREATE TABLE app6_minimum_wages (
      province TEXT PRIMARY KEY,
      wage INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE app6_holidays (
      date TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO app6_holidays VALUES('2024-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2024-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2025-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2026-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2027-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2028-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2029-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2030-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2031-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2032-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2033-12-31','วันสิ้นปี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-01-01','วันขึ้นปีใหม่','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-04-06','วันจักรี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-04-13','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-04-14','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-04-15','วันสงกรานต์','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-05-01','วันแรงงานแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-05-04','วันฉัตรมงคล','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-06-03','วันเฉลิมพระชนมพรรษาพระราชินี','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-07-28','วันเฉลิมพระชนมพรรษา ร.10','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-08-12','วันแม่แห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-10-13','วันคล้ายวันสวรรคต ร.9','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-10-23','วันปิยมหาราช','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-12-05','วันพ่อแห่งชาติ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-12-10','วันรัฐธรรมนูญ','2026-02-25 01:35:07');
INSERT INTO app6_holidays VALUES('2034-12-31','วันสิ้นปี','2026-02-25 01:35:07');
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',1);
PRAGMA writable_schema=OFF;
COMMIT;
