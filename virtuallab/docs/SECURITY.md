# Keamanan Sistem - VirtualLab AKUANALIS

## Ringkasan Keamanan (Feature #68)

Dokumen ini mendokumentasikan seluruh langkah keamanan yang diterapkan pada VirtualLab AKUANALIS.

---

## 1. Password Hashing

- Menggunakan **bcryptjs** dengan salt rounds yang dapat dikonfigurasi via env `BCRYPT_SALT_ROUNDS` (default: 12)
- Password **tidak pernah** disimpan dalam bentuk plaintext
- Implementasi: `src/lib/auth.ts` dan `prisma/seed.ts`

## 2. Secure Session

- Menggunakan **NextAuth.js** dengan strategi **JWT**
- Token JWT di-sign menggunakan `NEXTAUTH_SECRET`
- Cookie session bersifat **httpOnly** (tidak dapat diakses JavaScript)
- Konfigurasi: `src/lib/auth.ts`

## 3. Role-Based Access Control (RBAC)

| Resource | ADMIN | INSTRUCTOR | STUDENT |
|----------|-------|------------|---------|
| Users | CRUD | ❌ | ❌ |
| Classes | CRUD (all) | CRUD (own) | Read (own) |
| Experiments | CRUD (all) | CRUD (own) | Read (own) |
| Formulas | CRUD (all) | Read | ❌ |
| Grades | CRUD (all) | CRU (own) | Read (own) |
| Submissions | RU (all) | RU (own) | CRUD (own) |
| Audit Logs | Read | ❌ | ❌ |
| System Settings | RU | ❌ | ❌ |

- Implementasi: `src/lib/authorization.ts`

## 4. Server-Side Authorization

- **Middleware level**: `src/middleware.ts` memvalidasi token dan role sebelum request mencapai API handler
- **API level**: Setiap route menggunakan `requireAuth()`, `requireRole()`, atau `withAuthorization()` 
- Tidak ada authorization yang dilakukan hanya di client-side

## 5. Input Validation

- Menggunakan **Zod v4** untuk validasi semua input API
- Schema validasi: `src/lib/validations/index.ts`
- Validasi meliputi: tipe data, format email, panjang minimum, nilai numerik non-negatif
- Utility tambahan: `src/lib/security.ts` → `sanitizeInput()`, `isStrongPassword()`

## 6. SQL Injection Prevention

- Menggunakan **Prisma ORM** yang secara otomatis menggunakan parameterized queries
- Tidak ada raw SQL query tanpa parameterisasi
- Semua input user melewati Prisma query builder

## 7. XSS Prevention

- **React** secara default melakukan escaping pada semua output JSX
- Security headers di `middleware.ts`:
  - `X-XSS-Protection: 1; mode=block`
  - `X-Content-Type-Options: nosniff`
- Utility `sanitizeInput()` untuk membersihkan input dari HTML tags

## 8. CSRF Protection

- **NextAuth.js** menyertakan CSRF token otomatis pada form authentication
- Session menggunakan JWT (stateless), mengurangi serangan CSRF pada API
- CSRF secret dikonfigurasi via env `CSRF_SECRET`

## 9. Rate Limiting

- Diimplementasikan di `src/middleware.ts`
- Konfigurasi:
  - API umum: 100 request / 60 detik (configurable via env)
  - Endpoint auth: 10 request / 60 detik (lebih ketat)
- Response header menampilkan: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Status 429 jika limit terlampaui dengan header `Retry-After`

## 10. Secure Headers

Diterapkan di `middleware.ts` dan `next.config.ts`:

| Header | Nilai |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (production) |
| `X-DNS-Prefetch-Control` | `on` |

## 11. Environment Secrets

- Semua secrets disimpan di `.env` (tidak di-commit ke repository)
- `.gitignore` menolak semua file `.env` kecuali `.env.example`
- `.env.example` menyediakan template tanpa nilai sensitif

## 12. Audit Logging

- Semua aksi penting dicatat ke tabel `audit_logs`
- 13 jenis aksi yang dicatat: LOGIN, LOGOUT, CREATE_CLASS, JOIN_CLASS, CREATE_EXPERIMENT, START_EXPERIMENT, CALCULATE, SAVE_SESSION, SUBMIT, GRADE, FEEDBACK, EXPORT_REPORT, CHANGE_FORMULA
- Mencatat: userId, action, entity, entityId, metadata, ipAddress, userAgent, timestamp
- Hanya ADMIN yang dapat membaca audit logs

---

## ⛔ LARANGAN (Jangan Dilakukan)

- ❌ **Jangan** simpan password dalam plaintext
- ❌ **Jangan** letakkan API secret di frontend/client-side code
- ❌ **Jangan** commit database credential ke repository
- ❌ **Jangan** gunakan `eval()` atau `dangerouslySetInnerHTML` tanpa sanitisasi
- ❌ **Jangan** bypass server-side authorization
- ❌ **Jangan** log password atau token ke console/file
