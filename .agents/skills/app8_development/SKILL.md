---
name: App8 Development Guide and Architecture
description: Comprehensive summary of App8 architecture, proxy setup, and development log to avoid re-reading code.
---

# App8 (ONU Management System) - โครงสร้างและบันทึกการพัฒนา

สกิลนี้ใช้เพื่อเป็นคู่มือและบันทึกข้อมูล (Log) ในการพัฒนา App8 (ระบบจัดการ ONU) เพื่อให้ AI สามารถนำไปอ้างอิงและพัฒนาต่อยอดได้ทันที โดยไม่ต้องไปอ่านโค้ดทำความเข้าใจใหม่ในแต่ละครั้ง

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

- **คำสั่งอัปเดตระบบ (Build เฉพาะ App8):**
  ```bash
  cd /home/nopparus2/www
  echo "13700352" | sudo -S docker compose up -d --build app8-frontend app8-backend app8-db
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
