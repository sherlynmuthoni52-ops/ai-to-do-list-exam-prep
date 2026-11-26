import { Download, Printer, RotateCcw, Shuffle } from 'lucide-react';
import {
  ACADEMIC_PROFILE,
  DAILY_STUDY_RULES,
  EXAM_DAY_CHECKLIST,
  UNIT_STUDY_METHODS,
} from '../data/initialExams';
import { BlockCategory, Exam } from '../types/exam';
import {
  formatLongDate,
  formatShortDate,
  formatTimeRange,
  sortExamsChronologically,
} from '../utils/dateUtils';
import { buildFullPrepPlan, summarizeDayEvents } from '../utils/scheduleGenerator';

interface PdfPlanPreviewProps {
  exams: Exam[];
  includeClasses: boolean;
  dailyMainGoals: Record<string, string>;
  onDownloadPdf: () => void;
  onSpreadExams: () => void;
  onResetOfficial: () => void;
}

function getPreviewRowTint(category: BlockCategory): string {
  switch (category) {
    case 'class':
      return 'bg-sky-50/90 dark:bg-sky-950/35 text-sky-950 dark:text-sky-100';
    case 'exam':
      return 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 font-semibold';
    case 'review':
      return 'bg-amber-50/90 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100';
    case 'freetime':
      return 'bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100';
    default:
      return 'text-slate-700 dark:text-slate-300';
  }
}

export function PdfPlanPreview({
  exams,
  includeClasses,
  dailyMainGoals,
  onDownloadPdf,
  onSpreadExams,
  onResetOfficial,
}: PdfPlanPreviewProps) {
  const sorted = sortExamsChronologically(exams);
  const fullPlan = buildFullPrepPlan(sorted, includeClasses);

  const totalTasks = sorted.reduce((acc, e) => acc + e.tasks.length, 0);
  const completedTasks = sorted.reduce(
    (acc, e) => acc + e.tasks.filter((t) => t.completed).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="no-print rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            PDF Study Plan &amp; Schedule Builder
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Includes AIU header, all-days overview grid, colour-coded 7:00 AM – 11:00 PM schedules, and study rules checklist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSpreadExams}
            title="Space all exams across separate days starting Dec 7"
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Spread Exams Across Days</span>
          </button>

          <button
            type="button"
            onClick={onResetOfficial}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Official Dates</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Document Sheet Preview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-5 sm:p-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Final Exam Study Plan
          </h3>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
            {ACADEMIC_PROFILE.program} · {ACADEMIC_PROFILE.goal}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            {sorted.length} Exam Units · {completedTasks}/{totalTasks} Study Tasks Completed · {fullPlan.length} Days ({fullPlan[0] ? formatShortDate(fullPlan[0].date) : ''} – {fullPlan[fullPlan.length - 1] ? formatShortDate(fullPlan[fullPlan.length - 1].date) : ''})
          </p>
        </div>

        {/* Section 1: Exam Timetable */}
        <div>
          <h4 className="text-base font-semibold text-teal-800 dark:text-teal-300 mb-3">
            1. Examination Timetable
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">Code</th>
                  <th className="py-2.5 pr-4 font-semibold">Unit</th>
                  <th className="py-2.5 pr-4 font-semibold">Date</th>
                  <th className="py-2.5 pr-4 font-semibold">Time</th>
                  <th className="py-2.5 pr-4 font-semibold">Study Hrs</th>
                  <th className="py-2.5 pr-4 font-semibold">Venue</th>
                  <th className="py-2.5 font-semibold">Invigilator / Chief</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((exam) => (
                  <tr key={exam.id} className="align-top">
                    <td className="py-3 pr-4 font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {exam.code}
                    </td>
                    <td className="py-3 pr-4 text-slate-800 dark:text-slate-200 min-w-[190px]">
                      {exam.title}
                    </td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {formatShortDate(exam.date)}
                    </td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 font-mono tabular-nums whitespace-nowrap">
                      {formatTimeRange(exam.startTime, exam.endTime)}
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {exam.studyHoursTarget ? `${exam.studyHoursTarget} h` : '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {exam.venue || 'TBA'}
                    </td>
                    <td className="py-3 text-xs text-slate-600 dark:text-slate-400 min-w-[160px]">
                      <div>{exam.invigilator || 'TBA'}</div>
                      <div className="text-slate-400 dark:text-slate-500">
                        Chief: {exam.chiefInvigilator || 'TBA'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Overview All Days at a Glance */}
        <div>
          <h4 className="text-base font-semibold text-teal-800 dark:text-teal-300 mb-3">
            2. Overview: All {fullPlan.length} Days at a Glance
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Phase</th>
                  <th className="py-2 font-semibold">Units Studied / Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fullPlan.map((day) => {
                  const isExamDay = day.examsOnDay.length > 0;
                  return (
                    <tr
                      key={day.date}
                      className={
                        isExamDay
                          ? 'bg-rose-50/85 dark:bg-rose-950/35 font-medium'
                          : ''
                      }
                    >
                      <td className="py-2 pr-4 font-mono text-xs tabular-nums text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatShortDate(day.date)}
                      </td>
                      <td className="py-2 pr-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {day.phase}
                      </td>
                      <td className="py-2 text-xs text-slate-800 dark:text-slate-200">
                        {summarizeDayEvents(day)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Daily 7am - 11pm Colour-Coded Preview */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-base font-semibold text-teal-800 dark:text-teal-300">
              3. Daily 7:00 AM – 11:00 PM Schedule ({fullPlan.length} Days)
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              <span>Blue: Classes</span>
              <span>Red: Exams</span>
              <span>Yellow: Daily Review</span>
              <span>Green: Free Time</span>
            </div>
          </div>

          <div className="space-y-4">
            {fullPlan.map((day) => {
              const isExamDay = day.examsOnDay.length > 0;
              const goalText = dailyMainGoals[day.date];
              return (
                <div
                  key={day.date}
                  className={`rounded-xl border p-4 ${
                    isExamDay
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/25 dark:bg-rose-950/15'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {formatLongDate(day.date)} · {day.phase}
                    </span>
                    {isExamDay && (
                      <span className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-300">
                        Exam Day · {day.examsOnDay.map((e) => e.code).join(', ')}
                      </span>
                    )}
                  </div>
                  {goalText && (
                    <div className="text-xs font-medium text-teal-800 dark:text-teal-300 mb-2">
                      Main Goal: {goalText}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                    {day.blocks.map((block) => (
                      <div
                        key={block.id}
                        className={`flex items-baseline gap-2.5 px-2.5 py-1.5 rounded-lg ${getPreviewRowTint(block.category)}`}
                      >
                        <span className="font-mono tabular-nums opacity-80 shrink-0 w-[124px]">
                          {formatTimeRange(block.startTime, block.endTime)}
                        </span>
                        <span className="truncate">{block.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Study Methods, Daily Rules & Exam-Day Checklist */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <h4 className="text-base font-semibold text-teal-800 dark:text-teal-300">
            4. Study Methods That Work, Daily Rules &amp; Exam-Day Checklist
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                How to study each unit
              </h5>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {UNIT_STUDY_METHODS.map((item) => (
                  <li key={item.code} className="leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.code}:{' '}
                    </span>
                    {item.method}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Daily rules
                </h5>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {DAILY_STUDY_RULES.map((rule) => (
                    <li key={rule} className="leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Exam-day checklist
                </h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {EXAM_DAY_CHECKLIST.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
