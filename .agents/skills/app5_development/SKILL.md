---
name: App5 Development Guide and Architecture
description: Comprehensive summary of App5 architecture, proxy setup, and development log to avoid re-reading code.
---

# App5 (Preventive Maintenance System - PMS) - โครงสร้างและบันทึกการพัฒนา

สกิลนี้ใช้เพื่อเป็นคู่มือและบันทึกข้อมูล (Log) ในการพัฒนา App5 เพื่อให้ AI สามารถนำไปอ้างอิงและพัฒนาต่อยอดได้ทันที โดยไม่ต้องไปอ่านโค้ดทำความเข้าใจใหม่ในแต่ละครั้ง

## 1. โครงสร้างพื้นฐาน (Infrastructure & Proxy)
- ระบบรันบน Docker Container มีทั้งส่วน Frontend (`app5-frontend`) และ Backend (`app5-backend`)
- มีการใช้ระบบ Base URL สำหรับ Vite (`/app5/`) และมีการทำ Nginx Proxy เพื่อ Forward เส้นทางให้ถูกต้อง 

## 2. ส่วน Frontend (หน้าเว็บไซต์ React)
- **ตำแหน่งโค้ด:** โฟลเดอร์ `app5/` (จุดเริ่มต้นโค้ด UI อยู่ที่ `app5/App.tsx` และโฟลเดอร์ `components/`)
- **เทคโนโลยี:** เฟรมเวิร์ค React.js สร้างโปรเจ็กต์ด้วย Vite, ใช้ TypeScript, และจัดรูปแบบด้วย Tailwind CSS
- **ฟังก์ชันการทำงานหลัก:**
  - เป็นระบบ Preventive Maintenance System (PMS) จัดการการบำรุงรักษาเชิงป้องกัน
  - มีมุมมอง แผนที่ ที่ใช้ `react-leaflet` และ `react-leaflet-cluster` สำหรับจัดการการแสดงพิกัดสถานที่
  - มีหน้า Dashboard ที่ใช้ `recharts` ในการสร้างกราฟแสดงสถิติต่างๆ
  - มีระบบจัดการโครงสร้างการทำงาน เช่น Projects, Locations, และ Maintenance Records ครอบคลุมไปจนถึง Schedule

## 3. ส่วน Backend (ระบบเบื้องหลัง และ API)
- **ตำแหน่งโค้ด:** โฟลเดอร์ `app5/server/` (โค้ดหลักรวมอยู่ที่ `app5/server/server.js`)
- **เทคโนโลยี:** Node.js, Express Framework 
- **API ที่สำคัญ:**
  - มีการสร้าง Endpoint `/api/pms/...` ต่างๆ 
  - `GET`, `POST`, `PUT`, `DELETE` สำหรับ `projects`, `locations`, `nt-locations`, `records`, และ `schedule`
  - มีฟีเจอร์อัปโหลดภาพผ่าน Multer ใน `/api/pms/upload` และเสิร์ฟภาพที่อัปโหลดที่เส้นทาง `/api/pms/uploads`

## 4. ส่วน Database (ฐานข้อมูล)
- **ระบบจัดเก็บ:** ใช้งาน PostgreSQL (พบสคริปต์จาก `pg` ใน server/package.json) 
- มีการเตรียมไฟล์อย่าง `init.sql` หรือตารางดั้งเดิม `NT_Location.sql` ไว้สำหรับ Seed โครงสร้างฐานข้อมูลตั้งต้น

## 5. การ Build และ Deploy 
- **ข้อควรระวังสำคัญ:** การเปลี่ยนแปลงฝั่ง Frontend จะคล้ายกับ App7 คือ ต้องสั่ง Build ผ่าน Docker Compose 
- **คำสั่งอัปเดตระบบโดยรวม:** เมื่อมีการเปลี่ยนแปลงโค้ด ให้สั่ง Build ใหม่เพื่อให้สอดคล้องกับ Gateway (อ้างอิงจาก Docker Compose ของระบบหลัก):
  ```bash
  cd /home/nopparus2/www
  echo "13700352" | sudo -S docker compose up -d --build app5-frontend app5-backend
  ```

---

## 🚀 Log บันทึกการพัฒนา (Development Log)
*หมายเหตุ: เมื่อมีการทำงาน ปรับแก้ หรือเพิ่มเติมฟีเจอร์ใดๆ ให้บันทึกการเปลี่ยนแปลงและอัปเดตโครงสร้างเข้ามาในไฟล์นี้โดยตลอด*

- **2026-03-09**: สร้างระบบ Admin Menu และการจัดการเชื่อมโยง Project-Site:
  - เพิ่มหน้าต่าง `AdminPanel.tsx` สำหรับตรวจสอบรหัสผ่าน (`admin123`) (มี persistence ผ่าน sessionStorage) และใช้จัดการเพิ่ม/ลบ/แก้ไข Project
  - เปลี่ยนแปลงกลไกการดึงข้อมูลสถานที่ (Locations) จากใช้ร่วมกันทั้งหมด (Global) มาเป็นการ**ผูกพิกัดสถานที่เข้ากับแต่ละ Project แบบ Many-to-Many** 
  - สร้างตารางกลาง `project_sites` ในฐานข้อมูลเพื่อจับคู่โปรเจกต์และสถานที่ และเพิ่ม API `/api/pms/project-sites` (GET, POST, DELETE)
  - เพิ่มเมนูย่อย `ManageProjectSites.tsx` ให้ Admin สามารถติ๊กเลือก Site เพิ่ม/ลดออกจากแต่ละโปรเจกต์ได้ 
  - ระบบแสดงแผนที่ (`NTLocationMap`) และระบบแสดงสถานที่ (`LocationManager`) จะถูกกรองให้แสดงเฉพาะรายการที่ได้รับมอบหมายในโปรเจกต์ปัจจุบันเท่านั้น
- **2026-03-09**: เปลี่ยนแปลงระบบแผนที่ให้รองรับคุณสมบัติ **Dynamic Map Layers & Custom Columns**:
  - เปลี่ยนจาก `nt_sites` ที่มีคอลัมน์ตายตัว เป็นการสร้างตาราง `map_layers` (เก็บโครงสร้าง Schema แบบ Dynamic) 
  - ใช้หลักการจัดเก็บคอลัมน์ที่เพิ่มใหม่ลงในรูปแบบ `JSONB` ผ่านตัวแปร `custom_data` ในตาราง `nt_sites` ทำให้ระบบเพิ่มฟิลด์ประเภท Text, Number, Date, Dropdown Options ได้อิสระโดยไม่ต้องทำ Database Schema Migration เพิ่มเติม
  - รองรับการสร้างแผนที่ได้เป็นจำนวนมาก โดยแยกข้อมูลสถานที่เชื่อมโยงกับ `map_id`
  - สร้างกลไก UI `AdminSiteMaster.tsx` ใหม่ ให้โหลด Form Fields อัตโนมัติจาก Schema และเชื่อมการแสดงผลกับ `NTLocationMap.tsx`
- **2026-03-10 - 2026-03-11**: ปรับปรุงระบบ Import/Export และการแสดงผลข้อมูล:
  - แก้ไขบัค Data Type Casting ในระบบ Bulk Import (`advanced-bulk`) ที่เกิดข้อผิดพลาด `operator does not exist: integer <> uuid` โดยการทำ `parseInt` ให้กับ `system_id`
  - ปรับปรุง `NTLocationMap.tsx` ให้แยกการแสดงผลข้อมูล Master (สำหรับโครงการ NT North) และข้อมูลเฉพาะโครงการ (Project-specific data) ตาม `fields_schema`
  - แก้ไขปัญหาคอลัมน์ "Type" ในการ Export ข้อมูลที่แสดงผลไม่ถูกต้อง (แสดง Label แทน Key)
  - ตรวจสอบและยืนยันการทำงานของระบบกรองข้อมูล (Filter) ให้สอดคล้องกับ `filter_config` ของแต่ละโครงการ
- **2026-05-05**: ตรวจสอบและบำรุงรักษาระบบบนเซิร์ฟเวอร์จริง (Production):
  - สำรองฐานข้อมูล (`pg_dump`) ก่อนการแก้ไข
  - สร้างตาราง `nt_sites_temp` เพื่อรองรับระบบ Archiving ในฟีเจอร์ "Advanced Bulk Import (Sync Mode)"
  - ยืนยันโครงสร้างฐานข้อมูลล่าสุดรองรับ Dynamic Map Layers (map_id, custom_data) เรียบร้อยแล้ว
  - ตรวจสอบ API `nt-locations` พบว่าทำงานปกติและรองรับ Bounding Box Loading เพื่อประสิทธิภาพบนแผนที่
