---
name: App6 Development Guide and Architecture
description: Comprehensive summary of App6 architecture, proxy setup, and development log to avoid re-reading code.
---

# App6 (Security Budget Calculation System) - โครงสร้างและบันทึกการพัฒนา

สกิลนี้ใช้เพื่อเป็นคู่มือและบันทึกข้อมูล (Log) ในการพัฒนา App6 เพื่อให้ AI สามารถนำไปอ้างอิงและพัฒนาต่อยอดได้ทันที โดยไม่ต้องไปอ่านโค้ดทำความเข้าใจใหม่ในแต่ละครั้ง

## 1. โครงสร้างพื้นฐาน (Infrastructure & Proxy)
- ระบบรันบน Docker Container ในชื่อบริการ `app6-frontend` (Container name: `nexus-app6`)
- เชื่อมต่อกับเครือข่ายเดียวกับระบบอื่นๆ (`nexus-network`)
- การเข้าถึงผ่าน Proxy: `/app6/` จะถูก Forward ไปที่ Container `nexus-app6` พอร์ต 80

## 2. ส่วน Frontend (หน้าเว็บไซต์ React)
- **ตำแหน่งโค้ด:** โฟลเดอร์ `app6/src/` (ไฟล์หลักคือ `app6/src/App.tsx`)
- **เทคโนโลยี:** React.js (Vite), TypeScript, Tailwind CSS, Lucide React
- **ฟังก์ชันการทำงานหลัก:**
  - ระบบคำนวณงบประมาณการจ้างรักษาความปลอดภัย (Security Budget)
  - จัดการข้อมูลค่าแรงขั้นต่ำรายจังหวัด, วันหยุดนักขัตฤกษ์, และรูปแบบผลัด (Shift Profiles)
  - มีระบบส่งออกข้อมูลเป็น Excel และรายงาน PDF

## 3. การ Build และ Deploy (Docker Compose)
- **ข้อควรระวังสำคัญ:** ห้ามรัน `./deploy.sh` ในรูทเพื่ออัปเดตแอปเดียว เพราะจะทำการ Rebuild ทุกแอปในเซิร์ฟเวอร์
- **คำสั่งอัปเดตระบบเฉพาะ App6:** เมื่อมีการเปลี่ยนแปลงโค้ด ให้สั่ง Build เฉพาะ Service `app6-frontend` ดังนี้:
  ```bash
  cd /home/nopparus2/www
  echo "13700352" | sudo -S docker compose up -d --build app6-frontend
  ```

---

## 🚀 Log บันทึกการพัฒนา (Development Log)
- **2026-03-24**: แก้ไขคำอธิบายเลเบล (Labels) เพื่อลดความสับสนในการใช้งาน:
  - เปลี่ยนจาก "จน. คน/จุด" (Number of People/Point) เป็น "จำนวนผลัด ต่อจุด" (Number of Shifts per Point)
  - ปรับปรุงเลเบลในหน้าสรุปงบประมาณและรายงาน PDF/Excel ให้สอดคล้องกัน
  - สร้างสกิล `app6_development` เพื่อใช้เป็นคู่มือการพัฒนาและดรพลอย
