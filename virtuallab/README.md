# VirtualLab Analisis Kimia
# ========================
# Aplikasi web untuk pembelajaran/praktikum analisis kimia

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Quick Start

```bash
# 1. Clone and install
cd virtuallab
npm install

# 2. Setup database
# Create a PostgreSQL database named "virtuallab_akuanalis"
# Copy .env.example to .env and update DATABASE_URL
cp .env.example .env

# 3. Push database schema
npm run db:push

# 4. Generate Prisma client
npm run db:generate

# 5. Seed database with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@virtuallab.ac.id | admin123 |
| Dosen | dosen@virtuallab.ac.id | dosen123 |
| Siswa | mahasiswa1@virtuallab.ac.id | siswa123 |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run test:calc` | Run calculation engine tests |

## Project Structure

```
virtuallab/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth handler
│   │   │   ├── calculations/ # Calculation engine API
│   │   │   ├── users/      # User CRUD
│   │   │   ├── classes/    # Class management
│   │   │   ├── assignments/ # Assignment management
│   │   │   ├── submissions/ # Submission + grading
│   │   │   ├── reports/    # Report export
│   │   │   └── audit-log/  # Audit logging
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   └── dashboard/      # Protected dashboard
│   │       ├── experiments/ # Virtual lab experiments
│   │       ├── classes/    # Class management
│   │       ├── assignments/ # Assignment tracking
│   │       └── reports/    # Reports & analytics
│   ├── components/ui/      # Reusable UI components
│   └── lib/
│       ├── auth.ts         # NextAuth configuration
│       ├── prisma.ts       # Prisma client singleton
│       ├── utils.ts        # Utility functions
│       └── calculations/
│           ├── engine.ts   # Calculation engine (925 formulas)
│           └── engine.test.ts # Calculation tests (28 tests)
└── docs/                   # Excel analysis documentation
```

## Experiment Types

| Module | Description | Source |
|--------|-------------|--------|
| Kadar Air | Moisture content analysis | Proksimat |
| Kadar Abu | Ash content analysis | Proksimat |
| Kadar Protein | Protein (Kjeldahl) with standardization | Proksimat |
| Karbohidrat | Carbohydrate (Luff Schoorl method) | Proksimat |
| Massa Molar | Molar mass calculator | Volumetri |
| Bobot Ekuivalen | Equivalent weight calculator | Volumetri |
| Standardisasi | Titration standardization | Volumetri |
| Penetapan Kadar | Concentration determination | Volumetri |
| Kurva Titrasi | Titration curve simulation | Volumetri |

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, NextAuth v4
- **Database**: PostgreSQL + Prisma ORM v5
- **Charts**: Recharts
- **Export**: jspdf, xlsx
