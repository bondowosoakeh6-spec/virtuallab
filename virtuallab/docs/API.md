# API Documentation

## Overview

VirtualLab AKUANALIS provides a RESTful API built on Next.js App Router. All responses follow a standard format:

```json
{
  "success": true|false,
  "data": { ... } | null,
  "error": { "code": "ERROR_CODE", "message": "..." } | null,
  "meta": { "total": 100, "page": 1, "limit": 10 }
}
```

## Authentication

All protected routes require a valid NextAuth session cookie (JWT). The session is automatically included in browser requests. For API testing, authenticate via the login page first.

---

## Auth Endpoints

### POST /api/auth/callback/credentials
Login via NextAuth credentials provider.
- **Auth**: None
- **Body**: `{ email: string, password: string }`
- **Response**: Session cookie set

### GET /api/auth/me
Get current authenticated user info.
- **Auth**: Required
- **Response**: `{ user: { id, name, email, role } }`

### POST /api/auth/register
Register a new user account.
- **Auth**: None
- **Body**: `{ name, email, password, role, studentNumber?, employeeNumber? }`
- **Response**: User object (201)

### POST /api/auth/change-password
Change the current user's password.
- **Auth**: Required
- **Body**: `{ currentPassword, newPassword }`

### POST /api/auth/forgot-password
Request password reset.
- **Auth**: None
- **Body**: `{ email }`

---

## User Endpoints

### GET /api/users
List all users (paginated, searchable).
- **Auth**: ADMIN only
- **Query**: `page`, `limit`, `search`, `role`
- **Response**: `{ users: User[], total, page, limit }`

### POST /api/users
Create a new user.
- **Auth**: ADMIN only
- **Body**: `{ name, email, password, role, studentNumber?, employeeNumber? }`
- **Response**: User object (201)

### GET /api/users/[id]
Get user details.
- **Auth**: ADMIN or self
- **Response**: User with student/instructor profile

### PATCH /api/users/[id]
Update user details.
- **Auth**: ADMIN or self
- **Body**: `{ name?, status? }`

### DELETE /api/users/[id]
Deactivate a user (soft delete).
- **Auth**: ADMIN only

---

## Student Endpoints

### GET /api/students
List all students.
- **Auth**: ADMIN, INSTRUCTOR

### GET /api/students/[id]
Get student details.
- **Auth**: ADMIN, INSTRUCTOR, or self

---

## Instructor Endpoints

### GET /api/instructors
List all instructors.
- **Auth**: ADMIN

### GET /api/instructors/[id]
Get instructor details.
- **Auth**: ADMIN or self

---

## Class Endpoints

### GET /api/classes
List classes (filtered by role).
- **Auth**: Required
- **Query**: `page`, `limit`, `search`

### POST /api/classes
Create a new class.
- **Auth**: INSTRUCTOR, ADMIN
- **Body**: `{ name, code, course, semester?, academicYear? }`

### GET /api/classes/[id]
Get class details with members and experiments.
- **Auth**: Required (member or admin)

### PATCH /api/classes/[id]
Update class details.
- **Auth**: INSTRUCTOR (owner), ADMIN

### DELETE /api/classes/[id]
Delete a class.
- **Auth**: ADMIN

### POST /api/classes/[id]/join
Student joins a class.
- **Auth**: STUDENT

### GET /api/classes/[id]/members
List class members.
- **Auth**: Required (member)

### DELETE /api/classes/[id]/members/[studentId]
Remove a student from a class.
- **Auth**: INSTRUCTOR (owner), ADMIN

---

## Lab Module Endpoints

### GET /api/lab-modules
List all lab modules.
- **Auth**: Required

### GET /api/lab-modules/[id]
Get module details with formulas.
- **Auth**: Required

---

## Experiment Endpoints

### GET /api/experiments
List experiments (filtered by class/module).
- **Auth**: Required
- **Query**: `classId`, `moduleId`

### POST /api/experiments
Create a new experiment.
- **Auth**: INSTRUCTOR, ADMIN
- **Body**: `{ moduleId, classId, title, description?, maxScore, deadline? }`

### GET /api/experiments/[id]
Get experiment details.
- **Auth**: Required

### PATCH /api/experiments/[id]
Update experiment.
- **Auth**: INSTRUCTOR (owner), ADMIN

### POST /api/experiments/[id]/publish
Publish/unpublish an experiment.
- **Auth**: INSTRUCTOR, ADMIN
- **Body**: `{ isPublished: boolean }`

### POST /api/experiments/[id]/start
Student starts an experiment session.
- **Auth**: STUDENT

### POST /api/experiments/[id]/transition
Transition experiment session state.
- **Auth**: Required
- **Body**: `{ action: string }`

---

## Session Endpoints

### GET /api/sessions/[id]
Get experiment session with inputs and calculations.
- **Auth**: Required (owner or instructor/admin)

### POST /api/sessions/[id]/save
Save experiment session inputs.
- **Auth**: STUDENT (owner)
- **Body**: `{ inputs: Array<{ parameter, value, unit? }> }`

---

## Calculation Endpoints

### POST /api/calculations
Run a generic calculation.
- **Auth**: Required
- **Body**: `{ type: string, inputs: object, sessionId? }`

### POST /api/calculations/moisture
Calculate moisture content (Kadar Air).
- **Auth**: Required
- **Body**: `{ bobot_wadah_kosong, bobot_cawan_sampel, bobot_sampel, bobot_setelah }`

### POST /api/calculations/ash
Calculate ash content (Kadar Abu).
- **Auth**: Required
- **Body**: `{ bobot_wadah_kosong, bobot_cawan_sampel, bobot_setelah }`

### POST /api/calculations/protein
Calculate protein content (Kjeldahl method).
- **Auth**: Required
- **Body**: `{ std_simplo_awal, std_simplo_akhir, ..., massa_sampel, jenis_sampel }`

### POST /api/calculations/protein-standardless
Calculate protein without standardization.
- **Auth**: Required

### POST /api/calculations/carbohydrate
Calculate carbohydrate content.
- **Auth**: Required

### POST /api/calculations/standardization
Calculate titrant standardization.
- **Auth**: Required
- **Body**: `{ simplo_awal, simplo_akhir, duplo_awal, duplo_akhir, volume_y, konsentrasi_y }`

### POST /api/calculations/assay
Calculate assay (Penetapan Kadar).
- **Auth**: Required

### POST /api/calculations/molar-mass
Calculate molar mass of a compound.
- **Auth**: Required
- **Body**: `{ elements: [{ symbol, count }] }`

### POST /api/calculations/equivalent-weight
Calculate equivalent weight.
- **Auth**: Required
- **Body**: `{ molarMass, valence }`

### POST /api/calculations/titration-curve
Generate titration curve data points.
- **Auth**: Required
- **Body**: `{ analyte_conc, analyte_vol, titrant_conc, ka?, is_strong_acid? }`

---

## Submission Endpoints

### GET /api/submissions
List submissions.
- **Auth**: Required
- **Query**: `experimentId`, `studentId`, `status`

### POST /api/submissions
Create/submit a submission.
- **Auth**: STUDENT
- **Body**: `{ experimentId, sessionId? }`

### GET /api/submissions/[id]
Get submission details.
- **Auth**: Required

### PATCH /api/submissions/[id]
Update submission.
- **Auth**: Owner or ADMIN

### POST /api/submissions/[id]/grade
Grade a submission.
- **Auth**: INSTRUCTOR, ADMIN
- **Body**: `{ preTest?, practical?, calculation?, report?, postTest?, total, feedback? }`

### POST /api/submissions/[id]/resubmit
Allow resubmission.
- **Auth**: INSTRUCTOR, ADMIN

---

## Formula Endpoints

### GET /api/formulas
List all formulas with versions.
- **Auth**: Required

### POST /api/formulas
Create a new formula.
- **Auth**: ADMIN only
- **Body**: `{ code, name, expression, moduleId, unit?, sourceFile?, sourceSheet?, sourceCell? }`

### GET /api/formulas/[id]
Get formula details with all versions.
- **Auth**: Required

### PATCH /api/formulas/[id]
Update formula (creates new version, Rule #82).
- **Auth**: ADMIN only
- **Body**: `{ expression?, name?, description? }`

### GET /api/formulas/[id]/versions
List all versions of a formula.
- **Auth**: Required

---

## Chemistry Endpoints

### GET /api/chemistry/elements
Get full periodic table (118 elements).
- **Auth**: Required

### GET /api/chemistry/elements/[symbol]
Get element by symbol.
- **Auth**: Required

### GET /api/chemistry/molar-mass
Calculate molar mass from formula string.
- **Auth**: Required
- **Query**: `formula` (e.g., `H2O`, `H2SO4`)

### GET /api/chemistry/equivalent-weight
Calculate equivalent weight.
- **Auth**: Required
- **Query**: `formula`, `valence`

---

## Luff Schoorl Endpoints

### GET /api/luff-schoorl
Get Luff Schoorl lookup table.
- **Auth**: Required

### GET /api/luff-schoorl/lookup
Lookup sugar mg from Na₂S₂O₃ volume.
- **Auth**: Required
- **Query**: `volume`, `type` (glucose|lactose|maltose)

---

## Report Endpoints

### GET /api/reports/excel
Export data as Excel file.
- **Auth**: INSTRUCTOR, ADMIN
- **Query**: `classId`, `experimentId`

### GET /api/reports/pdf
Export data as PDF file.
- **Auth**: Required

### GET /api/reports/export
General export endpoint.
- **Auth**: Required

---

## Dashboard Endpoints

### GET /api/dashboard
Get dashboard summary data (role-specific).
- **Auth**: Required

### GET /api/dashboard/analytics
Get analytics data for instructors/admins.
- **Auth**: INSTRUCTOR, ADMIN

---

## Assignment Endpoints

### GET /api/assignments
List assignments for the current user.
- **Auth**: Required

---

## Audit Log Endpoints

### GET /api/audit-log
List audit log entries.
- **Auth**: ADMIN only
- **Query**: `page`, `limit`, `action`, `entity`

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `INVALID_INPUT` | 400 | Missing or malformed input |
| `CONFLICT` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMITED` | 429 | Too many requests |
| `CALCULATION_DIVISION_BY_ZERO` | 400 | Division by zero in calculation |
| `MISSING_PARAMETER` | 400 | Required parameter missing |
| `FORMULA_NOT_FOUND` | 404 | Formula ID not found |
| `LOOKUP_VALUE_NOT_FOUND` | 404 | Luff Schoorl lookup value not found |
| `SUBMISSION_LOCKED` | 403 | Submission already graded |
