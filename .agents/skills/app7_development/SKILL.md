---
name: App7 Development Guide and Architecture
description: Comprehensive summary of App7 architecture, proxy setup, and development log to avoid re-reading code.
---

# App7 (WiFi Site Electricity Meter Survey) - โครงสร้างและบันทึกการพัฒนา

สกิลนี้ใช้เพื่อเป็นคู่มือและบันทึกข้อมูล (Log) ในการพัฒนา App7 เพื่อให้ AI สามารถนำไปอ้างอิงและพัฒนาต่อยอดได้ทันที โดยไม่ต้องไปอ่านโค้ดทำความเข้าใจใหม่ในแต่ละครั้ง

## 1. โครงสร้างพื้นฐาน (Infrastructure & Proxy)
ปัจจุบัน App7 ทำงานบนระบบ Docker Container เครือข่ายเดียวกันกับแอพอื่นๆ (nexus-network) โดยมีระบบ Proxy จัดการเส้นทาง (Routing) ดังนี้:
- **เส้นทางหลัก (Flow):** คำขอจากภายนอกเข้าสู่ระบบจะผ่านสคริปต์ `proxy-server.js` (พอร์ต 8080) จัดสรรไปยัง Gateway
- **Nginx Gateway (`nginx-gateway.conf`):** 
  - เมื่อผู้ใช้เข้าถึง `/app7/` -> Nginx จะรับ Forward Traffic ส่งต่อไปที่ Container `nexus-app7` ในพอร์ต 80 (ระบบ Frontend)
  - เมื่อมีการเรียกใช้งานหลังบ้านผ่าน `/app7/api/` -> Nginx จะตัดคำว่า `/app7` ออก เหลือแค่ `/api/` และสลับเป้าหมายไปที่ Container `nexus-app7-backend` (พอร์ต 3010) (ระบบ Backend)

## 2. ส่วน Frontend (หน้าเว็บไซต์ React)
- **ตำแหน่งโค้ด:** โฟลเดอร์ `app7/src/` (ไฟล์หลักคือ `app7/src/App.tsx` และ `app7/src/main.tsx`)
- **เทคโนโลยี:** เฟรมเวิร์ค React.js (Vite), TypeScript, Tailwind CSS
- **ฟังก์ชันการทำงานหลัก:**
  - เป็นระบบแผนที่เพื่อการสำรวจค่าใช้จ่ายในการเปลี่ยนมิเตอร์ไฟฟ้าโดยเฉพาะ
  - มุมมองแผนที่ทำงานร่วมกับ `react-leaflet` จุดหมุดแบ่งสีชัดเจน สำรวจแล้ว (เขียว) หรือยังไม่สำรวจ (น้ำเงิน) 
  - ซูมแผนที่ระดับลึกและรองรับ Marker Clustering (กลุ่มจุดหนาแน่นปักหมุด) หากจุดเกิน 4,000 จุดจะมีระบบป้องกันการโหลดค้าง
  - ฝั่งตารางและการกรอง: กรองจังหวัด, อำเภอ, สถานะ, และช่องค้นหา (สถานที่, Request ID, Circuit ID)
  - ระบบคำนวณและบันทึก: แบบฟอร์มกรอกค่าสายไฟ ค่าแรงช่าง และค่าประเมินอุปกรณ์ 
  - ส่งออกข้อมูลเป็น Excel ผ่านไลบรารี `xlsx` ได้ทันที

## 3. ส่วน Backend (ระบบเบื้องหลัง และ API)
- **ตำแหน่งโค้ด:** โฟลเดอร์ `app7/server/` (โค้ดหลักอยู่ที่ `app7/server/server.ts`)
- **เทคโนโลยี:** Node.js, Express Framework, tsx
- **API ที่สำคัญ:**
  - `GET /api/sites`: ดึงข้อมูลจากฐานข้อมูล มีระบบ Query Params จัดการ Pagination, ดึงค่าผลรวมทางสถิติ, รวมถึงลิมิตจุดพิกัดในเขตการแสดงผลบนแผนที่
  - `GET /api/filters`: ดึงตัวเลือกรายชื่อจังหวัด และ อำเภอ จากตาราง sites
  - `POST /api/survey/:id`: รับค่าพารามิเตอร์เพื่อทำการอัปเดตลงตาราง พร้อมค่า Timestamp การประเมินราคา

## 4. ส่วน Database (ฐานข้อมูล)
- **ตำแหน่ง:** `app7/server/survey.db`
- **ระบบจัดเก็บ:** เป็นไฟล์ SQLite เชื่อมต่อและทำงานผ่านไลบรารี `better-sqlite3`
- โครงสร้างจะผูกเก็บพิกัด, ข้อมูลทางภูมิศาสตร์, หมายเลขประจำจุด และการบันทึกงบประมาณการลากสายกับค่าแรง (`consumer_unit_cost`, `ground_rod_cost`, `main_wire_length`, `labor_cost`, `survey_cost`)

## 5. การ Build และ Deploy (Docker Compose)
- **ข้อควรระวังสำคัญ:** การแก้ไขโค้ดที่ฝั่ง Frontend หรือ Backend ภายใต้ `app7` **ห้าม**สั่ง `npm run build` เพื่อสร้างโฟลเดอร์ `dist` แบบธรรมดา เนื่องจากการทำงานจริงบน Production จะนำส่งไฟล์ผ่าน **Nginx Gateway Container** 
- **คำสั่งอัปเดตระบบ:** เมื่อมีการเปลี่ยนแปลงโค้ด ให้สั่ง Build Docker Image และ Recreate Container ใหม่ เสมอ ด้วยชุดคำสั่งด้านล่าง (ต้องใช้ `sudo` หรือกรอกรหัสผ่าน):
  ```bash
  cd /home/nopparus2/www
  echo "13700352" | sudo -S docker compose up -d --build app7-frontend app7-backend
  ```

---

## 🚀 Log บันทึกการพัฒนา (Development Log)
*หมายเหตุ: เมื่อมีการทำงาน ปรับแก้ หรือเพิ่มเติมฟีเจอร์ใดๆ ให้บันทึกการเปลี่ยนแปลงและอัปเดตโครงสร้างเข้ามาในไฟล์นี้โดยตลอด*

- **2026-03-05**: สร้างหน้า **Executive Dashboard** สำหรับผู้บริหาร (`DashboardMetrics`, `DashboardCharts`, `DashboardTopSites`) โดยใช้ `recharts` ในการแสดงผลสถิติงบประมาณ และปรับปรุง API Backend `/api/dashboard/summary` เพื่อคำนวณสถิติ
- **2026-03-05**: สร้างคู่มือและบันทึกวิเคราะห์โครงสร้างทั้งหมดของ App7 และการตั้งค่า Gateway/Proxy เพื่อหลีกเลี่ยงการสแกนโค้ดมหาศาลซ้ำซ้อนในอนาคต (Init App7 Skill)
