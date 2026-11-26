import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ACADEMIC_PROFILE,
  DAILY_STUDY_RULES,
  EXAM_DAY_CHECKLIST,
  UNIT_STUDY_METHODS,
} from '../data/initialExams';
import { BlockCategory, DaySchedule, Exam } from '../types/exam';
import {
  formatLongDate,
  formatShortDate,
  formatTimeRange,
  getTodayKey,
  sortExamsChronologically,
} from './dateUtils';
import { buildFullPrepPlan, summarizeDayEvents } from './scheduleGenerator';

const CLASS_ROW_RGB: [number, number, number] = [219, 234, 254];
const EXAM_ROW_RGB: [number, number, number] = [254, 226, 226];
const REVIEW_ROW_RGB: [number, number, number] = [254, 249, 195];
const FREETIME_ROW_RGB: [number, number, number] = [220, 252, 231];

const PDF_ROW_COLORS: Partial<Record<BlockCategory, [number, number, number]>> = {
  class: CLASS_ROW_RGB,
  exam: EXAM_ROW_RGB,
  review: REVIEW_ROW_RGB,
  freetime: FREETIME_ROW_RGB,
};

export function exportStudyPlanPdf(
  exams: Exam[],
  includeClasses = true,
  dailyMainGoals: Record<string, string> = {}
): void {
  const sortedExams = sortExamsChronologically(exams);
  const schedule: DaySchedule[] = buildFullPrepPlan(sortedExams, includeClasses);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const startLabel = schedule[0]
    ? formatShortDate(schedule[0].date)
    : formatShortDate(getTodayKey());
  const endLabel = schedule[schedule.length - 1]
    ? formatShortDate(schedule[schedule.length - 1].date)
    : startLabel;

  let cursorY = 46;

  // Page 1 Header (AIU Program + Goal)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('Final Exam Study Plan', margin, cursorY);

  cursorY += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${startLabel} – ${endLabel}  |  ${ACADEMIC_PROFILE.program}`,
    margin,
    cursorY
  );

  cursorY += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(ACADEMIC_PROFILE.goal, margin, cursorY);

  cursorY += 12;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.75);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);

  // Section 1: Examination Timetable
  cursorY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text('1. Examination Timetable', margin, cursorY);

  autoTable(doc, {
    startY: cursorY + 8,
    margin: { left: margin, right: margin },
    head: [['Code', 'Unit Title', 'Date', 'Time', 'Study Hrs', 'Venue', 'Invigilator / Chief']],
    body: sortedExams.map((exam) => [
      exam.code,
      exam.title,
      formatShortDate(exam.date),
      formatTimeRange(exam.startTime, exam.endTime),
      exam.studyHoursTarget ? `${exam.studyHoursTarget} h` : '—',
      exam.venue || 'TBA',
      `${exam.invigilator}\nChief: ${exam.chiefInvigilator}`,
    ]),
    styles: {
      fontSize: 8.2,
      cellPadding: 5.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 48 },
      1: { cellWidth: 132 },
      2: { cellWidth: 66 },
      3: { cellWidth: 80 },
      4: { cellWidth: 44, halign: 'right' },
      5: { cellWidth: 38 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 18;

  // Colour Key Legend Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('2. Colour Key & Weekly Classes (Until Fri 4 Dec)', margin, cursorY);

  autoTable(doc, {
    startY: cursorY + 6,
    margin: { left: margin, right: margin },
    body: [
      ['Blue rows = Classes (Mon–Fri until 4 Dec)', 'Red rows = Exams'],
      ['Yellow rows = Daily Review & Light Skim', 'Green rows = Free Time (Piano / Singing / Rest)'],
    ],
    styles: {
      fontSize: 8.5,
      cellPadding: 5,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.5,
    },
    didParseCell: (data) => {
      if (data.row.index === 0 && data.column.index === 0) {
        data.cell.styles.fillColor = CLASS_ROW_RGB;
      } else if (data.row.index === 0 && data.column.index === 1) {
        data.cell.styles.fillColor = EXAM_ROW_RGB;
      } else if (data.row.index === 1 && data.column.index === 0) {
        data.cell.styles.fillColor = REVIEW_ROW_RGB;
      } else if (data.row.index === 1 && data.column.index === 1) {
        data.cell.styles.fillColor = FREETIME_ROW_RGB;
      }
    },
  });

  // Page 2: Overview: All Days at a Glance
  doc.addPage();
  cursorY = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Overview: All ${schedule.length} Days at a Glance`, margin, cursorY);

  autoTable(doc, {
    startY: cursorY + 10,
    margin: { left: margin, right: margin },
    head: [['Date', 'Phase', 'Units Studied / Events']],
    body: schedule.map((day) => [
      formatShortDate(day.date),
      day.phase,
      summarizeDayEvents(day),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 82, fontStyle: 'bold' },
      1: { cellWidth: 145 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const day = schedule[data.row.index];
        if (day?.examsOnDay.length > 0) {
          data.cell.styles.fillColor = EXAM_ROW_RGB;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Unit Study Tasks & Target Due Dates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 20;
  if (cursorY > 680) {
    doc.addPage();
    cursorY = 46;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text('4. Unit Study Tasks & Target Due Dates', margin, cursorY);

  const taskRows: string[][] = [];
  sortedExams.forEach((exam) => {
    if (exam.tasks.length === 0) {
      taskRows.push([exam.code, 'No study tasks added yet', '—', 'Pending']);
    } else {
      exam.tasks.forEach((t) => {
        taskRows.push([
          exam.code,
          t.title,
          formatShortDate(t.dueDate),
          t.completed ? 'Done' : 'Pending',
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: cursorY + 8,
    margin: { left: margin, right: margin },
    head: [['Unit', 'Study Task', 'Target Due Date', 'Status']],
    body: taskRows,
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 52 },
      2: { cellWidth: 82 },
      3: { cellWidth: 52 },
    },
  });

  // Section 5: Day-by-Day 7:00 AM - 11:00 PM Study Timetable
  doc.addPage();
  cursorY = 46;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 118, 110);
  doc.text('5. Daily Study Timetable (7:00 AM – 11:00 PM)', margin, cursorY);

  cursorY += 16;

  schedule.forEach((day) => {
    if (cursorY > 655) {
      doc.addPage();
      cursorY = 46;
    }

    const isExamDay = day.examsOnDay.length > 0;
    const goalText = dailyMainGoals[day.date];
    const headerTitle = isExamDay
      ? `${formatLongDate(day.date)}  —  ${day.phase} (EXAM: ${day.examsOnDay.map((e) => e.code).join(', ')})`
      : `${formatLongDate(day.date)}  —  ${day.phase}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(isExamDay ? 153 : 30, isExamDay ? 27 : 41, isExamDay ? 27 : 59);
    doc.text(headerTitle, margin, cursorY);

    if (goalText) {
      cursorY += 11;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 118, 110);
      doc.text(`Main Goal: ${goalText}`, margin, cursorY);
    }

    autoTable(doc, {
      startY: cursorY + 5,
      margin: { left: margin, right: margin },
      head: [['Time', 'Unit', 'Activity']],
      body: day.blocks.map((b) => [
        formatTimeRange(b.startTime, b.endTime),
        b.examCode || '—',
        b.subtitle ? `${b.title} — ${b.subtitle}` : b.title,
      ]),
      styles: {
        fontSize: 7.7,
        cellPadding: 3.8,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 94, fontStyle: 'bold' },
        1: { cellWidth: 48, fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rowBlock = day.blocks[data.row.index];
          const fill = rowBlock ? PDF_ROW_COLORS[rowBlock.category] : undefined;
          if (fill) {
            data.cell.styles.fillColor = fill;
          }
          if (rowBlock?.category === 'exam' || rowBlock?.category === 'class') {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 16;
  });

  // Final Page: Study Methods That Work, Daily Rules & Exam-Day Checklist
  doc.addPage();
  cursorY = 46;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('6. Study Methods That Work & Rules for the Plan', margin, cursorY);

  cursorY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('How to study each unit', margin, cursorY);
  cursorY += 14;

  UNIT_STUDY_METHODS.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const wrapped = doc.splitTextToSize(`${item.code}: ${item.method}`, pageWidth - margin * 2);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 12 + 4;
  });

  cursorY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('Daily rules', margin, cursorY);
  cursorY += 14;

  DAILY_STUDY_RULES.forEach((rule, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const wrapped = doc.splitTextToSize(`${idx + 1}. ${rule}`, pageWidth - margin * 2);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 12 + 4;
  });

  cursorY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('Exam-day checklist', margin, cursorY);
  cursorY += 14;

  EXAM_DAY_CHECKLIST.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const wrapped = doc.splitTextToSize(`•  ${item}`, pageWidth - margin * 2);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 12 + 3;
  });

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Final Exam Study Plan  |  ${startLabel} – ${endLabel}  |  Bachelor of IT, Africa International University`,
      margin,
      pageHeight - 20
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 20,
      { align: 'right' }
    );
  }

  doc.save('AIU_Final_Exam_Study_Plan_2026.pdf');
}
