# 🚀 Nexus Portal - Setup Complete

## ✅ Everything is ready! Just one final step...

Your Nexus Portal is **fully configured and running**, but the website shows **502 Bad Gateway** because Cloudflare Tunnel is pointing to the wrong port.

---

## 📍 Current Status

```bash
/home/nopparus2/www/check-status.sh
```

**Services Running:**
- ✅ Express API (port 3001) - Running
- ✅ Proxy Server (port 8080) - Running
- ✅ Menu app - Built
- ✅ App1, App2, App3 - Built
- ✅ Database initialized

**What's Missing:**
- ⚠️ Cloudflare Tunnel points to port 80, needs to point to port 8080

---

## 🔧 Fix the 502 Error (30 seconds)

### Option 1: Via Cloudflare Dashboard (Recommended)

1. Open: https://one.dash.cloudflare.com/
2. Navigate to: **Access** > **Tunnels**
3. Find the tunnel for **north.porjai.uk**
4. Click **Edit** (pencil icon)
5. Go to **Public Hostname** tab
6. Edit the hostname:
   - **Current**: `http://localhost:80`
   - **Change to**: `http://localhost:8080`
7. Click **Save**
8. Wait 10-30 seconds
9. Visit https://north.porjai.uk/ ✨

### Option 2: Via SSH Command

If you have root access, you can restart cloudflared with updated config:

```bash
# This requires sudo - do it manually
sudo cloudflared tunnel route dns <tunnel-id> north.porjai.uk

# Then update the ingress in the dashboard to use port 8080
```

---

## 📖 Documentation

- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Complete setup documentation
- **[check-status.sh](check-status.sh)** - Check service status
- **[start-all.sh](start-all.sh)** - Start all services

---

## 🎯 Quick Commands

```bash
# Check status
/home/nopparus2/www/check-status.sh

# Start services (if stopped)
/home/nopparus2/www/start-all.sh

# Stop services
kill $(cat /tmp/nexus-api.pid) $(cat /tmp/nexus-proxy.pid)

# View logs
tail -f /tmp/nexus-api.log
tail -f /tmp/nexus-proxy.log

# Test locally (before fixing tunnel)
curl http://localhost:8080/
```

---

## 🔐 Login Credentials

Once the tunnel is configured:

- **URL**: https://north.porjai.uk/
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change password after first login!**

---

## 🛠️ Auto-Start Services on Boot (Optional)

To make services start automatically on system boot:

```bash
sudo cp /home/nopparus2/www/nexus-portal.service /etc/systemd/system/
sudo systemctl enable nexus-portal
sudo systemctl start nexus-portal
```

---

## 🎉 That's It!

After updating the Cloudflare Tunnel configuration (1 minute), your site will be live at:

**https://north.porjai.uk/**

---

## 📱 Need Help?

Run the status check to diagnose any issues:
```bash
/home/nopparus2/www/check-status.sh
```

All services are already running and ready. Just update that one Cloudflare setting! 🚀
