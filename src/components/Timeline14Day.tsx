import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { CALM_COLORS } from '../data/initialExams';
import { Exam } from '../types/exam';
import {
  addDays,
  formatShortDate,
  getDayParts,
  getTodayKey,
  sortExamsChronologically,
} from '../utils/dateUtils';

interface Timeline14DayProps {
  exams: Exam[];
  windowStart: string;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onShiftWindow: (newStart: string) => void;
  onOpenDayTimetable: (dateKey: string) => void;
}

export function Timeline14Day({
  exams,
  windowStart,
  selectedDate,
  onSelectDate,
  onShiftWindow,
  onOpenDayTimetable,
}: Timeline14DayProps) {
  const todayKey = getTodayKey();
  const sortedExams = sortExamsChronologically(exams);
  const firstExamDate = sortedExams[0]?.date ?? todayKey;

  const days = Array.from({ length: 14 }, (_, idx) => addDays(windowStart, idx));
  const windowEnd = days[days.length - 1];

  const selectedExams = sortedExams.filter((e) => e.date === selectedDate);
  const dueTasksOnSelected = sortedExams.flatMap((exam) =>
    exam.tasks
      .filter((t) => t.dueDate === selectedDate)
      .map((t) => ({ exam, task: t }))
  );

  return (
    <section
      aria-label="14-day exam timeline"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            14-Day Timeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
            {formatShortDate(windowStart)} – {formatShortDate(windowEnd)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            <button
              type="button"
              onClick={() => onShiftWindow(todayKey)}
              className={`min-h-[40px] px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                windowStart === todayKey
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              From Today
            </button>
            <button
              type="button"
              onClick={() => {
                const target = addDays(firstExamDate, -2);
                onShiftWindow(target);
              }}
              className={`min-h-[40px] px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                windowStart === addDays(firstExamDate, -2)
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Exam Weeks
            </button>
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous 7 days"
              onClick={() => onShiftWindow(addDays(windowStart, -7))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next 7 days"
              onClick={() => onShiftWindow(addDays(windowStart, 7))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 14-day grid: 7 columns on desktop (2 neat weeks), 2-row horizontal or 7/4-col on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
        {days.map((dateKey) => {
          const { weekdayShort, dayNum, monthShort } = getDayParts(dateKey);
          const dayExams = sortedExams.filter((e) => e.date === dateKey);
          const hasExams = dayExams.length > 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const tasksDueCount = sortedExams.reduce(
            (acc, ex) =>
              acc + ex.tasks.filter((t) => t.dueDate === dateKey && !t.completed).length,
            0
          );

          const primaryColor = hasExams ? CALM_COLORS[dayExams[0].color] : null;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`min-h-[82px] flex flex-col justify-between text-left p-2.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                isSelected
                  ? 'border-teal-700 dark:border-teal-400 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-700/30 dark:ring-teal-400/30'
                  : hasExams && primaryColor
                    ? `${primaryColor.softBg} ${primaryColor.border} hover:brightness-98`
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {weekdayShort}
                </span>
                {isToday ? (
                  <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                    Today
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {monthShort}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-1 mt-1">
                <span
                  className={`text-lg font-bold font-mono tabular-nums ${
                    hasExams
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {dayNum}
                </span>
                {tasksDueCount > 0 && !hasExams && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {tasksDueCount} due
                  </span>
                )}
              </div>

              <div className="mt-1.5 min-h-[16px]">
                {hasExams ? (
                  <div className="text-[11px] font-semibold font-mono truncate text-teal-800 dark:text-teal-200">
                    {dayExams.map((e) => e.code).join(' · ')}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    Study day
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day quick detail bar */}
      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatShortDate(selectedDate)}
            {selectedDate === todayKey ? ' · Today' : ''}
          </div>
          {selectedExams.length > 0 ? (
            <p className="text-sm text-teal-800 dark:text-teal-300">
              {selectedExams
                .map((e) => `${e.code} (${e.startTime}–${e.endTime})`)
                .join(' · ')}
            </p>
          ) : dueTasksOnSelected.length > 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {dueTasksOnSelected.length} study{' '}
              {dueTasksOnSelected.length === 1 ? 'task' : 'tasks'} due:{' '}
              {dueTasksOnSelected
                .map((item) => `${item.exam.code}: ${item.task.title}`)
                .slice(0, 2)
                .join(' · ')}
            </p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dedicated study day — 7:00 AM to 11:00 PM structured prep blocks.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenDayTimetable(selectedDate)}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <CalendarDays className="w-4 h-4" />
          <span>Open 7am–11pm Plan</span>
        </button>
      </div>
    </section>
  );
}
