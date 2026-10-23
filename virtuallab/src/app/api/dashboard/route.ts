import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error || !session) {
      return error || apiError(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { role, id: userId } = session.user;

    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          memberships: {
            include: {
              class: {
                include: {
                  experiments: {
                    include: { module: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!student) {
        return apiSuccess({
          completionPercentage: 0,
          averageGrade: 0,
          experimentCount: 0,
          pendingSubmissions: 0,
          latestFeedback: null,
          activeExperiment: null,
          recentActivity: []
        });
      }

      // Collect all experiments in student's classes
      const allExperiments = student.memberships.flatMap(m => m.class.experiments);
      const experimentCount = allExperiments.length;

      // Student submissions
      const submissions = await prisma.submission.findMany({
        where: { studentId: student.id },
        include: {
          grade: true,
          experiment: {
            include: { module: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Graded submissions
      const graded = submissions.filter(s => s.grade && s.grade.total !== null);
      const totalScore = graded.reduce((acc, s) => acc + Number(s.grade!.total), 0);
      const averageGrade = graded.length > 0 ? Math.round((totalScore / graded.length) * 10) / 10 : 0;

      // Completed experiments (graded or submitted)
      const completedSubmissions = submissions.filter(s => s.status === 'GRADED' || s.status === 'SUBMITTED');
      const completionPercentage = experimentCount > 0 
        ? Math.min(100, Math.round((completedSubmissions.length / experimentCount) * 100))
        : 0;

      // Pending submissions (submitted but not yet graded)
      const pendingSubmissions = submissions.filter(s => (s.status as string) === 'SUBMITTED' || (s.status as string) === 'READY_TO_SUBMIT').length;

      // Latest feedback
      const submissionWithFeedback = submissions.find(s => s.grade && s.grade.feedback && s.grade.feedback.trim() !== '');
      const latestFeedback = submissionWithFeedback ? {
        text: submissionWithFeedback.grade!.feedback!,
        experimentName: submissionWithFeedback.experiment?.title || 'Praktikum',
        score: Number(submissionWithFeedback.grade!.total),
        date: submissionWithFeedback.grade!.updatedAt.toISOString()
      } : null;

      // Active experiment (in progress session or first unfinished experiment)
      const activeSession = await prisma.experimentSession.findFirst({
        where: { studentId: student.id, status: 'IN_PROGRESS' },
        include: { experiment: { include: { module: true } } },
        orderBy: { updatedAt: 'desc' }
      });

      let activeExperiment = null;
      if (activeSession && activeSession.experiment) {
        activeExperiment = {
          id: activeSession.experiment.id,
          title: activeSession.experiment.title,
          moduleName: activeSession.experiment.module?.name || 'Praktikum Laboratorium',
          category: activeSession.experiment.module?.category || 'Kimia Terapan',
          progress: 60,
          deadline: activeSession.experiment.deadline ? activeSession.experiment.deadline.toISOString() : null
        };
      } else if (allExperiments.length > 0) {
        const submittedExpIds = new Set(submissions.map(s => s.experimentId));
        const nextExperiment = allExperiments.find(e => !submittedExpIds.has(e.id)) || allExperiments[0];
        activeExperiment = {
          id: nextExperiment.id,
          title: nextExperiment.title,
          moduleName: nextExperiment.module?.name || 'Praktikum Laboratorium',
          category: nextExperiment.module?.category || 'Kimia Terapan',
          progress: 25,
          deadline: nextExperiment.deadline ? nextExperiment.deadline.toISOString() : null
        };
      }

      // Recent activity
      const recentActivity: any[] = [];
      submissions.slice(0, 5).forEach(sub => {
        if (sub.grade) {
          recentActivity.push({
            id: `grade-${sub.id}`,
            type: 'grade',
            title: `Nilai diberikan: ${sub.experiment?.title || 'Praktikum'}`,
            description: `Mendapatkan nilai ${Number(sub.grade.total)}/100`,
            timestamp: sub.grade.updatedAt.toISOString()
          });
        }
        if (sub.submittedAt) {
          recentActivity.push({
            id: `sub-${sub.id}`,
            type: 'submission',
            title: `Mengumpulkan: ${sub.experiment?.title || 'Praktikum'}`,
            description: `Status: ${sub.status}`,
            timestamp: sub.submittedAt.toISOString()
          });
        }
      });

      // Sort recent activity by timestamp desc
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return apiSuccess({
        completionPercentage,
        averageGrade,
        experimentCount,
        pendingSubmissions,
        latestFeedback,
        activeExperiment,
        recentActivity: recentActivity.slice(0, 5)
      });
    }

    if (role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId },
        include: {
          classes: {
            include: {
              members: true,
              experiments: {
                include: {
                  module: true,
                  submissions: {
                    include: {
                      grade: true,
                      student: { include: { user: true } }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!instructor) {
        return apiSuccess({
          totalStudents: 0,
          activeClasses: 0,
          averageGrade: 0,
          submissionRate: 0,
          completionRate: 0,
          highestPerformingExperiment: null,
          lowestPerformingExperiment: null,
          recentSubmissions: []
        });
      }

      const activeClasses = instructor.classes.length;

      // Collect unique student IDs across classes
      const studentIdSet = new Set<string>();
      instructor.classes.forEach(c => c.members.forEach(m => studentIdSet.add(m.studentId)));
      const totalStudents = studentIdSet.size;

      // Collect all submissions
      const allSubmissions: any[] = [];
      const experimentPerformance: { id: string; title: string; scores: number[]; count: number }[] = [];

      instructor.classes.forEach(c => {
        c.experiments.forEach(e => {
          const expScores: number[] = [];
          e.submissions.forEach(s => {
            allSubmissions.push({
              id: s.id,
              studentName: s.student?.user?.name || 'Mahasiswa',
              studentNumber: s.student?.studentNumber || '',
              experimentTitle: e.title,
              experimentId: e.id,
              className: c.name,
              status: s.status,
              submittedAt: s.submittedAt ? s.submittedAt.toISOString() : s.updatedAt.toISOString(),
              grade: s.grade?.total ? Number(s.grade.total) : null
            });
            if (s.grade?.total !== null && s.grade?.total !== undefined) {
              expScores.push(Number(s.grade.total));
            }
          });

          if (expScores.length > 0) {
            experimentPerformance.push({
              id: e.id,
              title: e.title,
              scores: expScores,
              count: expScores.length
            });
          }
        });
      });

      // Graded submissions calculation
      const gradedScores = allSubmissions.filter(s => s.grade !== null).map(s => s.grade);
      const averageGrade = gradedScores.length > 0 
        ? Math.round((gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length) * 10) / 10 
        : 0;

      // Total expected submissions = sum(class.members.length * class.experiments.length)
      let totalExpected = 0;
      instructor.classes.forEach(c => {
        totalExpected += c.members.length * c.experiments.length;
      });

      const submissionRate = totalExpected > 0 
        ? Math.min(100, Math.round((allSubmissions.length / totalExpected) * 100))
        : (allSubmissions.length > 0 ? 100 : 0);

      const completedCount = allSubmissions.filter(s => s.status === 'GRADED' || s.grade !== null).length;
      const completionRate = totalExpected > 0 
        ? Math.min(100, Math.round((completedCount / totalExpected) * 100))
        : (completedCount > 0 ? 100 : 0);

      // Highest / lowest performing experiments
      let highestPerformingExperiment = null;
      let lowestPerformingExperiment = null;

      if (experimentPerformance.length > 0) {
        const perfWithAvg = experimentPerformance.map(p => ({
          id: p.id,
          title: p.title,
          count: p.count,
          averageGrade: Math.round((p.scores.reduce((a, b) => a + b, 0) / p.scores.length) * 10) / 10
        }));

        perfWithAvg.sort((a, b) => b.averageGrade - a.averageGrade);
        highestPerformingExperiment = perfWithAvg[0];
        lowestPerformingExperiment = perfWithAvg[perfWithAvg.length - 1];
      }

      // Sort recent submissions desc
      allSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      return apiSuccess({
        totalStudents,
        activeClasses,
        averageGrade,
        submissionRate,
        completionRate,
        highestPerformingExperiment,
        lowestPerformingExperiment,
        recentSubmissions: allSubmissions.slice(0, 10)
      });
    }

    if (role === 'ADMIN') {
      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        totalClasses,
        totalExperiments,
        allSubmissionsList
      ] = await Promise.all([
        prisma.user.count(),
        prisma.student.count(),
        prisma.instructor.count(),
        prisma.class.count(),
        prisma.experiment.count(),
        prisma.submission.findMany({
          include: {
            grade: true,
            student: { include: { user: true } },
            experiment: { include: { class: true } }
          },
          orderBy: { updatedAt: 'desc' },
          take: 20
        })
      ]);

      const allGrades = await prisma.grade.findMany({
        select: { total: true }
      });

      const averageGrade = allGrades.length > 0 
        ? Math.round((allGrades.reduce((acc, g) => acc + Number(g.total), 0) / allGrades.length) * 10) / 10 
        : 0;

      // Calculate actual experiment performance for admin
      const totalSubs = await prisma.submission.count();
      const gradedCount = allGrades.length;
      const completionRate = totalSubs > 0 ? Math.round((gradedCount / totalSubs) * 100) : 0;

      // Calculate total expected submissions
      const classesWithMembers = await prisma.class.findMany({
        include: { members: true, experiments: true },
      });
      let totalExpected = 0;
      classesWithMembers.forEach((c) => {
        totalExpected += c.members.length * c.experiments.length;
      });

      // Recent submissions format
      const recentSubmissions = allSubmissionsList.slice(0, 10).map(s => ({
        id: s.id,
        studentName: s.student?.user?.name || 'Mahasiswa',
        studentNumber: s.student?.studentNumber || '',
        experimentTitle: s.experiment?.title || 'Praktikum',
        experimentId: s.experimentId,
        className: s.experiment?.class?.name || '-',
        status: s.status,
        submittedAt: s.submittedAt ? s.submittedAt.toISOString() : s.updatedAt.toISOString(),
        grade: s.grade?.total ? Number(s.grade.total) : null
      }));

      const allExperiments = await prisma.experiment.findMany({
        include: {
          submissions: {
            include: { grade: true },
          },
        },
      });

      const experimentPerf = allExperiments
        .map((exp) => {
          const scores = exp.submissions
            .filter((s) => s.grade?.total !== null && s.grade?.total !== undefined)
            .map((s) => Number(s.grade!.total));
          const avg =
            scores.length > 0
              ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
              : null;
          return { id: exp.id, title: exp.title, averageGrade: avg, count: scores.length };
        })
        .filter((p) => p.averageGrade !== null && p.count > 0);

      experimentPerf.sort((a, b) => (b.averageGrade ?? 0) - (a.averageGrade ?? 0));

      const highestPerformingExperiment = experimentPerf.length > 0 ? experimentPerf[0] : null;
      const lowestPerformingExperiment =
        experimentPerf.length > 0 ? experimentPerf[experimentPerf.length - 1] : null;

      return apiSuccess({
        totalUsers,
        totalStudents,
        totalInstructors,
        totalClasses,
        totalExperiments,
        totalSubmissions: totalSubs,
        systemAverageGrade: averageGrade,
        averageGrade,
        activeClasses: totalClasses,
        completionRate,
        submissionRate: totalExpected > 0
          ? Math.min(100, Math.round((totalSubs / totalExpected) * 100))
          : (totalSubs > 0 ? 100 : 0),
        highestPerformingExperiment,
        lowestPerformingExperiment,
        recentSubmissions
      });
    }

    return apiError(ErrorCodes.FORBIDDEN, 'Invalid role', 403);
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Internal server error', 500);
  }
}
