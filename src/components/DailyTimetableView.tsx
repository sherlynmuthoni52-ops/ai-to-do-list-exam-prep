import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  GraduationCap,
  NotebookPen,
  Play,
  Target,
  Timer,
  X,
} from 'lucide-react';
import { BlockCategory, DailyTimeBlock, Exam } from '../types/exam';
import {
  formatLongDate,
  formatShortDate,
  formatTimeRange,
  getDayParts,
  getTodayKey,
} from '../utils/dateUtils';
import { buildFullPrepPlan } from '../utils/scheduleGenerator';
import {
  DeepFocusTimer,
  FocusMode,
  FocusSessionState,
} from './DeepFocusTimer';

interface DailyTimetableViewProps {
  exams: Exam[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  completedBlockIds: Record<string, boolean>;
  customBlockNotes: Record<string, string>;
  dailyMainGoals: Record<string, string>;
  includeClasses: boolean;
  focusSession: FocusSessionState | null;
  onToggleIncludeClasses: () => void;
  onToggleBlockComplete: (blockId: string) => void;
  onSaveBlockNote: (blockId: string, note: string) => void;
  onSaveDailyGoal: (dateKey: string, goal: string) => void;
  onStartFocusForBlock: (block: DailyTimeBlock) => void;
  onToggleFocusPlay: () => void;
  onResetFocus: () => void;
  onSwitchFocusMode: (mode: FocusMode) => void;
  onDismissFocus: () => void;
  onDownloadPdf: () => void;
}

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  exam: 'Exam Sitting',
  class: 'Scheduled Class',
  study: 'Deep Study',
  review: 'Daily Review',
  routine: 'Routine & Meals',
  break: 'Break & Walk',
  freetime: 'Free Time',
  rest: 'Sleep Prep',
};

function getBlockRowClasses(category: BlockCategory): string {
  switch (category) {
    case 'class':
      return 'bg-sky-50/85 dark:bg-sky-950/35 border border-sky-200/80 dark:border-sky-800/60 my-1.5';
    case 'exam':
      return 'bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 my-1.5';
    case 'review':
      return 'bg-amber-50/85 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 my-1.5';
    case 'freetime':
      return 'bg-emerald-50/85 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 my-1.5';
    default:
      return '';
  }
}

function getCategoryLabelClasses(category: BlockCategory): string {
  switch (category) {
    case 'class':
      return 'text-sky-800 dark:text-sky-300 font-semibold';
    case 'exam':
      return 'text-rose-800 dark:text-rose-300 font-semibold';
    case 'review':
      return 'text-amber-800 dark:text-amber-300 font-semibold';
    case 'freetime':
      return 'text-emerald-800 dark:text-emerald-300 font-semibold';
    default:
      return '';
  }
}

export function DailyTimetableView({
  exams,
  selectedDate,
  onSelectDate,
  completedBlockIds,
  customBlockNotes,
  dailyMainGoals,
  includeClasses,
  focusSession,
  onToggleIncludeClasses,
  onToggleBlockComplete,
  onSaveBlockNote,
  onSaveDailyGoal,
  onStartFocusForBlock,
  onToggleFocusPlay,
  onResetFocus,
  onSwitchFocusMode,
  onDismissFocus,
  onDownloadPdf,
}: DailyTimetableViewProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const plan = buildFullPrepPlan(exams, includeClasses);
  const todayKey = getTodayKey();

  const activeIndex = Math.max(
    0,
    plan.findIndex((d) => d.date === selectedDate)
  );
  const activeDay = plan[activeIndex] || plan[0];

  const completedOnDay = activeDay
    ? activeDay.blocks.filter((b) => completedBlockIds[b.id]).length
    : 0;
  const totalOnDay = activeDay ? activeDay.blocks.length : 0;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Daily 7:00 AM – 11:00 PM Timetable
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Structured plan from{' '}
            <span className="tabular-nums">
              {plan[0]?.date ? formatLongDate(plan[0].date) : 'today'}
            </span>{' '}
            through your final exam ({plan.length} days).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleIncludeClasses}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              includeClasses
                ? 'border-sky-300 dark:border-sky-700 bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Classes until Dec 4: {includeClasses ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Timetable</span>
          </button>
        </div>
      </div>

      {/* Deep Focus Pomodoro Timer */}
      {focusSession && (
        <DeepFocusTimer
          session={focusSession}
          isBlockCompleted={Boolean(completedBlockIds[focusSession.blockId])}
          onTogglePlay={onToggleFocusPlay}
          onReset={onResetFocus}
          onSwitchMode={onSwitchFocusMode}
          onMarkBlockDone={(blockId) => {
            if (!completedBlockIds[blockId]) {
              onToggleBlockComplete(blockId);
            }
          }}
          onDismiss={onDismissFocus}
        />
      )}

      {/* Main Goal for the Current Day */}
      {activeDay && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label
              htmlFor="daily-main-goal-input"
              className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              <Target className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
              <span>Main Goal · {formatShortDate(activeDay.date)}</span>
            </label>
            {!focusSession && (
              <button
                type="button"
                onClick={() => {
                  const firstStudy =
                    activeDay.blocks.find(
                      (b) => b.category === 'study' || b.category === 'review'
                    ) || activeDay.blocks[0];
                  if (firstStudy) onStartFocusForBlock(firstStudy);
                }}
                className="min-h-[40px] px-3 rounded-xl text-xs font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/70 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Start 25m Deep Focus</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="daily-main-goal-input"
              type="text"
              value={dailyMainGoals[activeDay.date] ?? ''}
              onChange={(e) => onSaveDailyGoal(activeDay.date, e.target.value)}
              placeholder="Set your single most important study goal for this day..."
              className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            />
            {dailyMainGoals[activeDay.date] && (
              <button
                type="button"
                onClick={() => onSaveDailyGoal(activeDay.date, '')}
                aria-label="Clear main goal"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Day selector strip */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Select a day ({activeIndex + 1} of {plan.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={activeIndex <= 0}
              onClick={() => {
                if (activeIndex > 0) onSelectDate(plan[activeIndex - 1].date);
              }}
              aria-label="Previous day"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={activeIndex >= plan.length - 1}
              onClick={() => {
                if (activeIndex < plan.length - 1) {
                  onSelectDate(plan[activeIndex + 1].date);
                }
              }}
              aria-label="Next day"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {plan.map((day) => {
            const { weekdayShort, dayNum, monthShort } = getDayParts(day.date);
            const isActive = day.date === activeDay.date;
            const isExamDay = day.examsOnDay.length > 0;
            const isToday = day.date === todayKey;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className={`min-w-[68px] min-h-[68px] shrink-0 rounded-xl border px-2.5 py-2 flex flex-col items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'border-teal-700 dark:border-teal-400 bg-teal-700 dark:bg-teal-600 text-white'
                    : isExamDay
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/35 text-slate-900 dark:text-slate-100 hover:bg-rose-100/70 dark:hover:bg-rose-950/55'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    isActive
                      ? 'text-teal-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isToday ? 'Today' : weekdayShort}
                </span>
                <span className="text-base font-bold font-mono tabular-nums">
                  {dayNum}
                </span>
                <span
                  className={`text-[10px] font-mono truncate max-w-[60px] ${
                    isActive
                      ? 'text-teal-100'
                      : isExamDay
                        ? 'text-rose-700 dark:text-rose-300 font-semibold'
                        : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isExamDay ? day.examsOnDay[0].code : monthShort}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Schedule Card */}
      {activeDay && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-medium text-teal-800 dark:text-teal-300 mb-0.5">
                {activeDay.phase}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatLongDate(activeDay.date)}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activeDay.examsOnDay.length > 0
                  ? `Exam Day: ${activeDay.examsOnDay
                      .map((e) => `${e.code} (${formatTimeRange(e.startTime, e.endTime)})`)
                      .join(' · ')}`
                  : activeDay.classesOnDay.length > 0
                    ? `Class Day (${activeDay.classesOnDay.join(', ')}) · 7:00 AM to 11:00 PM`
                    : 'Free Study Day · 7:00 AM to 11:00 PM'}
              </p>
            </div>
            <div className="text-sm font-mono tabular-nums text-slate-600 dark:text-slate-300 shrink-0">
              {completedOnDay}/{totalOnDay} blocks completed
            </div>
          </div>

          {/* Unboxed Colour Key */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-sky-200 dark:bg-sky-700 border border-sky-300 dark:border-sky-600" />
              Classes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-200 dark:bg-rose-700 border border-rose-300 dark:border-rose-600" />
              Exams
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-200 dark:bg-amber-700 border border-amber-300 dark:border-amber-600" />
              Daily Review
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-700 border border-emerald-300 dark:border-emerald-600" />
              Free Time
            </span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
            {activeDay.blocks.map((block) => {
              const isDone = Boolean(completedBlockIds[block.id]);
              const savedNote = customBlockNotes[block.id] || '';
              const isEditingThis = editingNoteId === block.id;
              const rowClass = getBlockRowClasses(block.category);
              const labelClass = getCategoryLabelClasses(block.category);

              return (
                <li
                  key={block.id}
                  className={`py-3 sm:py-3.5 px-2 sm:px-3 rounded-xl transition-colors ${rowClass}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleBlockComplete(block.id)}
                      aria-label={`Mark ${block.title} as ${isDone ? 'incomplete' : 'complete'}`}
                      className="min-h-[44px] min-w-[44px] -ml-1 flex items-center justify-center rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
                    >
                      <span
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-teal-700 border-teal-700 dark:bg-teal-500 dark:border-teal-500 text-white dark:text-slate-950'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isDone && <Check className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                          {formatTimeRange(block.startTime, block.endTime)}
                        </span>
                        {block.examCode && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                              {block.examCode}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className={labelClass}>
                          {CATEGORY_LABELS[block.category]}
                        </span>
                      </div>

                      <div
                        className={`mt-1 text-base font-medium leading-snug ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {block.title}
                      </div>

                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {block.subtitle}
                      </p>

                      {savedNote && !isEditingThis && (
                        <p className="mt-1.5 text-sm text-teal-800 dark:text-teal-300">
                          Note: {savedNote}
                        </p>
                      )}

                      {isEditingThis && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            onSaveBlockNote(block.id, noteDraft.trim());
                            setEditingNoteId(null);
                          }}
                          className="mt-2.5 flex flex-col sm:flex-row gap-2"
                        >
                          <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add chapter, topic or reminder for this slot..."
                            className="flex-1 min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="min-h-[44px] px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="min-h-[44px] px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStartFocusForBlock(block)}
                        aria-label={`Start 25-minute Deep Focus session for ${block.title}`}
                        title="Start 25m Deep Focus"
                        className={`min-h-[44px] px-2.5 sm:px-3 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          focusSession?.blockId === block.id
                            ? 'bg-teal-700 text-white dark:bg-teal-600'
                            : 'text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {focusSession?.blockId === block.id ? 'Focusing' : '25m Focus'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNoteDraft(savedNote);
                          setEditingNoteId(isEditingThis ? null : block.id);
                        }}
                        aria-label={`Add note for ${block.title}`}
                        title="Add personal note"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      >
                        <NotebookPen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
