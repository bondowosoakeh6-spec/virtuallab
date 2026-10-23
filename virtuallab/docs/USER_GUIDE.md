# User Guide

## Getting Started

### Demo Accounts

After seeding the database (`npm run db:seed`), the following accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@virtuallab.ac.id | admin123 |
| Instructor (Dosen) | dosen@virtuallab.ac.id | dosen123 |
| Student (Mahasiswa) | mahasiswa1@virtuallab.ac.id | siswa123 |

### Login

1. Open `http://localhost:3000` in your browser
2. You will be redirected to the login page
3. Enter your email and password
4. Click "Masuk" to login
5. You will be redirected to your role-specific dashboard

---

## Student Workflow

### 1. Dashboard
After login, you see an overview with:
- Active classes you've joined
- Pending experiments
- Recent grades
- Quick links

### 2. Join a Class
1. Navigate to **Kelas** in the sidebar
2. Enter the class code provided by your instructor
3. Click "Gabung Kelas"
4. The class appears in your list

### 3. Open an Experiment
1. Navigate to **Praktikum** in the sidebar
2. Select a class
3. Choose an experiment (e.g., "Kadar Air")
4. Click to open the experiment form

### 4. Enter Experiment Data
Each experiment type has specific input fields:

| Experiment | Key Inputs |
|-----------|------------|
| Kadar Air (Moisture) | Bobot wadah kosong, bobot sampel, bobot setelah pemanasan |
| Kadar Abu (Ash) | Bobot wadah kosong, bobot cawan + sampel, bobot setelah pengabuan |
| Kadar Protein (Kjeldahl) | Volumes buret (simplo/duplo) for standardization, blanko, and sampel |
| Karbohidrat (Luff Schoorl) | Volume Na₂S₂O₃ blanko dan sampel, massa sampel |
| Standardisasi | Volumes buret awal/akhir (simplo/duplo), konsentrasi standar |
| Penetapan Kadar | Volume titrasi, normalitas, BE, massa sampel |
| Massa Molar | Chemical elements and their quantities |
| Bobot Ekuivalen | Chemical formula and valence |
| Kurva Titrasi | Analyte concentration/volume, titrant concentration, Ka |

### 5. View Calculation Results
After entering data and clicking "Hitung":
- Full formula derivation is shown (not just the result)
- Each step displays: generic formula → substituted values → result
- Titration curves show an interactive chart

Example display:
```
Kadar Air
= Berat Air / Berat Sampel × 100
= 0.2205 / 2.0015 × 100
= 11.02%
```

### 6. Submit Work
1. Review your calculation results
2. Click "Submit" to send to your instructor
3. Status changes from DRAFT to SUBMITTED

### 7. View Grades
1. Navigate to **Nilai** in the sidebar
2. See all graded submissions with scores:
   - Pre-test, Practical, Calculation, Report, Post-test
   - Total score
   - Instructor feedback

---

## Instructor Workflow

### 1. Dashboard
Overview showing:
- Your classes and student count
- Pending submissions to review
- Analytics summary

### 2. Create a Class
1. Navigate to **Kelas**
2. Click "Buat Kelas Baru"
3. Fill in: Name, Course Code, Semester, Academic Year
4. Share the class code with students

### 3. Manage Students
1. Open a class
2. View enrolled students
3. Remove students if needed

### 4. Create Experiments
1. Navigate to **Praktikum**
2. Click "Buat Praktikum"
3. Select a lab module (e.g., Kadar Air)
4. Set: Title, Description, Max Score, Deadline
5. Click "Publish" to make available to students

### 5. Review Submissions
1. Navigate to **Submissions**
2. View submitted work from students
3. Click a submission to see details:
   - Input data
   - Calculation steps
   - Formula displays

### 6. Grade
1. Navigate to **Grading**
2. Select a submission
3. Enter scores for each component:
   - Pre-test (optional)
   - Practical work
   - Calculation accuracy
   - Report quality
   - Post-test (optional)
4. Enter total score
5. Write feedback
6. Click "Submit Grade"

### 7. Analytics
Navigate to **Analitik** to see:
- Class performance overview
- Score distributions
- Submission status breakdown

### 8. Reports
Navigate to **Laporan** to:
- Export grades as Excel
- Generate PDF reports
- View per-class summaries

---

## Admin Workflow

### 1. All Instructor Features
Admins have access to all instructor features plus admin-specific pages.

### 2. User Management
1. Navigate to **Users** in the sidebar
2. View all users with role and status badges
3. Search by name or email
4. Filter by role (Admin/Instructor/Student) and status
5. Create new users with the "Add User" button
6. Edit user details
7. Suspend/activate users
8. Deactivate users

### 3. Formula Management
1. Navigate to **Formula** in the sidebar
2. View all formulas with:
   - Formula ID (e.g., MOISTURE_PERCENT)
   - Name, Expression, Source Workbook/Sheet/Cell
   - Version history
3. Edit formulas (creates a new version, never overwrites)
4. System formulas are read-only for non-admins

### 4. Chemistry Database
1. Navigate to **Chemistry DB** in the sidebar
2. **Elements tab**: Browse all 118 elements, search by symbol or name
3. **Molar Mass tab**: Enter a chemical formula (e.g., H2SO4) to calculate molar mass with element breakdown
4. **Equivalent Weight tab**: Enter formula and valence to calculate equivalent weight

### 5. Audit Logs
1. Navigate to **Audit Log** in the sidebar
2. View all system events:
   - Login/Logout
   - User creation/updates
   - Formula changes
   - Submission actions
   - Grade actions

---

## Experiment Types

| # | Type | Description | Key Calculation |
|---|------|-------------|----------------|
| 1 | Kadar Air | Moisture content by gravimetric drying | (berat_air / bobot_sampel) × 100 |
| 2 | Kadar Abu | Ash content by incineration | (berat_abu / bobot_sampel) × 100 |
| 3 | Kadar Protein | Protein by Kjeldahl method | %N × conversion factor |
| 4 | Protein Standardless | Protein without standardization step | Direct N calculation |
| 5 | Karbohidrat | Carbohydrate by Luff Schoorl | Lookup table + calculation |
| 6 | Karbohidrat v2 | Alternative carbohydrate method | Modified Luff Schoorl |
| 7 | Standardisasi | Titrant standardization | (V_Y × N_Y) / V_X |
| 8 | Standardisasi & Kadar | Combined standardization + assay | Chained calculation |
| 9 | Penetapan Kadar | Assay determination | (V × N × BE × FP) / (massa × 10) × 100 |
| 10 | Massa Molar | Molar mass calculation | Σ(Ar × count) |
| 11 | Bobot Ekuivalen | Equivalent weight | Mr / valence |
| 12 | Kurva Titrasi | Titration curve generation | pH vs. volume plot |

## Understanding Formula Display

All calculations show full derivation per Rule #80. Example:

```
Kadar Abu
= Berat Abu / Bobot Sampel × 100
= 0.2490 / 2.5310 × 100
= 9.84%
```

This ensures transparency and allows students to verify each step.

## Exporting Reports

### Excel Export
- Go to **Laporan** → Click "Export Excel"
- Downloads an .xlsx file with all data

### PDF Export
- Go to **Laporan** → Click "Export PDF"
- Downloads a formatted PDF report
