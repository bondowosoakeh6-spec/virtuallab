# Panduan Deployment - VirtualLab AKUANALIS

## Prasyarat

- **Docker** v20+ & **Docker Compose** v2+
- **PostgreSQL** 16+ (jika tanpa Docker)
- **Node.js** 20+ & **npm** 9+ (jika tanpa Docker)
- Domain dengan **HTTPS** (produksi)

---

## 1. Deployment dengan Docker (Rekomendasi)

### 1.1. Clone & Konfigurasi

```bash
git clone <repository-url>
cd virtuallab
cp .env.example .env
```

Edit `.env` — **wajib diubah untuk produksi**:

```env
DATABASE_URL="postgresql://virtuallab:YOUR_STRONG_PASSWORD@postgres:5432/virtuallab_akuanalis"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

> ⚠️ Gunakan `openssl rand -base64 32` untuk men-generate secret.

### 1.2. Build & Jalankan

```bash
docker compose up -d --build
```

### 1.3. Migrasi Database & Seed

```bash
# Jalankan migrasi
docker compose exec web npx prisma migrate deploy

# Seed data awal
docker compose exec web npx tsx prisma/seed.ts
```

### 1.4. Verifikasi

```bash
# Cek status service
docker compose ps

# Cek log
docker compose logs -f web

# Test endpoint
curl http://localhost:3000
```

---

## 2. Deployment Manual (Tanpa Docker)

### 2.1. Install Dependencies

```bash
cd virtuallab
npm ci --omit=dev
npx prisma generate
```

### 2.2. Build

```bash
npm run build
```

### 2.3. Migrasi Database

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 2.4. Jalankan

```bash
npm start
```

Gunakan **PM2** untuk process manager:

```bash
npm install -g pm2
pm2 start npm --name "virtuallab" -- start
pm2 save
pm2 startup
```

---

## 3. HTTPS dengan Nginx Reverse Proxy

### 3.1. Install Nginx & Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx
```

### 3.2. Konfigurasi Nginx

Buat file `/etc/nginx/sites-available/virtuallab`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/virtuallab /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.com
sudo systemctl reload nginx
```

---

## 4. Environment Variables

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | Secret untuk signing token |
| `NEXTAUTH_SECRET` | ✅ | NextAuth JWT secret |
| `NEXTAUTH_URL` | ✅ | URL publik aplikasi |
| `NODE_ENV` | ✅ | `production` untuk produksi |
| `RATE_LIMIT_WINDOW_MS` | ❌ | Window rate limit (default: 60000) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | Max request per window (default: 100) |
| `BCRYPT_SALT_ROUNDS` | ❌ | Salt rounds bcrypt (default: 12) |
| `REDIS_URL` | ❌ | Redis connection (opsional) |

---

## 5. Health Check

Akses `http://localhost:3000` untuk memverifikasi aplikasi berjalan.

Docker health check sudah dikonfigurasi di Dockerfile dengan interval 30 detik.

---

## 6. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Database connection refused | Pastikan PostgreSQL berjalan dan `DATABASE_URL` benar |
| Port 3000 already in use | `lsof -i :3000` lalu kill proses yang konflik |
| Prisma migration error | `npx prisma migrate reset` (⚠️ hapus semua data) |
| Docker build gagal | `docker compose build --no-cache` |
| Permission denied | Pastikan user memiliki akses ke Docker daemon |
| HTTPS certificate expired | `sudo certbot renew` |

---

## 7. Update Aplikasi

```bash
# Pull perubahan
git pull origin main

# Rebuild & restart
docker compose up -d --build

# Jalankan migrasi baru
docker compose exec web npx prisma migrate deploy
```
