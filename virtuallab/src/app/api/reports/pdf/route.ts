import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { apiError, ErrorCodes } from '@/lib/api-response';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';

/**
 * GET /api/reports/pdf?submissionId=xxx
 * Feature #62: Full Student Report Generation
 * Feature #63: PDF Report with proper filename
 *
 * Generates a comprehensive PDF report with all required sections:
 * Identity, Experiment, Objective, Theory, Materials, Procedure,
 * Raw Data, Calculation, Formula, Intermediate Result, Final Result,
 * Graph, Conclusion, Student Signature, Instructor Feedback, Grade
 */
export async function GET(req: NextRequest) {
  try {
    const { session, error: authError } = await requireAuth();
    if (authError || !session?.user) {
      return authError || apiError(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return apiError(ErrorCodes.INVALID_INPUT, 'Parameter submissionId diperlukan', 400);
    }

    // Fetch full submission data with all relations
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          include: { user: true },
        },
        experiment: {
          include: {
            module: true,
            class: {
              include: {
                instructor: {
                  include: { user: true },
                },
              },
            },
          },
        },
        grade: true,
      },
    });

    if (!submission) {
      return apiError(ErrorCodes.NOT_FOUND, 'Submission tidak ditemukan', 404);
    }

    // Authorization check
    const currentUser = session.user;
    if (currentUser.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
      });
      if (!student || submission.studentId !== student.id) {
        return apiError(ErrorCodes.FORBIDDEN, 'Akses ditolak', 403);
      }
    } else if (currentUser.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!instructor || submission.experiment.class.instructorId !== instructor.id) {
        return apiError(ErrorCodes.FORBIDDEN, 'Akses ditolak', 403);
      }
    }

    // Fetch session data
    let sessionData = null;
    if (submission.sessionId) {
      sessionData = await prisma.experimentSession.findUnique({
        where: { id: submission.sessionId },
        include: { inputs: true, calculations: true },
      });
    }
    if (!sessionData) {
      sessionData = await prisma.experimentSession.findFirst({
        where: {
          experimentId: submission.experimentId,
          studentId: submission.studentId,
        },
        include: { inputs: true, calculations: true },
        orderBy: { startedAt: 'desc' },
      });
    }

    const module = submission.experiment.module;
    const student = submission.student;
    const grade = submission.grade;
    const studentName = student.user.name;
    const studentNumber = student.studentNumber || '00000000';
    const className = submission.experiment.class.name;
    const experimentTitle = submission.experiment.title;
    const instructorName = submission.experiment.class.instructor?.user?.name || '-';
    const submissionDate = submission.submittedAt
      ? new Date(submission.submittedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Create PDF
    const doc = new jsPDF();
    let currentY = 0;

    // ============================================================
    // HEADER
    // ============================================================
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('VirtualLab AKUANALIS', 14, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Resmi Praktikum Kimia Analisis Terpadu', 14, 22);

    // ============================================================
    // SECTION 1: IDENTITY
    // ============================================================
    doc.setTextColor(30, 41, 59);
    currentY = 38;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTITAS MAHASISWA', 14, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, fillColor: [241, 245, 249] } },
      body: [
        ['Nama', studentName],
        ['NIM (Nomor Induk Mahasiswa)', studentNumber],
        ['Kelas', className],
        ['Mata Kuliah', submission.experiment.class.course || '-'],
        ['Semester / Tahun Ajaran', `${submission.experiment.class.semester || '-'} / ${submission.experiment.class.academicYear || '-'}`],
        ['Dosen Pengampu', instructorName],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // ============================================================
    // SECTION 2: EXPERIMENT
    // ============================================================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA EKSPERIMEN', 14, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, fillColor: [241, 245, 249] } },
      body: [
        ['Judul Eksperimen', experimentTitle],
        ['Modul Praktikum', module?.name || '-'],
        ['Kategori', module?.category || '-'],
        ['Tanggal Pelaksanaan', submissionDate],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // ============================================================
    // SECTION 3: OBJECTIVE
    // ============================================================
    const checkNewPage = (needed: number) => {
      if (currentY + needed > 270) {
        doc.addPage();
        currentY = 20;
      }
    };

    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TUJUAN PERCOBAAN', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const objectiveText = module?.description || submission.experiment.description || 'Tujuan percobaan tidak tercantum.';
    const splitObjective = doc.splitTextToSize(objectiveText, 182);
    doc.text(splitObjective, 14, currentY);
    currentY += splitObjective.length * 4.5 + 6;

    // ============================================================
    // SECTION 4: THEORY
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DASAR TEORI', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const theoryText = module?.theory || 'Dasar teori tidak tersedia dalam modul ini.';
    const cleanTheory = theoryText.length > 1500 ? theoryText.substring(0, 1500) + '...' : theoryText;
    const splitTheory = doc.splitTextToSize(cleanTheory, 182);
    doc.text(splitTheory, 14, currentY);
    currentY += splitTheory.length * 4.5 + 6;

    // ============================================================
    // SECTION 5: MATERIALS
    // ============================================================
    checkNewPage(25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ALAT DAN BAHAN', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const materialsText = 'Alat dan bahan sesuai dengan modul ' + (module?.name || 'praktikum') + '.';
    const splitMaterials = doc.splitTextToSize(materialsText, 182);
    doc.text(splitMaterials, 14, currentY);
    currentY += splitMaterials.length * 4.5 + 6;

    // ============================================================
    // SECTION 6: PROCEDURE
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROSEDUR PERCOBAAN', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const procedureText = module?.procedure || submission.experiment.instructions || 'Prosedur percobaan tidak tercantum.';
    const cleanProcedure = procedureText.length > 1500 ? procedureText.substring(0, 1500) + '...' : procedureText;
    const splitProcedure = doc.splitTextToSize(cleanProcedure, 182);
    doc.text(splitProcedure, 14, currentY);
    currentY += splitProcedure.length * 4.5 + 6;

    // ============================================================
    // SECTION 7: RAW DATA
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA PENGAMATAN (RAW DATA)', 14, currentY);
    currentY += 2;

    const inputs = sessionData?.inputs || [];
    const inputRows = inputs.map((inp, idx) => [
      String(idx + 1),
      inp.parameter,
      inp.value !== null && inp.value !== undefined ? String(Number(inp.value)) : (inp.textValue || '-'),
      inp.unit || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['No', 'Parameter', 'Nilai', 'Satuan']],
      body: inputRows.length > 0 ? inputRows : [['1', 'Tidak ada data pengamatan', '-', '-']],
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 12 }, 3: { cellWidth: 20 } },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // ============================================================
    // SECTION 8: CALCULATION (with Formula)
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERHITUNGAN', 14, currentY);
    currentY += 2;

    const calculations = sessionData?.calculations || [];

    // ============================================================
    // SECTION 9: FORMULA
    // ============================================================
    if (calculations.length > 0) {
      const formulaRows = calculations.map((calc, idx) => [
        String(idx + 1),
        calc.calculationId || `CALC-${idx + 1}`,
        calc.formula || '-',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['No', 'ID Perhitungan', 'Rumus / Formula']],
        body: formulaRows,
        headStyles: { fillColor: [71, 85, 105], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 35 } },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Belum ada data perhitungan.', 14, currentY + 5);
      currentY += 12;
    }

    // ============================================================
    // SECTION 10: INTERMEDIATE RESULT
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HASIL ANTARA (INTERMEDIATE RESULT)', 14, currentY);
    currentY += 2;

    if (calculations.length > 0) {
      const intermediateRows = calculations
        .filter(calc => calc.intermediate)
        .map((calc, idx) => {
          let intermediateText = '';
          if (typeof calc.intermediate === 'object') {
            intermediateText = JSON.stringify(calc.intermediate, null, 0);
          } else {
            intermediateText = String(calc.intermediate);
          }
          return [
            String(idx + 1),
            calc.calculationId || `CALC-${idx + 1}`,
            intermediateText.length > 80 ? intermediateText.substring(0, 80) + '...' : intermediateText,
          ];
        });

      if (intermediateRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['No', 'ID Perhitungan', 'Nilai Antara']],
          body: intermediateRows,
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          styles: { fontSize: 8, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 35 } },
        });
        currentY = (doc as any).lastAutoTable.finalY + 6;
      } else {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Tidak ada data hasil antara.', 14, currentY + 5);
        currentY += 12;
      }
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Tidak ada data hasil antara.', 14, currentY + 5);
      currentY += 12;
    }

    // ============================================================
    // SECTION 11: FINAL RESULT
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HASIL AKHIR (FINAL RESULT)', 14, currentY);
    currentY += 2;

    if (calculations.length > 0) {
      const resultRows = calculations.map((calc, idx) => [
        String(idx + 1),
        calc.calculationId || calc.formula || `CALC-${idx + 1}`,
        calc.result !== null && calc.result !== undefined ? Number(calc.result).toFixed(4) : '-',
        calc.unit || '-',
        calc.status || 'SUCCESS',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Parameter', 'Hasil', 'Satuan', 'Status']],
        body: resultRows,
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 12 }, 4: { cellWidth: 20 } },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Belum ada hasil akhir perhitungan.', 14, currentY + 5);
      currentY += 12;
    }

    // ============================================================
    // SECTION 12: GRAPH
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAFIK', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Grafik analisis disajikan dalam platform VirtualLab AKUANALIS secara interaktif.', 14, currentY);
    currentY += 5;
    doc.text('Untuk visualisasi grafik lengkap, silakan akses halaman analitik pada aplikasi.', 14, currentY);
    currentY += 10;

    // ============================================================
    // SECTION 13: CONCLUSION
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KESIMPULAN', 14, currentY);
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const conclusionText = 'Berdasarkan hasil percobaan yang telah dilakukan, '
      + 'data analisis telah diperoleh sesuai dengan prosedur yang ditetapkan dalam modul '
      + (module?.name || 'praktikum') + '.';
    const splitConclusion = doc.splitTextToSize(conclusionText, 182);
    doc.text(splitConclusion, 14, currentY);
    currentY += splitConclusion.length * 4.5 + 8;

    // ============================================================
    // SECTION 14: STUDENT SIGNATURE
    // ============================================================
    checkNewPage(50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TANDA TANGAN', 14, currentY);
    currentY += 8;

    // Student signature (left)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Praktikan,', 35, currentY);
    doc.text('Dosen Pengampu,', 140, currentY);
    currentY += 25;

    doc.setFont('helvetica', 'bold');
    doc.line(15, currentY, 75, currentY);
    doc.line(120, currentY, 185, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.text(studentName, 45, currentY, { align: 'center' });
    doc.text(instructorName, 152, currentY, { align: 'center' });
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`NIM: ${studentNumber}`, 45, currentY, { align: 'center' });
    currentY += 4;
    doc.text(`Tanggal: ${submissionDate}`, 45, currentY, { align: 'center' });
    currentY += 10;

    // ============================================================
    // SECTION 15: INSTRUCTOR FEEDBACK
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('UMPAN BALIK DOSEN', 14, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const feedbackText = grade?.feedback || 'Belum ada umpan balik dari dosen pengampu.';
    const splitFeedback = doc.splitTextToSize(feedbackText, 182);
    doc.text(splitFeedback, 14, currentY);
    currentY += splitFeedback.length * 4.5 + 6;

    // ============================================================
    // SECTION 16: GRADE
    // ============================================================
    checkNewPage(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NILAI / PENILAIAN', 14, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55, fillColor: [241, 245, 249] },
        1: { cellWidth: 30, halign: 'center' as const },
      },
      body: [
        ['Pre-Test', grade?.preTest !== null && grade?.preTest !== undefined ? String(Number(grade.preTest)) : '-'],
        ['Praktikum', grade?.practical !== null && grade?.practical !== undefined ? String(Number(grade.practical)) : '-'],
        ['Perhitungan', grade?.calculation !== null && grade?.calculation !== undefined ? String(Number(grade.calculation)) : '-'],
        ['Laporan', grade?.report !== null && grade?.report !== undefined ? String(Number(grade.report)) : '-'],
        ['Post-Test', grade?.postTest !== null && grade?.postTest !== undefined ? String(Number(grade.postTest)) : '-'],
        ['TOTAL', grade?.total !== null && grade?.total !== undefined ? String(Number(grade.total)) : 'Belum Dinilai'],
      ],
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `VirtualLab AKUANALIS — Laporan digenerate otomatis pada ${new Date().toLocaleDateString('id-ID')}`,
        14,
        290
      );
      doc.text(`Halaman ${i} / ${pageCount}`, 196, 290, { align: 'right' });
    }

    // Feature #63: Proper filename format
    const experimentSlug = module?.slug
      || experimentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${studentNumber}_${experimentSlug}_${submissionDate}.pdf`;

    // Audit log
    await logAudit({
      userId: currentUser.id,
      action: AuditAction.EXPORT_REPORT,
      entity: AuditEntity.REPORT,
      entityId: submission.id,
      metadata: { filename, format: 'PDF', experimentSlug, studentNumber },
    });

    const pdfArrayBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF Report Generation Error:', error);
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Gagal menggenerate laporan PDF', 500);
  }
}

/**
 * POST /api/reports/pdf
 * Legacy endpoint - backward compatible with existing code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = 'Praktikum Kimia Analisis',
      moduleName = 'Modul Praktikum',
      studentName = 'Mahasiswa',
      studentNumber = '-',
      className = '-',
      inputs = {},
      results = null,
      steps = [],
      conclusion = '',
      feedback = '',
      grade = null,
      date = new Date().toLocaleDateString('id-ID'),
    } = body;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 64, 175); // Blue 800
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('VirtualLab AKUANALIS', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Laporan Resmi Praktikum Kimia Analisis Terpadu', 14, 20);

    // Identity Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 38);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    autoTable(doc, {
      startY: 42,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } },
      body: [
        ['Modul Praktikum', `: ${moduleName}`],
        ['Nama Mahasiswa', `: ${studentName}`],
        ['NIM / ID', `: ${studentNumber}`],
        ['Kelas', `: ${className}`],
        ['Tanggal Selesai', `: ${date}`],
      ],
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // 1. Data Input (Raw Data)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Data Pengamatan / Input Simulasi', 14, currentY);

    const inputRows = Object.entries(inputs).map(([key, val]) => [
      key,
      String(val),
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Parameter', 'Nilai']],
      body: inputRows.length > 0 ? inputRows : [['Tidak ada input', '-']],
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      styles: { fontSize: 9 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 2. Hasil Perhitungan (Calculation + Formula + Results)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Langkah & Hasil Perhitungan', 14, currentY);

    const stepRows = Array.isArray(steps) && steps.length > 0
      ? steps.map((s: any, idx: number) => [
          String(idx + 1),
          s.name || s.id || `Langkah ${idx + 1}`,
          s.formulaDisplay || s.formula || '-',
          s.result != null ? `${Number(s.result).toFixed(4)} ${s.unit || ''}` : '-',
        ])
      : [];

    if (stepRows.length > 0) {
      autoTable(doc, {
        startY: currentY + 3,
        head: [['No', 'Deskripsi Langkah', 'Formula / Substitusi', 'Hasil']],
        body: stepRows,
        headStyles: { fillColor: [71, 85, 105], textColor: 255 },
        styles: { fontSize: 8 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;
    } else if (results) {
      const resultRows = Object.entries(results).map(([k, v]: [string, any]) => [
        k,
        typeof v === 'object' && v !== null ? `${v.value ?? ''} ${v.unit ?? ''}` : String(v),
      ]);
      autoTable(doc, {
        startY: currentY + 3,
        head: [['Parameter', 'Hasil']],
        body: resultRows,
        headStyles: { fillColor: [71, 85, 105], textColor: 255 },
        styles: { fontSize: 9 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // 3. Kesimpulan
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Kesimpulan Praktikan', 14, currentY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const conclusionText = conclusion || 'Tidak ada kesimpulan yang dicantumkan.';
    const splitConclusion = doc.splitTextToSize(conclusionText, 180);
    doc.text(splitConclusion, 14, currentY + 6);
    currentY = currentY + 6 + splitConclusion.length * 4.5 + 6;

    // 4. Instructor Feedback
    if (feedback) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Umpan Balik Dosen', 14, currentY);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const splitFeedback = doc.splitTextToSize(feedback, 180);
      doc.text(splitFeedback, 14, currentY + 6);
      currentY = currentY + 6 + splitFeedback.length * 4.5 + 6;
    }

    // 5. Grade
    if (grade !== null && grade !== undefined) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Nilai', 14, currentY);
      currentY += 6;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Skor: ${grade}`, 14, currentY);
      currentY += 10;
    }

    // 6. Signature
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Praktikan,', 35, currentY);
    currentY += 20;
    doc.line(15, currentY, 75, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(studentName, 45, currentY, { align: 'center' });
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`NIM: ${studentNumber}`, 45, currentY, { align: 'center' });

    // Filename for POST (Feature #63)
    const experimentSlug = (moduleName || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const dateSlug = new Date().toISOString().split('T')[0];
    const filename = `${studentNumber}_${experimentSlug}_${dateSlug}.pdf`;

    const pdfArrayBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
