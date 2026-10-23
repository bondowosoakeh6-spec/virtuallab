import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']),
  studentNumber: z.string().optional(),
  program: z.string().optional(),
  semester: z.number().int().positive().optional(),
  employeeNumber: z.string().optional(),
  expertise: z.string().optional(),
}).refine(data => {
  if (data.role === 'STUDENT' && !data.studentNumber) return false;
  return true;
}, { message: "Student number is required for students", path: ["studentNumber"] })
  .refine(data => {
  if (data.role === 'INSTRUCTOR' && !data.employeeNumber) return false;
  return true;
}, { message: "Employee number is required for instructors", path: ["employeeNumber"] });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  course: z.string().min(1, "Course is required"),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();

export const createLabModuleSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  theory: z.string().optional(),
  procedure: z.string().optional(),
});

export const updateLabModuleSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  theory: z.string().optional(),
  procedure: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createExperimentSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  maxScore: z.number().nonnegative(),
  deadline: z.string().datetime().optional(),
});

export const updateExperimentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  maxScore: z.number().nonnegative().optional(),
  deadline: z.string().datetime().optional(),
});

export const submissionSchema = z.object({
  experimentId: z.string().min(1, "Experiment ID is required"),
  sessionId: z.string().optional(),
  status: z.enum([
    'DRAFT',
    'AVAILABLE',
    'STARTED',
    'IN_PROGRESS',
    'READY_TO_SUBMIT',
    'SUBMITTED',
    'GRADED',
    'RETURNED',
    'RESUBMITTED'
  ]).optional(),
  reportUrl: z.string().url().optional(),
});

export const gradeSchema = z.object({
  preTest: z.number().nonnegative().optional(),
  practical: z.number().nonnegative().optional(),
  calculation: z.number().nonnegative().optional(),
  report: z.number().nonnegative().optional(),
  postTest: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  feedback: z.string().optional(),
});

export const moistureInputSchema = z.object({
  bobot_wadah_kosong: z.number().nonnegative(),
  bobot_sampel: z.number().nonnegative(),
  bobot_setelah: z.number().nonnegative(),
});

export const ashInputSchema = z.object({
  bobot_wadah_kosong: z.number().nonnegative(),
  bobot_cawan_sampel: z.number().nonnegative(),
  bobot_setelah: z.number().nonnegative(),
});

export const proteinInputSchema = z.object({
  std_simplo_awal: z.number().nonnegative(),
  std_simplo_akhir: z.number().nonnegative(),
  std_duplo_awal: z.number().nonnegative(),
  std_duplo_akhir: z.number().nonnegative(),
  volume_y: z.number().nonnegative(),
  konsentrasi_y: z.number().nonnegative(),
  blanko_simplo_awal: z.number().nonnegative(),
  blanko_simplo_akhir: z.number().nonnegative(),
  blanko_duplo_awal: z.number().nonnegative(),
  blanko_duplo_akhir: z.number().nonnegative(),
  sample_simplo_awal: z.number().nonnegative(),
  sample_simplo_akhir: z.number().nonnegative(),
  sample_duplo_awal: z.number().nonnegative(),
  sample_duplo_akhir: z.number().nonnegative(),
  konsentrasi_penitar: z.number().nonnegative(),
  ketetapan_protein: z.number().nonnegative(),
  faktor_pengenceran: z.number().nonnegative(),
  massa_sampel: z.number().nonnegative(),
  jenis_sampel: z.string().min(1),
});

export const carbohydrateInputSchema = z.object({
  std_simplo_awal: z.number().nonnegative(),
  std_simplo_akhir: z.number().nonnegative(),
  std_duplo_awal: z.number().nonnegative(),
  std_duplo_akhir: z.number().nonnegative(),
  volume_y: z.number().nonnegative(),
  konsentrasi_y: z.number().nonnegative(),
  blanko_simplo_awal: z.number().nonnegative(),
  blanko_simplo_akhir: z.number().nonnegative(),
  blanko_duplo_awal: z.number().nonnegative(),
  blanko_duplo_akhir: z.number().nonnegative(),
  sample_simplo_awal: z.number().nonnegative(),
  sample_simplo_akhir: z.number().nonnegative(),
  sample_duplo_awal: z.number().nonnegative(),
  sample_duplo_akhir: z.number().nonnegative(),
  konsentrasi_penitar_dibuat: z.number().nonnegative(),
  faktor_pengenceran: z.number().nonnegative(),
  massa_sampel: z.number().nonnegative(),
  sugar_type: z.enum(['glukosa_fruktosa', 'laktosa', 'maltosa']),
  jenis_sampel: z.string().min(1),
});

export const standardizationInputSchema = z.object({
  volume_y: z.number().nonnegative(),
  konsentrasi_y: z.number().nonnegative(),
  simplo_awal: z.number().nonnegative(),
  simplo_akhir: z.number().nonnegative(),
  duplo_awal: z.number().nonnegative(),
  duplo_akhir: z.number().nonnegative(),
});

export const kadarInputSchema = z.object({
  simplo_awal: z.number().nonnegative(),
  simplo_akhir: z.number().nonnegative(),
  duplo_awal: z.number().nonnegative(),
  duplo_akhir: z.number().nonnegative(),
  unsur_senyawa: z.string().min(1),
  konsentrasi_penitar: z.number().nonnegative(),
  volume_sampel: z.number().nonnegative(),
  faktor_pengenceran: z.number().nonnegative(),
});

export const molarMassInputSchema = z.object({
  groups: z.array(z.array(z.object({
    symbol: z.string().min(1),
    quantity: z.number().int().positive(),
  }))).min(1),
});

export const equivalentWeightInputSchema = z.object({
  groups: z.array(z.array(z.object({
    symbol: z.string().min(1),
    quantity: z.number().int().positive(),
  }))).min(1),
  nValues: z.array(z.number().positive()).min(1),
});

export const titrationCurveInputSchema = z.object({
  ka: z.number().positive(),
  volume_y: z.number().nonnegative(),
  konsentrasi_y: z.number().nonnegative(),
  volume_increment: z.number().positive(),
});


export const proteinStandardlessInputSchema = z.object({
  blanko_simplo_awal: z.number().nonnegative(),
  blanko_simplo_akhir: z.number().nonnegative(),
  blanko_duplo_awal: z.number().nonnegative(),
  blanko_duplo_akhir: z.number().nonnegative(),
  sample_simplo_awal: z.number().nonnegative(),
  sample_simplo_akhir: z.number().nonnegative(),
  sample_duplo_awal: z.number().nonnegative(),
  sample_duplo_akhir: z.number().nonnegative(),
  konsentrasi_hcl: z.number().nonnegative(),
  ketetapan_protein: z.number().nonnegative(),
  faktor_pengenceran: z.number().nonnegative(),
  massa_sampel: z.number().nonnegative(),
  jenis_sampel: z.string().min(1),
});
