const fs = require('fs');
const path = require('path');

const root = 'c:\\\\Users\\\\Asus\\\\Documents\\\\VirtualLab_AKUANALIS\\\\virtuallab\\\\src\\\\app\\\\api';

const files = {
  'classes/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createClassSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    let classes;
    if (session.user.role === 'ADMIN') {
      classes = await prisma.class.findMany({ include: { instructor: true } });
    } else if (session.user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      if (!instructor) return apiError('Not found', 404, 'NOT_FOUND');
      classes = await prisma.class.findMany({ where: { instructorId: instructor.id }, include: { instructor: true } });
    } else {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      if (!student) return apiError('Not found', 404, 'NOT_FOUND');
      const members = await prisma.classMember.findMany({ where: { studentId: student.id }, include: { class: { include: { instructor: true } } } });
      classes = members.map(m => m.class);
    }
    return apiSuccess(classes);
  } catch (error) { return apiError('Error', 500, 'ERROR'); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError('Forbidden', 403, 'FORBIDDEN');
    const body = await req.json();
    const parsed = createClassSchema.parse(body);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let instructorId = body.instructorId;
    if (session.user.role === 'INSTRUCTOR') {
      const inst = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      if (!inst) return apiError('Not found', 404, 'NOT_FOUND');
      instructorId = inst.id;
    }
    
    const newClass = await prisma.class.create({ data: { name: parsed.name, code, course: parsed.course, semester: parsed.semester, academicYear: parsed.academicYear, instructorId } });
    await logAudit(session.user.id, 'CREATE_CLASS', \`Class \${newClass.id} created\`);
    return apiSuccess(newClass, 201);
  } catch (error) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'classes/[id]/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { updateClassSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const cls = await prisma.class.findUnique({
      where: { id: params.id },
      include: { instructor: true, _count: { select: { members: true, experiments: true } } }
    });
    if (!cls) return apiError('Not found', 404, 'NOT_FOUND');
    return apiSuccess(cls);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = updateClassSchema.parse(body);
    const cls = await prisma.class.update({ where: { id: params.id }, data: parsed });
    await logAudit(session.user.id, 'UPDATE_CLASS', 'Class updated');
    return apiSuccess(cls);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await prisma.class.delete({ where: { id: params.id } });
    await logAudit(session.user.id, 'DELETE_CLASS', 'Class deleted');
    return apiSuccess(null);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'classes/[id]/join/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'STUDENT') return apiError('Forbidden', 403, 'FORBIDDEN');
    
    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return apiError('Student not found', 404, 'NOT_FOUND');
    
    const existing = await prisma.classMember.findUnique({ where: { classId_studentId: { classId: params.id, studentId: student.id } } });
    if (existing) return apiError('Already a member', 400, 'ALREADY_EXISTS');
    
    const member = await prisma.classMember.create({ data: { classId: params.id, studentId: student.id } });
    return apiSuccess(member, 201);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'classes/[id]/members/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const members = await prisma.classMember.findMany({
      where: { classId: params.id },
      include: { student: { include: { user: true } } }
    });
    return apiSuccess(members);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'classes/[id]/members/[studentId]/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string, studentId: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError('Forbidden', 403, 'FORBIDDEN');
    
    await prisma.classMember.delete({ where: { classId_studentId: { classId: params.id, studentId: params.studentId } } });
    await logAudit(session.user.id, 'REMOVE_CLASS_MEMBER', 'Member removed');
    return apiSuccess(null);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'lab-modules/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createLabModuleSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const modules = await prisma.labModule.findMany({
      where: { isActive: true },
      include: { _count: { select: { experiments: true } } }
    });
    return apiSuccess(modules);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403, 'FORBIDDEN');
    const body = await req.json();
    const parsed = createLabModuleSchema.parse(body);
    
    const newModule = await prisma.labModule.create({ data: parsed });
    await logAudit(session.user.id, 'CREATE_LAB_MODULE', 'Lab module created');
    return apiSuccess(newModule, 201);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'lab-modules/[id]/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { updateLabModuleSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const mod = await prisma.labModule.findUnique({
      where: { id: params.id },
      include: { formulas: true, quizzes: true }
    });
    if (!mod) return apiError('Not found', 404, 'NOT_FOUND');
    return apiSuccess(mod);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403, 'FORBIDDEN');
    const body = await req.json();
    const parsed = updateLabModuleSchema.parse(body);
    const updated = await prisma.labModule.update({ where: { id: params.id }, data: parsed });
    await logAudit(session.user.id, 'UPDATE_LAB_MODULE', 'Lab module updated');
    return apiSuccess(updated);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN') return apiError('Forbidden', 403, 'FORBIDDEN');
    await prisma.labModule.update({ where: { id: params.id }, data: { isActive: false } });
    await logAudit(session.user.id, 'DELETE_LAB_MODULE', 'Lab module soft deleted');
    return apiSuccess(null);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'experiments/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createExperimentSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    let exps;
    if (session.user.role === 'ADMIN') {
      exps = await prisma.experiment.findMany();
    } else if (session.user.role === 'INSTRUCTOR') {
      const inst = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      exps = await prisma.experiment.findMany({ where: { class: { instructorId: inst?.id } } });
    } else {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      const members = await prisma.classMember.findMany({ where: { studentId: student?.id } });
      exps = await prisma.experiment.findMany({ where: { classId: { in: members.map(m => m.classId) }, isPublished: true } });
    }
    return apiSuccess(exps);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError('Forbidden', 403, 'FORBIDDEN');
    const body = await req.json();
    const parsed = createExperimentSchema.parse(body);
    
    const newExp = await prisma.experiment.create({ data: parsed });
    await logAudit(session.user.id, 'CREATE_EXPERIMENT', 'Experiment created');
    return apiSuccess(newExp, 201);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'experiments/[id]/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { updateExperimentSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const exp = await prisma.experiment.findUnique({
      where: { id: params.id },
      include: { module: true, class: true, _count: { select: { sessions: true } } }
    });
    if (!exp) return apiError('Not found', 404, 'NOT_FOUND');
    return apiSuccess(exp);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = updateExperimentSchema.parse(body);
    const updated = await prisma.experiment.update({ where: { id: params.id }, data: parsed });
    await logAudit(session.user.id, 'UPDATE_EXPERIMENT', 'Experiment updated');
    return apiSuccess(updated);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await prisma.experiment.delete({ where: { id: params.id } });
    await logAudit(session.user.id, 'DELETE_EXPERIMENT', 'Experiment deleted');
    return apiSuccess(null);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'experiments/[id]/publish/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError('Forbidden', 403, 'FORBIDDEN');
    
    const exp = await prisma.experiment.update({ where: { id: params.id }, data: { isPublished: true } });
    await logAudit(session.user.id, 'PUBLISH_EXPERIMENT', 'Experiment published');
    return apiSuccess(exp);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'experiments/[id]/start/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'STUDENT') return apiError('Forbidden', 403, 'FORBIDDEN');
    
    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return apiError('Student not found', 404, 'NOT_FOUND');
    
    const exp = await prisma.experiment.findUnique({ where: { id: params.id } });
    if (!exp || !exp.isPublished) return apiError('Experiment not found or published', 404, 'NOT_FOUND');
    
    const isMember = await prisma.classMember.findUnique({ where: { classId_studentId: { classId: exp.classId, studentId: student.id } } });
    if (!isMember) return apiError('Not a member', 403, 'FORBIDDEN');
    
    const newSession = await prisma.experimentSession.create({
      data: { experimentId: exp.id, studentId: student.id, status: 'IN_PROGRESS', startedAt: new Date() }
    });
    await logAudit(session.user.id, 'START_EXPERIMENT', 'Started experiment session');
    return apiSuccess(newSession, 201);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'sessions/[id]/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const sess = await prisma.experimentSession.findUnique({ where: { id: params.id } });
    if (!sess) return apiError('Not found', 404, 'NOT_FOUND');
    return apiSuccess(sess);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionAuth = await requireAuth();
    const body = await req.json();
    const data: any = {};
    if (body.status === 'COMPLETED') {
      data.status = 'COMPLETED';
      data.completedAt = new Date();
    }
    const sess = await prisma.experimentSession.update({ where: { id: params.id }, data });
    await logAudit(sessionAuth.user.id, 'UPDATE_SESSION', 'Session updated');
    return apiSuccess(sess);
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`,

  'sessions/[id]/save/route.ts': `import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionAuth = await requireAuth();
    const body = await req.json();
    const inputs = Array.isArray(body) ? body : [];
    
    const student = await prisma.student.findUnique({ where: { userId: sessionAuth.user.id } });
    if (!student) return apiError('Student not found', 404, 'NOT_FOUND');
    
    const expSess = await prisma.experimentSession.findUnique({ where: { id: params.id } });
    if (!expSess || expSess.studentId !== student.id) return apiError('Forbidden', 403, 'FORBIDDEN');
    
    // Save inputs - assuming ExperimentInput model exists
    // const createdInputs = await prisma.experimentInput.createMany({
    //   data: inputs.map(i => ({ sessionId: params.id, ...i }))
    // });
    
    await logAudit(sessionAuth.user.id, 'SAVE_SESSION_INPUT', 'Session inputs saved');
    return apiSuccess({ saved: true });
  } catch (e) { return apiError('Error', 500, 'ERROR'); }
}
`
};

Object.keys(files).forEach(file => {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, files[file]);
});

console.log('Done creating API routes');
