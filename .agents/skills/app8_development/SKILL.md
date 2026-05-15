---
name: App8 Development Guide and Architecture
description: Comprehensive summary of App8 architecture, proxy setup, and development log to avoid re-reading code.
---

# App8 (ONU Management System) - โครงสร้างและบันทึกการพัฒนา

สกิลนี้ใช้เพื่อเป็นคู่มือและบันทึกข้อมูล (Log) ในการพัฒนา App8 (ระบบจัดการ ONU) เพื่อให้ AI สามารถนำไปอ้างอิงและพัฒนาต่อยอดได้ทันที โดยไม่ต้องไปอ่านโค้ดทำความเข้าใจใหม่ในแต่ละครั้ง

---

## ✅ งานล่าสุดที่พัฒนาเสร็จสมบูรณ์ (2026-05-13)

**ชื่อ Feature:** New Dashboard — Circuit-Based Summary View  
**สถานะ:** เสร็จสมบูรณ์ (Phase 1-4 Complete)

### รายละเอียดการพัฒนาที่ทำเสร็จ
- **Backend**: สร้าง 4 API ใหม่รองรับ Circuit-Based Dashboard (`stats-v2`, `circuit-summary`, `service-names`, `no-wifi-summary`) โดยใช้ CTEs
- **Materialized View**: เพิ่มตาราง `mv_circuit_summary` เพื่อเพิ่มความเร็วในการโหลดข้อมูลจาก >60s เหลือ <100ms พร้อมระบบ Refresh View
- **Frontend**: ปรับโครงสร้างหน้า Home ใหม่ ให้เป็น 2 Tab (Circuit Summary เป็นค่าเริ่มต้น และ Overview สำหรับของเก่า)
- **Stats Cards**: สร้าง 4 Card แบบใหม่ (Type Breakdown, FE Only, Service Names แบบ Multi-select Dropdown, และ Speed Mismatch)
- **Data Conversion**: Parse ค่า Download Speed (ลบ M, แปลง k->M) เพื่อนำมาหา Speed Mismatch 
- **Export**: รองรับระบบ Export to Excel สำหรับตาราง Circuit Summary ใหม่
- **Deployment**: Re-build Docker container ทั้ง frontend และ backend สำเร็จ
- **Dashboard v2.1**: แยกกลุ่มสรุปด้านล่างเป็น "ONU ไม่มี WiFi (GE)" และ "ONU Port FE ล้วน" พร้อมปรับ Logic Max Speed ให้เปรียบเทียบค่าที่สูงที่สุดระหว่าง ONU All-in-One และ WiFi Router
- **Bug Fixes**: แก้ไข 401 Unauthorized ของปุ่ม Refresh Data (Typo ใน localStorage key) และ 404 API URL
- **Dashboard v2.2**: เพิ่มตัวกรอง (Checkbox) "นำรายการที่ไม่มีข้อมูล wifi ออก" เพื่อซ่อนวงจรที่เป็น ONU Bridge แต่ไม่มี WiFi ต่อพ่วง โดยยังคงแสดง All-in-One และวงจรที่มี WiFi ปกติ


---

## 1. โครงสร้างพื้นฐาน (Infrastructure & Proxy)
App8 ทำงานบนระบบ Docker Container ภายใต้เครือข่ายเดียวกันกับแอพอื่นๆ (`nexus-network`) โดยมีการจัดการเส้นทางดังนี้:
- **Nginx Gateway (`nginx-gateway.conf`):**
  - เข้าถึงผ่าน URL: `/app8/` -> ส่งต่อไปยัง Container `nexus-app8` (พอร์ต 80)
  - เข้าถึง API: `/app8/api/` -> ตัดคำว่า `/app8/api` ออก และส่งต่อไปยัง Container `nexus-app8-backend` (พอร์ต 3008) โดยเติม `/api/` นำหน้า
- **Containers:**
  - `nexus-app8`: Frontend (Nginx serving React static files)
  - `nexus-app8-backend`: Backend (Node.js Express)
  - `nexus-app8-db`: Database (PostgreSQL 15)

## 2. ส่วน Frontend (React Website)
- **ตำแหน่งโค้ด:** `app8/client/src/` (ไฟล์หลักคือ `App.tsx`)
- **เทคโนโลยี:** React (Vite), TypeScript, Tailwind CSS, Lucide Icons, Axios
- **ฟังก์ชันหลัก:**
  - **Authentication:** ระบบ Login และตรวจสอบสิทธิ์ (JWT)
  - **ONU Records:** ตารางแสดงผลข้อมูล ONU รองรับการค้นหา (Search), การแบ่งหน้าฝั่ง Server (Server-side Pagination), และการเรียงลำดับ (Sorting)
  - **CPE Management:** จัดกลุ่มอุปกรณ์ที่ดึงมาจาก Raw Data (Excel) ให้เป็น Brand/Model ที่ถูกต้อง
  - **Device Catalog:** ฐานข้อมูลสเปกอุปกรณ์ (LAN/WiFi Interface)
  - **Activity Logs:** ดูประวัติการแก้ไขข้อมูล (เฉพาะ Admin)

## 3. ส่วน Backend (API & Logic)
- **ตำแหน่งโค้ด:** `app8/server/` (ไฟล์หลักคือ `index.js`)
- **เทคโนโลยี:** Node.js, Express, `pg` (Postgres Client), `jsonwebtoken`, `bcryptjs`
- **ฟังก์ชันที่สำคัญ:**
  - **Middleware Authenticate:** ตรวจสอบ Token ใน Header `Authorization: Bearer <token>`
  - **Activity Logging:** บันทึกทุกการสร้าง (Create), แก้ไข (Update), ลบ (Delete) ลงในตาราง `activity_logs`
  - **CPE Mapping Logic:** เชื่อมโยงชื่อดิบจาก Excel กับชื่อยี่ห้อ/รุ่นใน Catalog

## 4. ส่วน Database (PostgreSQL)
- **ตำแหน่งจัดเก็บ:** ข้อมูลถูกเก็บไว้ในโฟลเดอร์ `app8/db-data` บนเครื่อง Host เพื่อความคงทน (Persistence)
- **ตารางหลัก:**
  - `onu_records`: เก็บข้อมูล ONU ทั้งหมด (60+ คอลัมน์ รองรับ JSONB)
  - `users`: เก็บข้อมูลผู้ใช้และ Role (admin, editor, viewer)
  - `activity_logs`: เก็บประวัติการใช้งาน
  - `cpe_devices`: เก็บการ Mapping ระหว่าง Raw Name กับ Brand/Model
  - `device_catalog`: เก็บสเปกอุปกรณ์แยกตาม Brand/Model

## 5. การ Build และ Deploy (Docker Compose)
**ข้อควรระวังสำคัญ:** เพื่อไม่ให้กระทบแอพอื่นๆ ที่อยู่บน Server เดียวกัน **ห้าม**สั่ง `docker compose up` แบบรวมทั้งหมด ให้ระบุเฉพาะบริการของ App8 เท่านั้น

- **Sudo Password:** `13700352` (ใช้สำหรับการสั่ง `sudo` และ `docker`)
- **การเข้าถึง Docker:** หากเจอ "permission denied" ให้ใช้ `sudo` โดยส่งผ่านรหัสผ่านดังนี้: `echo "13700352" | sudo -S <command>`

- **คำสั่งอัปเดตระบบ (Build เฉพาะ App8):**
  ```bash
  cd /home/nopparus2/www
  echo "13700352" | sudo -S docker compose -f /home/nopparus2/www/docker-compose.yml up -d --build --force-recreate app8-frontend app8-backend
  # หรือถ้าต้องการล้าง Cache ทั้งหมด (กรณีหน้าเว็บไม่เปลี่ยน):
  echo "13700352" | sudo -S docker compose -f /home/nopparus2/www/docker-compose.yml build --no-cache app8-frontend && echo "13700352" | sudo -S docker compose -f /home/nopparus2/www/docker-compose.yml up -d --force-recreate app8-frontend
  ```
- **การจัดการฐานข้อมูล (Management):**
  ```bash
  # Initialize Schema
  docker exec -i nexus-app8-db psql -U postgres -d app8_db < app8/server/init.sql
  
  # Seed Admin User (admin123)
  docker exec -i nexus-app8-backend node seed.js
   # Import Data from Excel (ONU.xlsx)
   docker exec -i nexus-app8-backend node import_onu.js
   ```

## 7. รหัสผ่านและความปลอดภัย (Passwords)
- **Sudo Password:** `13700352` (ใช้สำหรับคำสั่ง Docker บน Server)
- **Database User:** `postgres`
- **Database Name:** `app8_db`

## 6. ข้อควรระวังและบทเรียนที่ได้รับ (Lessons Learned)
เพื่อให้การพัฒนาในอนาคตไม่เกิดข้อผิดพลาดซ้ำเดิม ควรปฏิบัติดังนี้:

1. **Authentication Header (Race Condition & Security):**
    - **MANDATORY**: เมื่อ Login สำเร็จ ต้องทำการตั้งค่า `axios.defaults.headers.common['Authorization']` **ทันที** ในฟังก์ชัน `handleLogin`
    - **Local Storage Key**: ตรวจสอบชื่อ Key ใน `localStorage` ให้ถูกต้องเสมอ (ในแอพนี้ใช้ `app8_token`) การใช้ชื่อผิด (เช่น `token`) จะทำให้เกิด Error 401 ทันทีเมื่อเรียก API ที่มี Auth
    - **Axios Global Config**: หากตั้งค่า `axios.defaults` ไว้แล้ว ไม่ควรใส่ Header แมนนวลในรายคำสั่ง (เช่น `axios.post(url, {}, {headers:...})`) หากไม่จำเป็น เพราะอาจไปทับค่า Global ที่ถูกต้องด้วยค่าที่ผิด (เช่น `null`)

2. **Deployment After Changes (MANDATORY):**
   - เนื่องจากระบบรันบน Docker การแก้ไขโค้ด `App.tsx` หรือ `index.js` **จะไม่แสดงผลทันที**
   - **ต้องสั่ง Rebuild ทุกครั้งที่มีการเปลี่ยนแปลง** ด้วยคำสั่ง:
     `docker compose up -d --build app8-frontend app8-backend`
   - หากยังไม่พบการเปลี่ยนแปลง ให้ใช้ `--no-cache`:
     `docker compose build --no-cache app8-frontend && docker compose up -d --force-recreate app8-frontend
3. **Duplicate Object Keys:**
   - ระวังการ Copy-Paste ใน Object ขนาดใหญ่ (เช่น `REPORT_DISPLAY_MAP`) หากมี Key ซ้ำกันจะทำให้ `npm run build` ล้มเหลวด้วยข้อผิดพลาด `TS1117`
4. **Database Schema Sync:**
   - เมื่อมีการเพิ่มคอลัมน์ใหม่ (เช่น `price`, `max_speed`) ต้องอัปเดตทั้งใน DB (ผ่าน `psql`) และในไฟล์ `init.sql` ทันทีเพื่อให้ระบบคงความสมบูรณ์

---

## 🚀 Log บันทึกการพัฒนา (Development Log)

- **2026-05-05**: Project Initialization:
  - สร้างโครงสร้างโปรเจกต์ `app8/` แบ่งเป็น client, server, db-data
  - พัฒนา Backend พร้อมระบบ JWT Auth, Activity Logs, และ PostgreSQL Integration
  - พัฒนา Frontend ด้วย UI สไตล์ Modern Minimalist (Indigo Theme)
  - รองรับการ Import ข้อมูลจาก `ONU.xlsx` (74MB) พร้อมระบบ Dynamic Mapping
  - เพิ่มระบบจัดการ CPE Mapping และ Device Catalog เพื่อความสะอาดของข้อมูล
- **2026-05-06 (session 2)**: Data Migration and UI Enhancements:
  - ลบข้อมูลเก่าและสร้างฐานข้อมูลใหม่จาก `ONU_Data.xlsx` (377,297 แถว, 15 คอลัมน์)
  - อัปเดต `init.sql` schema สำหรับ `onu_records` ให้ตรงกับหัวคอลัมน์ภาษาอังกฤษ
  - ปรับ `index.js` Backend ให้ search/sort ด้วยคอลัมน์ใหม่
  - อัปเดต Frontend `App.tsx` ให้แสดงผลตาม `COLUMN_DISPLAY_MAP` ใหม่
  - เพิ่ม Custom `AutocompleteInput` component ใน CPE Mapping Modal
- **2026-05-06 (session 3)**: CPE Catalog Integration:
  - Import ข้อมูล CPE จาก `onu_type.xlsx` (350 รายการ) เข้า `cpe_devices` table
  - เพิ่มคอลัมน์ใหม่ใน `cpe_devices`: `version`, `onu_type`, `lan_ge`, `lan_fe`, `wifi`, `usage`, `grade`
  - อัปเดต `device_catalog` ให้มีคอลัมน์ `lan_ge`, `lan_fe`, `wifi` (แทน `interface_lan`, `interface_wifi` เดิม)
  - Sync ข้อมูลจาก `cpe_devices` ไปยัง `device_catalog` ผ่าน `migrate_catalog.js`
  - อัปเดต Backend API และ Frontend สำหรับ CPE Management และ Device Catalog
- **2026-05-06 (session 4)**: Pagination and State Persistence:
  - **Backend Bug Fixes**: แก้ไข `COUNT(*)` bug ใน `/api/logs` และ `/api/device-catalog` (ใช้ `.count` ไม่ใช่ `.total`)
  - เพิ่ม pagination support ใน `/api/logs`, `/api/cpe-groups`, `/api/device-catalog` (รับ `page`, `limit` params)
  - **Frontend**: ลด row padding จาก `py-5` เหลือ `py-2.5` เพื่อ compact UI
  - เพิ่ม `PaginationControls` component ใน ONU, CPE, Catalog, Logs views
  - **State Persistence**: บันทึก `view`, `page`, `limit`, `searchTerm` ลง `localStorage` เพื่อ restore หลัง refresh
  - ปรับ sidebar nav buttons ให้ restore page ที่บันทึกไว้ (ไม่ reset page = 1 ทุกครั้ง)
  - **Data**: device_catalog = 304 รายการ, cpe_devices = 350 รายการ, onu_records = 377,297 รายการ
- **2026-05-07 (session 5)**: Integrated Reporting & Security Hardening:
  - **Reporting System**: เพิ่มเมนู "Integrated Report" สำหรับการรวมข้อมูลจาก 3 ตาราง (`onu_records`, `cpe_devices`, `device_catalog`) พร้อมระบบค้นหาแบบ Manual (ปุ่มกด)
  - **Memory Efficiency**: ปรับปรุงการ Export Excel ให้เป็นแบบ **Streaming** (ใช้ `pg-query-stream` และ `ExcelJS.stream.xlsx.WorkbookWriter`) เพื่อรองรับข้อมูลขนาดใหญ่ (>370,000 แถว)
  - **Dynamic UI**: เพิ่มระบบเลือกคอลัมน์ (Column Selector) ที่ซ่อน/แสดงได้ (Toggle Settings) และระบบส่งออกไฟล์ตามคอลัมน์ที่เลือกจริง
  - **Security**: เพิ่ม `ALLOWED_ONU_FIELDS` Whitelist ป้องกัน SQL Injection ในการ Update/Insert และปรับระบบ Error Handling ให้ซ่อนรายละเอียดทางเทคนิค
  - **Performance**: เพิ่ม `NODE_OPTIONS: "--max-old-space-size=4096"` ใน `docker-compose.yml` เพื่อเพิ่มขีดความสามารถในการจัดการข้อมูลขนาดใหญ่
- **2026-05-07 (session 6)**: WiFi Router Integration & Enhanced Reporting:
  - **WiFi Module**: เพิ่มระบบจัดการ WiFi Router (AP ที่แถมคู่กับ ONU) โดยอ้างอิงความสัมพันธ์ผ่าน `circuit_id`
  - **Database**: สร้างตาราง `wifi_routers` และ `wifi_routers_backup` พร้อม index ที่ `circuit_id` เพื่อความเร็วในการ Join
  - **Initial Import**: นำเข้าข้อมูลเริ่มต้นจาก `WiFiRouter.xlsx` (65,365 แถว) สำเร็จ
  - **Frontend Integration**: เพิ่มเมนู "WiFi Routers" ใน Sidebar พร้อมระบบ Table View, ค้นหา, เรียงลำดับ และระบบ **Upload (Write-over) / Restore** ข้อมูลจากไฟล์ Excel
  - **Reporting Enhancements**: อัปเดต "Integrated Report" ให้ทำ `LEFT JOIN` กับตาราง `wifi_routers` เพื่อแสดงข้อมูล AP ควบคู่กับ ONU และ Catalog โดยอัตโนมัติ
  - **Excel Export**: เพิ่มคอลัมน์ WiFi Router (Brand, Model, Version) ในไฟล์ Export Excel ของ Integrated Report
  - **Catalog Synchronization**: เพิ่มระบบดึงข้อมูล ยี่ห้อ/รุ่น ที่ไม่ซ้ำกันจากตาราง `wifi_routers` เข้าสู่ `device_catalog` โดยอัตโนมัติ (กำหนด `onu_type = 'WiFi Router'`) ทุกครั้งที่มีการ Upload หรือ Restore ข้อมูล WiFi
- **2026-05-07 (session 7)**: UI Stabilization & UX Perfection:
  - **Integrated Report Perfection**: ปรับปรุงหน้าการเลือกคอลัมน์ให้แบ่งเป็นกลุ่มที่ชัดเจน (ข้อมูลบริการ, สเปก ONU, สเปก WiFi) พร้อมแสดงชื่อเต็มทุกคอลัมน์เพื่อให้อ่านง่าย
  - **Persistent Dropdown**: แก้ไข `AutocompleteInput` ให้ "ไม่หายไป" เมื่อนำเมาส์ออกนอกพื้นที่ (Click-outside persistent) เพื่อให้ผู้ใช้สามารถเลือก ยี่ห้อ/รุ่น ได้อย่างมั่นใจ โดยจะปิดเฉพาะเมื่อเลือกตัวเลือกหรือกดซ้ำที่ช่องเดิมเท่านั้น
  - **Structural Repair**: แก้ไขปัญหา JSX Corruption ใน `App.tsx` ที่เกิดจาก Block โค้ดซ้ำซ้อนและ Tag ปิดไม่ครบถ้วน ทำให้ระบบกลับมาทำงานได้อย่างเสถียร 100%
  - **UX Enhancements**: เพิ่มปุ่ม "ยืนยันและแสดงผลลัพธ์" (Apply and Show Results) ขนาดใหญ่และ Header แบบ Clickable Toggle เพื่อเพิ่มความสะดวกในการสลับระหว่างโหมดตั้งค่าและโหมดดูรายงาน
  - **Stability**: จัดระเบียบ View Guards (`view === '...'`) ใน Dashboard ให้แยกขาดจากกันชัดเจน ป้องกันปัญหา Rendering ซ้อนทับกัน

- **2026-05-08 (session 8)**: Bug Fixes, WiFi CRUD & Catalog Expansion:
  - **Critical Fix**: แก้ไขปัญหา Error 401 เมื่อเข้าหน้าเว็บครั้งแรก โดยการตั้งค่า Axios Header ทันทีใน `handleLogin`
  - **WiFi Management**: เพิ่มระบบ **Edit/Delete WiFi Routers** ทั้งใน Backend และ Frontend (Modal UI)
  - **Catalog Expansion**: เพิ่มฟิลด์ **ราคา (Price)** และ **ความเร็วสูงสุด (Max Speed)** ในตาราง `device_catalog`
  - **UX/UI Polish**: ปรับปรุงหน้า Catalog ให้แสดงข้อมูลราคา (Emerald Green) และความเร็ว (Amber Gold) พร้อมไอคอน `Banknote` และ `Zap` เพื่อความสวยงามและอ่านง่าย
  - **Database**: เพิ่ม Index ที่ `onu_records.circuit_id` และ `onu_records.cpe_brand_model` เพื่อเพิ่มประสิทธิภาพการ Join ข้อมูล
- **2026-05-09 (session 9)**: Device Catalog Data Update:
  - นำเข้าข้อมูลอัปเดตสเปกอุปกรณ์จากไฟล์ `Device_Catalog_update.xlsx` (106 รายการ)
  - อัปเดตฟิลด์: `onu_type`, `lan_ge`, `lan_fe`, `wifi`, `price`, `max_speed` โดยใช้ `brand` และ `model` เป็น Key ในการ Upsert
  - พัฒนาสคริปต์ `update_catalog_from_excel.js` สำหรับการอัปเดตข้อมูลในอนาคต
- **2026-05-09 (session 9.2)**: Database Schema & Logic Update:
  - เปลี่ยนชื่อคอลัมน์จาก `onu_type` เป็น `type` ในตาราง `device_catalog` และ `cpe_devices`
  - เพิ่มหมวดหมู่ `ONU ALL IN ONE` สำหรับอุปกรณ์ที่เป็น ONU/ONT และมีทั้ง LAN + WiFi
  - ปรับปรุง Logic ใน Dashboard และ Reports ให้รองรับหมวดหมู่ใหม่นี้
  - Refactor โค้ดทั้งหมดทั้ง Frontend และ Backend ให้เรียกใช้ `type` แทน `onu_type`
- **2026-05-09 (session 9.3)**: Device Catalog Import & Optimization:
  - เพิ่มระบบ Export/Import Excel สำหรับ Device Catalog
  - Logic การ Import: ตรวจสอบจาก `brand` และ `model` หากมีอยู่แล้วจะทำการ Update (Upsert) หากไม่มีจะสร้างใหม่
  - เพิ่มระบบ Backup/Restore อัตโนมัติเมื่อมีการ Import ข้อมูล Catalog
  - ปรับปรุง UI ให้มีปุ่ม Import/Export/Restore ในหน้า Device Catalog
  - แก้ไขปัญหา Column Name Conflict หลังการเปลี่ยนชื่อจาก `onu_type` เป็น `type`
  - อัปเดตข้อมูลอุปกรณ์ ONU ให้เป็น `ONU Bridge` สำหรับรุ่นที่มี LAN แต่ไม่มี WiFi
- **2026-05-09 (session 9.5)**: Device Catalog Import Safety & UI Improvements:
  - แก้ไขปัญหา Column Type Conflict ของฟิลด์ `price` (Numeric) ระหว่างการ Import/Backup
  - เพิ่มการรายงานผลการนำเข้าแบบละเอียด: แยกจำนวนที่ "อัปเดต (Updated)" และ "เพิ่มใหม่ (Added)"
  - เพิ่มปุ่ม "ยกเลิกการนำเข้าล่าสุด (Restore)" สีแดงที่เห็นชัดเจน เพื่อความปลอดภัยหากนำเข้าข้อมูลผิดพลาด
  - (Rollback) ตัดสินใจไม่ใช้ Data Normalization (Uppercase) เพื่อคงความสามารถในการแยกแยะพิมพ์เล็ก-ใหญ่ (Case-sensitive) ตามเดิม
- **2026-05-11 (session 10)**: Dashboard Performance & Data Consistency:
  - **Optimization**: ปรับปรุงคิวรี Dashboard Stats และ Summary ให้ทำงานเร็วขึ้นอย่างมาก โดยเปลี่ยนจาก `UNION` เป็น `FULL OUTER JOIN` และใช้ Single-pass query ลดเวลาการโหลดข้อมูลขนาดใหญ่
  - **Integrated Logic**: รวมศูนย์ Logic การนับข้อมูล ONU และ WiFi ให้สอดคล้องกันทั้งหน้า Dashboard, รายงาน และระบบส่งออก Excel
  - **Total Counts**: แก้ไขการแสดงผลตัวเลขรวมใน Dashboard Header ให้ถูกต้องตามมุมมองที่เลือก
- **2026-05-11 (session 11)**: Mapping Discovery & Visibility:
  - **Pending Filter**: เพิ่มปุ่ม "Found new models" ในหน้า Mapping ที่สามารถคลิกเพื่อกรองเฉพาะรายการที่ยังไม่ได้จับคู่ข้อมูล (Pending Only)
  - **Record Counts**: เพิ่มคอลัมน์ "จำนวนที่พบ (Record Count)" ในตาราง Mapping เพื่อให้ผู้ใช้เห็นว่ารุ่นดิบแต่ละรุ่นมีจำนวนลูกค้าที่ได้รับผลกระทบเท่าไหร่ ช่วยในการจัดลำดับความสำคัญ
  - **Bug Fixes**: แก้ไขปัญหา TypeScript Linting และ Error 401 เมื่อเข้าหน้าเว็บครั้งแรกโดยการตั้งค่า Axios Header ทันทีที่ Login
- **2026-05-11 (session 12)**: Data Integrity & Deletion Safety:
  - **Catalog Audit**: ตรวจสอบพบ 8 รุ่นในตาราง Mapping ที่ไม่มีข้อมูลใน Catalog และดำเนินการลบ Mapping ที่ไม่สมบูรณ์เหล่านั้นออกเพื่อให้ผู้ใช้เลือกจับคู่ใหม่ให้ถูกต้อง
  - **Deletion Impact**: เพิ่มระบบ "Impact Check" ก่อนลบข้อมูลใน Device Catalog โดยระบบจะตรวจสอบและแจ้งเตือนก่อนว่ามี ONU หรือ WiFi กี่รายการที่ใช้งาน Spec นี้อยู่
  - **Safety UX**: เพิ่มข้อความยืนยันการลบที่ระบุจำนวนผลกระทบชัดเจน ป้องกันการลบข้อมูลสำคัญโดยไม่ตั้งใจ
- **2026-05-11 (session 13)**: Catalog Usage Counts & Performance Optimization:
  - **Catalog Column**: เพิ่มคอลัมน์ "Devices" ในหน้า Device Catalog แสดงจำนวนอุปกรณ์ทั้งหมดที่ใช้งานโปรไฟล์นั้นๆ (ONU + WiFi)
  - **Backend Optimization**: ปรับปรุง SQL Queries ในหน้า Discovery และ Mapping ให้ทำงานเร็วขึ้นด้วย CTE และเพิ่ม Index ที่ตาราง wifi_routers
  - **Stability**: แก้ไขปัญหา API 404 และ Connection Closed โดยการ Rebuild Backend และปรับปรุงประสิทธิภาพการ Query ตารางขนาดใหญ่ (370k+ rows)
- **2026-05-11 (session 14)**: Integrated Report Export:
  - **Export Feature**: เพิ่มระบบ Export ข้อมูลรายงานสรุป (Integrated Report) เป็นไฟล์ Excel โดยมีคอลัมน์ครบถ้วนตามหน้าจอ (ส่วน, ความเร็ว, ยี่ห้อ CPE, รุ่นมาตรฐาน ฯลฯ)
  - **Bug Fixes**: แก้ไข SQL Alias Error ในหน้า Dashboard Summary ที่ทำให้ระบบค้างเมื่อทำการค้นหาข้อมูล
- **2026-05-13 (session 15)**: Dashboard v2.0 & Materialized View Optimization:
  - **Performance**: ย้าย Query ขนาดใหญ่ไปเป็น `MATERIALIZED VIEW (mv_circuit_summary)` เพื่อลดเวลาโหลดจาก 60 วินาที เหลือต่ำกว่า 100ms
  - **Infrastructure**: เพิ่มปุ่ม "Refresh Data" เพื่อสั่ง `REFRESH MATERIALIZED VIEW` และเชื่อมต่อกับระบบ Upload/Restore ข้อมูล
  - **Dashboard Refactor**: ปรับ UI หน้าแรกเป็นตาราง Circuit Summary พร้อมหัวตารางที่ Sort ได้ และตัวกรอง Service Name แบบ Excel-style (Checkbox)
  - **Reporting**: เพิ่มสรุปกลุ่ม "ONU ไม่มี WiFi (GE)" และ "ONU Port FE ล้วน" แยกกันด้านล่าง
  - **Logic Update**: ปรับปรุงการเลือก **Max Speed รวม** สำหรับอุปกรณ์ All-in-One ที่มี WiFi ต่อพ่วง ให้เปรียบเทียบค่าความเร็วที่สูงที่สุดระหว่าง 2 อุปกรณ์
  - **Bug Fixes**: แก้ไข Error 401 (localStorage key typo) และ 404 (API path) ในปุ่ม Refresh Data

- **2026-05-14 (session 16)**: Hardware Grouping Refinement & Logic Priority:
  - **Group 1**: ปรับเป็น "ONU Port FE ล้วน (ทุกประเภท)" โดยนับรวมอุปกรณ์ทุกชนิด (Bridge, Router, All-in-One) ที่มีเฉพาะพอร์ต FE และไม่สนใจตัวกรอง (Global Stats)
  - **Group 2**: ปรับเป็น "ONU Bridge มีพอร์ต GE (ไม่มี WiFi ต่อพ่วง)" โดยนับเฉพาะอุปกรณ์ประเภท ONU Bridge ที่มีพอร์ต GE และไม่มีเราเตอร์ WiFi มาต่อพ่วง (is_onu_without_wifi = true)
  - **API**: อัปเดต `/api/dashboard/no-wifi-summary` ให้รองรับ Logic ใหม่ โดยยกเลิกการใช้ตัวกรอง Service Name และ Year สำหรับ 2 กลุ่มนี้เพื่อให้เห็นภาพรวมทั้งระบบ
  - **Logic Priority (Dashboard)**: ยึดข้อมูลหมายเลขวงจรเป็นหลักจากตาราง **ONU Records เท่านั้น** (ตารางอื่นๆ จะใช้สำหรับแนบสเปก ไม่ใช้เพิ่มจำนวนวงจร) โดยรายละเอียดของอุปกรณ์ ONU จะเลือกมาจากตาราง ONU Get OLT ก่อน ถ้ามี ถ้าไม่มี จึงใช้ข้อมูลอุปกรณ์จาก ONU Records (ห้าม Fallback ข้อมูลแบบรวมกัน)
  - **Max Speed Logic**: Max Speed รวม หมายถึงความเร็วสูงสุดที่อุปกรณ์ของวงจรนั้นรองรับ (ไม่ใช่ผลรวม) ในกรณีที่เป็น ONU All-in-One และมี WiFi ต่อพ่วง ระบบจะเปรียบเทียบว่าอุปกรณ์ตัวไหนให้ความเร็วสูงกว่า จะใช้ความเร็วนั้นเป็นหลัก
- **2026-05-14 (session 17)**: Dashboard WiFi Filtering & UX Logic:
  - **Filter Feature**: เพิ่ม Checkbox "นำรายการที่ไม่มีข้อมูล wifi ออก" ในหน้า Dashboard (Circuit Summary)
  - **Backend Logic**: ปรับปรุง API ให้รองรับพารามิเตอร์ `excludeNoWifi` โดยใช้เงื่อนไข `is_onu_without_wifi = false` เมื่อมีการติ๊กเลือก
  - **Logic Clarification**: เงื่อนไขนี้จะทำการ **"ซ่อน"** วงจรที่เป็น ONU Bridge และไม่มีอุปกรณ์ WiFi ต่อพ่วงทิ้งไปจากหน้าจอ (เพื่อให้เหลือเฉพาะวงจรที่ใช้งาน WiFi ได้จริง ทั้งจาก All-in-One หรือแบบต่อพ่วง)
  - **Consistency**: บังคับใช้เงื่อนไขเดียวกันทั้งในหน้าสถิติ (Stats Cards), ตารางข้อมูลหลัก และการ Export Excel

- **2026-05-14 (session 18)**: Data Refinement & Numeric Sorting:
  - **Numeric Sorting**: ปรับปรุงระบบเรียงลำดับใน Backend สำหรับคอลัมน์ "ความเร็ว (Mbps)" และ "Max Speed รวม" โดยใช้ `REGEXP_REPLACE` เพื่อดึงเฉพาะตัวเลขออกมาเรียงลำดับแบบ Numeric ป้องกันปัญหาการเรียงลำดับแบบ String (เช่น 1000 มาก่อน 300)
  - **Unified Filtering**: ปรับปรุง Endpoint `/circuit-summary` และ `/export` ให้ใช้ตรรกะการกรองข้อมูลแบบเดียวกับสถิติ (Stats) โดยใช้ตัวดำเนินการ `ANY` สำหรับ `serviceFilter` เพื่อความแม่นยำและเสถียรภาพ
  - **"No-WiFi" Logic Refinement**: ปรับปรุงการคำนวณ `is_onu_without_wifi` ใน Materialized View ให้ครอบคลุมอุปกรณ์ที่ยัง "Pending Mapping" หรือ "unspec-cpe" แต่ระบุได้ว่าเป็น ONU Bridge ที่ไม่มี WiFi ต่อพ่วง เพื่อให้ตัวกรอง "Exclude No-WiFi" ทำงานได้อย่างสมบูรณ์
  - **Installation Year Standard**: ปรับระบบการดึงข้อมูลปีที่ติดตั้งให้เป็นรูปแบบ 4 หลัก (YYYY) เสมอ โดยใช้ `SUBSTRING` เพื่อแก้ปัญหาข้อมูลปี "0000" ซ้ำซ้อนและรูปแบบวันที่ไม่สม่ำเสมอ
  - **Code Cleanup**: ลบ Logic CTE เก่าที่ไม่ได้ใช้งานออกจาก Backend เพื่อให้ระบบดึงข้อมูลจาก `mv_circuit_summary` เพียงอย่างเดียว ซึ่งช่วยเพิ่มประสิทธิภาพและความง่ายในการดูแลรักษา

- **2026-05-15 (session 19)**: Performance Audit & Optimization (v3.0):
    - **Dashboard Speedup**: เพิ่มคอลัมน์ตัวเลข `speed_mbps` และ `effective_max_speed_mbps` ใน `mv_circuit_summary` พร้อมทำ Index ครบทุกฟิลด์ที่ใช้กรองข้อมูล
    - **Backend Refactoring**: ปรับปรุง Endpoint `/api/dashboard/stats-v2` ให้ใช้ Single-pass summary query และดึงข้อมูลจาก Materialized View แทนตารางดิบ
    - **Reliability Fix**: แก้ไขปัญหา **502 Bad Gateway** และ Container naming conflict โดยการเพิ่มคำแนะนำการรัน Docker ที่ถูกต้องในคู่มือ

- **2026-05-15 (session 20)**: Executive Dashboard Implementation (Hierarchical Flow):
    - **Backend API**: เพิ่ม `/api/dashboard/executive-stats` เพื่อคำนวณข้อมูลสรุปแบบลำดับชั้น (Hierarchy) เช่น ONU vs AP, FE vs GE, และ AX3000 vs Lower AX
    - **UI/UX Design**: ออกแบบหน้าจอแบบ "Data Flow" 3 ส่วนตามที่ User ต้องการ:
        1. **Inventory Flow**: สรุปจำนวนอุปกรณ์ทั้งหมดแยกตามประเภท (AIO vs Bridge)
        2. **Technical Specs**: แยกกลุ่มอุปกรณ์ตามประสิทธิภาพ (FE/GE และ AX3000 Performance)
        3. **Business/Packet Flow**: แสดง Flow การใช้งานของลูกค้าตามความเร็วแพ็กเกจ และจุดที่เป็น Bottleneck (Mismatch)
    - **Drill-down Feature**: เพิ่มระบบ **Brand Tooltip** เมื่อนำ Mouse ไปวางที่กล่องต่างๆ จะแสดง Top 5 Brands และจำนวนอุปกรณ์ของกลุ่มนั้นๆ ทันที
    - **Aesthetics**: ใช้ Indigo & Rose Theme, Glassmorphism, และ Framer-style animations เพื่อความ Premium สำหรับผู้บริหาร

---

## **Best Practices & Troubleshooting**

### **1. Deployment & Container Management**
- **Clean Rebuilds (MANDATORY)**: เมื่อมีการแก้ไขโค้ด Backend หรือ Frontend ให้ใช้คำสั่งที่ล้าง Container เก่าเสมอเพื่อป้องกันปัญหาชื่อ Container เพี้ยน (ซึ่งทำให้ Nginx หา Backend ไม่เจอ และเกิด 502):
  ```bash
  echo "13700352" | sudo -S docker compose -f /home/nopparus2/www/docker-compose.yml up -d --build --remove-orphans app8-frontend app8-backend
  ```
- **502 Bad Gateway**: หากเจอ Error นี้ ให้เช็ค `docker ps` ว่าชื่อ Container ตรงกับใน `nginx-gateway.conf` หรือไม่ (ต้องเป็น `nexus-app8-backend`) หากชื่อเพี้ยน ให้สั่ง stop/rm และ up ใหม่แบบระบุชื่อบริการ

### **2. Database & Reporting**
- **Materialized View (MV)**: ข้อมูลใน Dashboard ทั้งหมดดึงจาก `mv_circuit_summary` หากข้อมูลไม่เป็นปัจจุบัน ให้กดปุ่ม **"Refresh Data"** ในหน้า UI หรือรัน `REFRESH MATERIALIZED VIEW CONCURRENTLY mv_circuit_summary;`
- **Numeric Sorting**: ห้ามใช้ Regex ใน SQL สำหรับการ Sort ใน Runtime เพราะจะช้ามาก ให้ใช้คอลัมน์ `_mbps` ที่เตรียมไว้ใน MV แทน

### **3. Authentication**
- **Header Persistence**: ตรวจสอบว่า `axios.defaults.headers.common['Authorization']` ถูกตั้งค่าทันทีที่ Login และในส่วน Bootstrap เสมอเพื่อป้องกัน 401 Unauthorized ระหว่างการโหลดหน้าเว็บ
