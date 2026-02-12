# Nexus Portal - Setup Complete! 🎉

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. Menu App (Main Portal)
- ✅ Dependencies installed
- ✅ Built (`dist/` folder created)
- ✅ TypeScript errors fixed
- ✅ Ready to serve

### 2. App1 (RD Smart Processor)
- ✅ Dependencies installed
- ✅ Built successfully
- ✅ Located at `/home/nopparus2/www/app1/dist`

### 3. App2 (EMS Electricity Converter)
- ✅ Dependencies installed
- ✅ Built successfully
- ✅ Located at `/home/nopparus2/www/app2/dist`

### 4. App3 (Excel & CSV File Merger)
- ✅ Dependencies installed
- ✅ Built successfully
- ✅ Located at `/home/nopparus2/www/app3/dist`

### 5. Express API Server
- ✅ Dependencies installed
- ✅ Database initialized (`nexus.db` created with default admin user)
- ✅ Running on port 3001
- ✅ Admin credentials: `admin` / `admin123`

### 6. Proxy Server (nginx alternative)
- ✅ Node.js proxy server created
- ✅ Running on port 8080
- ✅ Routes all traffic correctly

---

## 🔧 Services Currently Running

| Service | Port | Status | Log File |
|---------|------|--------|----------|
| Express API | 3001 | ✅ Running | `/tmp/nexus-api.log` |
| Proxy Server | 8080 | ✅ Running | `/tmp/nexus-proxy.log` |

**Process IDs saved in:**
- `/tmp/nexus-api.pid`
- `/tmp/nexus-proxy.pid`

---

## ⚠️  สิ่งที่ยังต้องทำ (1 ขั้นตอน)

### Reconfigure Cloudflare Tunnel

Cloudflared tunnel กำลังรันอยู่แต่กำลัง proxy ไปที่ port 80 (nginx) แต่เราใช้ Node.js proxy บน port **8080** แทน

**วิธีแก้ไข:**

1. ไปที่ **Cloudflare Zero Trust Dashboard**:
   - เข้า https://one.dash.cloudflare.com/
   - เลือก Account ของคุณ
   - ไปที่ **Access** > **Tunnels**

2. หา Tunnel สำหรับ `north.porjai.uk`:
   - คลิกที่ tunnel name เพื่อแก้ไข
   - ไปที่ **Public Hostname** tab

3. แก้ไข hostname `north.porjai.uk`:
   - **Service Type**: HTTP
   - **URL**: เปลี่ยนจาก `http://localhost:80` เป็น `http://localhost:8080`
   - กด **Save**

4. รอ 10-30 วินาที แล้วลอง refresh เว็บ north.porjai.uk

---

## 🚀 การจัดการ Services

### Start Services
```bash
/home/nopparus2/www/start-all.sh
```

### Stop Services
```bash
kill $(cat /tmp/nexus-api.pid) $(cat /tmp/nexus-proxy.pid)
```

### Restart Services
```bash
kill $(cat /tmp/nexus-api.pid) $(cat /tmp/nexus-proxy.pid)
sleep 1
/home/nopparus2/www/start-all.sh
```

### Check Logs
```bash
# API logs
tail -f /tmp/nexus-api.log

# Proxy logs
tail -f /tmp/nexus-proxy.log
```

### Check Status
```bash
# Check if services are running
ps aux | grep "node server.js"
ps aux | grep "node proxy-server.js"

# Test API endpoint
curl http://localhost:3001/api/health

# Test proxy server
curl -I http://localhost:8080/
```

---

## 📁 Project Structure

```
/home/nopparus2/www/
├── menu/              # Main portal (React + Vite)
│   └── dist/         # ✅ Built
├── app1/             # RD Smart Processor
│   └── dist/         # ✅ Built
├── app2/             # EMS Converter
│   └── dist/         # ✅ Built
├── app3/             # File Merger
│   └── dist/         # ✅ Built
├── server/           # Express API
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   ├── middleware/
│   └── nexus.db      # SQLite database
├── nginx/            # Nginx config (not used, using Node.js proxy instead)
│   └── north.porjai.uk.conf
├── proxy-server.js   # Node.js proxy (nginx alternative)
├── start-all.sh      # Startup script
└── SETUP-GUIDE.md    # This file
```

---

## 🔐 Default Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: admin

**⚠️ IMPORTANT**: Change the password after first login!

### JWT Secret
- Current: `nexus-secret-change-in-production`
- **⚠️ MUST** change in production by setting `JWT_SECRET` environment variable

---

## 🛠️  Troubleshooting

### Site shows 502 Bad Gateway
- ตรวจสอบว่า services ทั้ง 2 รันอยู่: `ps aux | grep node`
- ตรวจสอบว่า cloudflared tunnel ตั้งค่าไปที่ port 8080 แล้ว

### API not responding
```bash
# Check if API is running
ps aux | grep "node server.js"

# Restart API
kill $(cat /tmp/nexus-api.pid)
cd /home/nopparus2/www/server && node server.js > /tmp/nexus-api.log 2>&1 &
echo $! > /tmp/nexus-api.pid
```

### Proxy not working
```bash
# Check if proxy is running
ps aux | grep "node proxy-server.js"

# Restart proxy
kill $(cat /tmp/nexus-proxy.pid)
cd /home/nopparus2/www && node proxy-server.js > /tmp/nexus-proxy.log 2>&1 &
echo $! > /tmp/nexus-proxy.pid
```

### Build errors (if you need to rebuild)
```bash
# Rebuild app1
cd /home/nopparus2/www/app1
npm run build

# Rebuild app2
cd /home/nopparus2/www/app2
npm run build

# Rebuild app3
cd /home/nopparus2/www/app3
npm run build

# Rebuild menu
cd /home/nopparus2/www/menu
npm run build
```

---

## 🎯 Next Steps

1. ✅ **Reconfigure Cloudflare Tunnel** (ขั้นตอนเดียวที่ยังทำไม่ได้ - ดูด้านบน)
2. ✅ Services ทั้งหมดรันอยู่แล้ว
3. ✅ Apps ทั้งหมด build เสร็จแล้ว

หลังจากแก้ Cloudflare Tunnel แล้ว เว็บจะใช้งานได้ทันที! 🚀

---

## 📊 URLs After Setup

- **Main Portal**: https://north.porjai.uk/
- **App1 (RD Processor)**: https://north.porjai.uk/app1/
- **App2 (EMS)**: https://north.porjai.uk/app2/
- **App3 (File Merger)**: https://north.porjai.uk/app3/
- **API**: https://north.porjai.uk/api/health

---

Created by Claude Code 🤖
