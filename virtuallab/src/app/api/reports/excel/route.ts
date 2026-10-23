import { NextRequest } from 'next/server';
import * as XLSX from 'xlsx';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { apiError, ErrorCodes } from '@/lib/api-response';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId');
    const classId = searchParams.get('classId');

    if (!submissionId && !classId) {
      return apiError(
        ErrorCodes.INVALID_INPUT,
        'Harus menyertakan parameter submissionId atau classId',
        400
      );
    }

    const { session, error: authError } = await requireAuth();
    if (authError || !session?.user) {
      return authError || apiError(ErrorCodes.UNAUTHORIZED, 'Unauthorized access', 401);
    }

    const currentUser = session.user;
    const dateStr = new Date().toISOString().split('T')[0];

    // =========================================================================
    // CASE 1: SINGLE SUBMISSION EXPORT
    // =========================================================================
    if (submissionId) {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          experiment: {
            include: {
              module: true,
              class: {
                include: {
                  instructor: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          grade: true,
        },
      });

      if (!submission) {
        return apiError(ErrorCodes.NOT_FOUND, 'Data submission tidak ditemukan', 404);
      }

      // Authorization checks
      if (currentUser.role === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId: currentUser.id },
        });
        if (
          !student ||
          (submission.studentId !== student.id && submission.student.userId !== currentUser.id)
        ) {
          return apiError(
            ErrorCodes.FORBIDDEN,
            'Akses ditolak: Hanya dapat mengunduh laporan sendiri',
            403
          );
        }
      } else if (currentUser.role === 'INSTRUCTOR') {
        const instructor = await prisma.instructor.findUnique({
          where: { userId: currentUser.id },
        });
        const classInstructorId = submission.experiment.class.instructorId;
        const isClassInstructor =
          (instructor && classInstructorId === instructor.id) ||
          classInstructorId === currentUser.id;

        if (!isClassInstructor) {
          return apiError(
            ErrorCodes.FORBIDDEN,
            'Akses ditolak: Hanya dapat mengunduh laporan kelas yang diampu',
            403
          );
        }
      } else if (currentUser.role !== 'ADMIN') {
        return apiError(ErrorCodes.FORBIDDEN, 'Akses ditolak', 403);
      }

      // Retrieve session data (inputs & calculations)
      let sessionData = null;
      if (submission.sessionId) {
        sessionData = await prisma.experimentSession.findUnique({
          where: { id: submission.sessionId },
          include: {
            inputs: true,
            calculations: true,
          },
        });
      }

      if (!sessionData) {
        sessionData = await prisma.experimentSession.findFirst({
          where: {
            experimentId: submission.experimentId,
            studentId: submission.studentId,
          },
          include: {
            inputs: true,
            calculations: true,
          },
          orderBy: { startedAt: 'desc' },
        });
      }

      const workbook = XLSX.utils.book_new();

      // 1. IDENTITY WORKSHEET
      const studentName = submission.student.user.name;
      const studentNumber = submission.student.studentNumber || '-';
      const className = submission.experiment.class.name;
      const experimentTitle = submission.experiment.title;
      const moduleName = submission.experiment.module?.name || '-';
      const submissionDate = submission.submittedAt
        ? new Date(submission.submittedAt).toISOString().split('T')[0]
        : dateStr;

      const identityRows = [
        ['VirtualLab AKUANALIS - Laporan Praktikum Laboratorium'],
        [''],
        ['Parameter', 'Keterangan'],
        ['Nama Mahasiswa', studentName],
        ['Nomor Induk Mahasiswa (NIM)', studentNumber],
        ['Kelas', className],
        ['Mata Kuliah', submission.experiment.class.course || '-'],
        ['Semester / Tahun Ajaran', `${submission.experiment.class.semester || '-'} / ${submission.experiment.class.academicYear || '-'}`],
        ['Judul Eksperimen', experimentTitle],
        ['Modul Praktikum', moduleName],
        ['Dosen Pengampu', submission.experiment.class.instructor?.user?.name || '-'],
        ['Tanggal Pengumpulan', submissionDate],
        ['Status Submission', submission.status],
      ];

      const wsIdentity = XLSX.utils.aoa_to_sheet(identityRows);
      wsIdentity['!cols'] = [{ wch: 30 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(workbook, wsIdentity, 'Identity');

      // 2. RAW DATA WORKSHEET
      const inputs = sessionData?.inputs || [];
      const rawDataRows: any[][] = [
        ['VirtualLab AKUANALIS - Data Pengamatan (Raw Data)'],
        [''],
        ['No', 'Parameter', 'Nilai Numerik', 'Nilai Teks', 'Satuan'],
      ];

      if (inputs.length > 0) {
        inputs.forEach((input, idx) => {
          rawDataRows.push([
            idx + 1,
            input.parameter,
            input.value !== null && input.value !== undefined ? Number(input.value) : '',
            input.textValue ?? '',
            input.unit ?? '',
          ]);
        });
      } else {
        rawDataRows.push([1, 'Tidak ada data pengamatan mentah', '', '', '']);
      }

      const wsRaw = XLSX.utils.aoa_to_sheet(rawDataRows);
      wsRaw['!cols'] = [{ wch: 6 }, { wch: 35 }, { wch: 18 }, { wch: 20 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, wsRaw, 'Raw Data');

      // 3. CALCULATION WORKSHEET
      const calculations = sessionData?.calculations || [];
      const calcRows: any[][] = [
        ['VirtualLab AKUANALIS - Data Perhitungan & Formula'],
        [''],
        ['No', 'ID Perhitungan', 'Formula / Rumus', 'Snapshot Input', 'Langkah Antara (Intermediate)', 'Hasil Perhitungan', 'Satuan', 'Status'],
      ];

      if (calculations.length > 0) {
        calculations.forEach((calc, idx) => {
          let intermediateText = '';
          if (calc.intermediate) {
            intermediateText =
              typeof calc.intermediate === 'object'
                ? JSON.stringify(calc.intermediate)
                : String(calc.intermediate);
          }

          let inputSnapshotText = '';
          if (calc.inputSnapshot) {
            inputSnapshotText =
              typeof calc.inputSnapshot === 'object'
                ? JSON.stringify(calc.inputSnapshot)
                : String(calc.inputSnapshot);
          }

          calcRows.push([
            idx + 1,
            calc.calculationId || 'CALC-' + (idx + 1),
            calc.formula || '-',
            inputSnapshotText,
            intermediateText,
            calc.result !== null && calc.result !== undefined ? Number(calc.result) : '',
            calc.unit ?? '',
            calc.status || 'SUCCESS',
          ]);
        });
      } else {
        calcRows.push([1, '-', 'Belum ada data kalkulasi', '', '', '', '', '']);
      }

      const wsCalc = XLSX.utils.aoa_to_sheet(calcRows);
      wsCalc['!cols'] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 35 },
        { wch: 30 },
        { wch: 35 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(workbook, wsCalc, 'Calculation');

      // 4. RESULT WORKSHEET
      const resultRows: any[][] = [
        ['VirtualLab AKUANALIS - Hasil Akhir Analisis'],
        [''],
        ['No', 'Parameter / Rumus', 'Hasil Akhir', 'Satuan', 'Status'],
      ];

      if (calculations.length > 0) {
        calculations.forEach((calc, idx) => {
          resultRows.push([
            idx + 1,
            calc.formula || calc.calculationId || '-',
            calc.result !== null && calc.result !== undefined ? Number(calc.result) : '',
            calc.unit ?? '',
            calc.status || 'SUCCESS',
          ]);
        });
      } else {
        resultRows.push([1, 'Belum ada hasil', '', '', '']);
      }

      const wsResult = XLSX.utils.aoa_to_sheet(resultRows);
      wsResult['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 18 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, wsResult, 'Result');

      // 5. ASSESSMENT WORKSHEET
      const grade = submission.grade;
      const assessRows: any[][] = [
        ['VirtualLab AKUANALIS - Evaluasi & Penilaian Dosen'],
        [''],
        ['Komponen Evaluasi', 'Nilai / Skor'],
        ['Pre-Test', grade?.preTest !== null && grade?.preTest !== undefined ? Number(grade.preTest) : '-'],
        ['Praktikum', grade?.practical !== null && grade?.practical !== undefined ? Number(grade.practical) : '-'],
        ['Perhitungan', grade?.calculation !== null && grade?.calculation !== undefined ? Number(grade.calculation) : '-'],
        ['Laporan', grade?.report !== null && grade?.report !== undefined ? Number(grade.report) : '-'],
        ['Post-Test', grade?.postTest !== null && grade?.postTest !== undefined ? Number(grade.postTest) : '-'],
        ['Total Skor', grade?.total !== null && grade?.total !== undefined ? Number(grade.total) : 'Belum Dinilai'],
        [''],
        ['Feedback / Catatan Dosen', grade?.feedback || 'Belum ada catatan evaluasi.'],
      ];

      const wsAssess = XLSX.utils.aoa_to_sheet(assessRows);
      wsAssess['!cols'] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(workbook, wsAssess, 'Assessment');

      // Filename
      const experimentSlug =
        submission.experiment.module?.slug ||
        submission.experiment.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `${studentNumber}_${experimentSlug}_${submissionDate}.xlsx`;

      await logAudit({
        userId: currentUser.id,
        action: 'EXPORT_EXCEL_SUBMISSION',
        entity: 'Submission',
        entityId: submission.id,
        metadata: { filename, experimentSlug, studentNumber },
      });

      await logAudit({
        userId: currentUser.id,
        action: AuditAction.EXPORT_REPORT,
        entity: AuditEntity.REPORT,
        entityId: submission.id,
        metadata: { filename, format: 'XLSX', experimentSlug, studentNumber },
      });

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // =========================================================================
    // CASE 2: CLASS EXPORT
    // =========================================================================
    if (classId) {
      const classRecord = await prisma.class.findUnique({
        where: { id: classId },
        include: {
          instructor: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!classRecord) {
        return apiError(ErrorCodes.NOT_FOUND, 'Data kelas tidak ditemukan', 404);
      }

      // Authorization for class export (Instructor of class or Admin)
      if (currentUser.role === 'INSTRUCTOR') {
        const instructor = await prisma.instructor.findUnique({
          where: { userId: currentUser.id },
        });
        const isClassInstructor =
          (instructor && classRecord.instructorId === instructor.id) ||
          classRecord.instructorId === currentUser.id;

        if (!isClassInstructor) {
          return apiError(
            ErrorCodes.FORBIDDEN,
            'Akses ditolak: Hanya dapat mengunduh rekap kelas yang diampu',
            403
          );
        }
      } else if (currentUser.role !== 'ADMIN') {
        return apiError(
          ErrorCodes.FORBIDDEN,
          'Akses ditolak: Hanya dosen dan admin yang dapat mengunduh rekap kelas',
          403
        );
      }

      // Query all submissions for experiments in this class
      const submissions = await prisma.submission.findMany({
        where: {
          experiment: {
            classId: classId,
          },
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          experiment: {
            include: {
              module: true,
            },
          },
          grade: true,
        },
        orderBy: [
          { student: { studentNumber: 'asc' } },
          { createdAt: 'desc' },
        ],
      });

      // Gather session data for each submission
      const sessionIds = submissions
        .map((s) => s.sessionId)
        .filter((id): id is string => Boolean(id));

      const sessionsById = new Map();
      if (sessionIds.length > 0) {
        const sessions = await prisma.experimentSession.findMany({
          where: { id: { in: sessionIds } },
          include: {
            inputs: true,
            calculations: true,
          },
        });
        sessions.forEach((sess) => sessionsById.set(sess.id, sess));
      }

      // Fallback: fetch sessions by experiment & student for submissions without sessionId
      const submissionsWithoutSession = submissions.filter((s) => !s.sessionId);
      if (submissionsWithoutSession.length > 0) {
        for (const sub of submissionsWithoutSession) {
          const sess = await prisma.experimentSession.findFirst({
            where: {
              experimentId: sub.experimentId,
              studentId: sub.studentId,
            },
            include: {
              inputs: true,
              calculations: true,
            },
            orderBy: { startedAt: 'desc' },
          });
          if (sess) {
            sessionsById.set(sub.id, sess);
          }
        }
      }

      // Format Class Submissions Rows
      // Columns: Student, Experiment, Raw Input, Intermediate, Formula, Result, Grade, Feedback
      const classRows = [
        [`VirtualLab AKUANALIS - Rekap Kelas: ${classRecord.name} (${classRecord.code})`],
        [`Dosen Pengampu: ${classRecord.instructor?.user?.name || '-'} | Tanggal Ekspor: ${dateStr}`],
        [''],
        [
          'Student',
          'Experiment',
          'Raw Input',
          'Intermediate',
          'Formula',
          'Result',
          'Grade',
          'Feedback',
        ],
      ];

      for (const sub of submissions) {
        const session =
          (sub.sessionId ? sessionsById.get(sub.sessionId) : null) ||
          sessionsById.get(sub.id);

        const studentCol = `${sub.student.user.name} (${sub.student.studentNumber})`;
        const experimentCol = sub.experiment.title;

        // Raw input summary
        const inputs = session?.inputs || [];
        const rawInputCol =
          inputs.length > 0
            ? inputs
                .map(
                  (inp: any) =>
                    `${inp.parameter}: ${inp.value !== null && inp.value !== undefined ? inp.value : inp.textValue ?? '-'}${inp.unit ? ' ' + inp.unit : ''}`
                )
                .join('; ')
            : '-';

        // Intermediate summary
        const calcs = session?.calculations || [];
        const intermediateCol =
          calcs.length > 0
            ? calcs
                .map((c: any) => {
                  if (!c.intermediate) return '-';
                  return typeof c.intermediate === 'object'
                    ? JSON.stringify(c.intermediate)
                    : String(c.intermediate);
                })
                .join('; ')
            : '-';

        // Formula summary
        const formulaCol =
          calcs.length > 0
            ? calcs.map((c: any) => c.formula || '-').join('; ')
            : '-';

        // Result summary
        const resultCol =
          calcs.length > 0
            ? calcs
                .map(
                  (c: any) =>
                    `${c.result !== null && c.result !== undefined ? c.result : '-'}${c.unit ? ' ' + c.unit : ''}`
                )
                .join('; ')
            : '-';

        // Grade summary
        const gradeCol =
          sub.grade?.total !== null && sub.grade?.total !== undefined
            ? Number(sub.grade.total)
            : 'Belum Dinilai';

        // Feedback summary
        const feedbackCol = sub.grade?.feedback || '-';

        classRows.push([
          studentCol,
          experimentCol,
          rawInputCol,
          intermediateCol,
          formulaCol,
          resultCol,
          gradeCol,
          feedbackCol,
        ]);
      }

      const workbook = XLSX.utils.book_new();
      const wsClass = XLSX.utils.aoa_to_sheet(classRows);

      wsClass['!cols'] = [
        { wch: 32 }, // Student
        { wch: 35 }, // Experiment
        { wch: 45 }, // Raw Input
        { wch: 45 }, // Intermediate
        { wch: 35 }, // Formula
        { wch: 20 }, // Result
        { wch: 15 }, // Grade
        { wch: 40 }, // Feedback
      ];

      XLSX.utils.book_append_sheet(workbook, wsClass, 'Rekap Submisi Kelas');

      const safeClassName = classRecord.name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      const filename = `class_${safeClassName}_${dateStr}.xlsx`;

      await logAudit({
        userId: currentUser.id,
        action: 'EXPORT_EXCEL_CLASS',
        entity: 'Class',
        entityId: classRecord.id,
        metadata: { filename, className: classRecord.name, totalSubmissions: submissions.length },
      });

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return apiError(ErrorCodes.INVALID_INPUT, 'Parameter tidak valid', 400);
  } catch (err: any) {
    console.error('Excel Export Error:', err);
    return apiError(ErrorCodes.INTERNAL_ERROR, err.message || 'Gagal mengekspor data Excel', 500);
  }
}

