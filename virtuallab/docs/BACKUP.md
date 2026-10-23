# Backup & Restore Database - VirtualLab AKUANALIS

## 1. PostgreSQL Backup

### 1.1. Backup Manual (Host)

```bash
# Full backup (format custom, terkompresi)
pg_dump -U virtuallab -d virtuallab_akuanalis -Fc -f backup_$(date +%Y%m%d_%H%M%S).dump

# Backup SQL plain text
pg_dump -U virtuallab -d virtuallab_akuanalis > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup hanya data (tanpa schema)
pg_dump -U virtuallab -d virtuallab_akuanalis --data-only -Fc -f data_only_$(date +%Y%m%d_%H%M%S).dump

# Backup hanya schema (tanpa data)
pg_dump -U virtuallab -d virtuallab_akuanalis --schema-only -f schema_$(date +%Y%m%d_%H%M%S).sql
```

### 1.2. Backup dari Docker

```bash
# Backup dari container PostgreSQL
docker compose exec postgres pg_dump -U virtuallab virtuallab_akuanalis -Fc > backup_$(date +%Y%m%d_%H%M%S).dump

# Backup SQL dari Docker
docker compose exec postgres pg_dump -U virtuallab virtuallab_akuanalis > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 1.3. Backup Otomatis (Cron)

Buat script `/opt/virtuallab/backup.sh`:

```bash
#!/bin/bash
# VirtualLab AKUANALIS - Automated Backup Script

BACKUP_DIR="/opt/virtuallab/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/virtuallab_${TIMESTAMP}.dump"

# Buat direktori backup jika belum ada
mkdir -p "${BACKUP_DIR}"

# Jalankan backup
docker compose -f /opt/virtuallab/docker-compose.yml exec -T postgres \
  pg_dump -U virtuallab virtuallab_akuanalis -Fc > "${BACKUP_FILE}"

# Verifikasi backup berhasil
if [ $? -eq 0 ] && [ -s "${BACKUP_FILE}" ]; then
  echo "[$(date)] Backup berhasil: ${BACKUP_FILE}"
else
  echo "[$(date)] ERROR: Backup gagal!"
  exit 1
fi

# Hapus backup lama (lebih dari RETENTION_DAYS hari)
find "${BACKUP_DIR}" -name "virtuallab_*.dump" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Cleanup selesai. Backup lebih dari ${RETENTION_DAYS} hari dihapus."
```

Jadwalkan dengan cron:

```bash
chmod +x /opt/virtuallab/backup.sh

# Edit crontab
crontab -e

# Backup setiap hari jam 02:00
0 2 * * * /opt/virtuallab/backup.sh >> /var/log/virtuallab-backup.log 2>&1
```

---

## 2. PostgreSQL Restore

### 2.1. Restore Manual (Host)

```bash
# Restore dari format custom (.dump)
pg_restore -U virtuallab -d virtuallab_akuanalis --clean --if-exists backup_file.dump

# Restore dari SQL plain text
psql -U virtuallab -d virtuallab_akuanalis < backup_file.sql
```

### 2.2. Restore ke Docker

```bash
# Restore format custom
cat backup_file.dump | docker compose exec -T postgres pg_restore -U virtuallab -d virtuallab_akuanalis --clean --if-exists

# Restore SQL
cat backup_file.sql | docker compose exec -T postgres psql -U virtuallab -d virtuallab_akuanalis
```

### 2.3. Restore ke Database Baru

```bash
# Buat database baru
docker compose exec postgres createdb -U virtuallab virtuallab_restore

# Restore ke database baru
cat backup_file.dump | docker compose exec -T postgres pg_restore -U virtuallab -d virtuallab_restore
```

---

## 3. Prisma Migration

### 3.1. Membuat Migration Baru (Development)

```bash
# Buat migration dari perubahan schema
npx prisma migrate dev --name deskripsi_perubahan

# Contoh
npx prisma migrate dev --name add_audit_log_table
```

### 3.2. Deploy Migration (Production)

```bash
# Terapkan semua migration yang belum dijalankan
npx prisma migrate deploy

# Dari Docker
docker compose exec web npx prisma migrate deploy
```

### 3.3. Status Migration

```bash
# Lihat status migration
npx prisma migrate status
```

---

## 4. Migration Rollback

> ⚠️ Prisma tidak mendukung rollback otomatis. Gunakan salah satu metode berikut:

### 4.1. Rollback Manual

```bash
# 1. Buat migration baru yang membalikkan perubahan
npx prisma migrate dev --name rollback_perubahan

# 2. Edit file migration SQL yang dihasilkan
#    untuk mengembalikan schema ke kondisi sebelumnya

# 3. Jalankan migration
npx prisma migrate deploy
```

### 4.2. Rollback dengan Restore Database

```bash
# 1. Stop aplikasi
docker compose stop web

# 2. Restore dari backup terakhir yang valid
cat backup_sebelum_migrasi.dump | \
  docker compose exec -T postgres pg_restore \
  -U virtuallab -d virtuallab_akuanalis --clean --if-exists

# 3. Sesuaikan migration history
npx prisma migrate resolve --applied "nama_migration_yang_di_rollback"

# 4. Restart aplikasi
docker compose start web
```

### 4.3. Reset Total (Development Only)

```bash
# ⚠️ PERINGATAN: Menghapus SEMUA data!
npx prisma migrate reset

# Ini akan: drop database → create database → apply semua migration → run seed
```

---

## 5. Best Practices

### Backup
- ✅ Backup **setiap hari** minimal
- ✅ Simpan backup di **lokasi terpisah** (cloud storage, server berbeda)
- ✅ **Test restore** secara berkala (minimal bulanan)
- ✅ Backup **sebelum** menjalankan migration baru
- ✅ Gunakan format **custom** (`-Fc`) untuk kompresi dan fleksibilitas

### Migration
- ✅ **Review** SQL migration sebelum deploy ke produksi
- ✅ Backup database **sebelum** migration
- ✅ Test migration di **staging** terlebih dahulu
- ✅ Gunakan **nama deskriptif** untuk migration
- ❌ Jangan edit migration yang sudah di-deploy
- ❌ Jangan gunakan `migrate reset` di produksi

### Keamanan
- ✅ Enkripsi backup file
- ✅ Batasi akses ke file backup
- ✅ Jangan simpan credential di script backup (gunakan `.pgpass`)
- ✅ Rotasi backup sesuai kebijakan retensi
