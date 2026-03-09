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
