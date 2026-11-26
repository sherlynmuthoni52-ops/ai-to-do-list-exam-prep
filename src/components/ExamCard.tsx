import { useState } from 'react';
import {
  Check,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { CALM_COLORS } from '../data/initialExams';
import { Exam } from '../types/exam';
import {
  formatShortDate,
  formatTimeRange,
  getExamCountdown,
} from '../utils/dateUtils';

interface ExamCardProps {
  exam: Exam;
  now: Date;
  hasSameDayExam: boolean;
  onEditExam: (exam: Exam) => void;
  onQuickDateTimeChange: (
    examId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => void;
  onToggleTask: (examId: string, taskId: string) => void;
  onAddTask: (examId: string, title: string, dueDate: string) => void;
  onDeleteTask: (examId: string, taskId: string) => void;
}

export function ExamCard({
  exam,
  now,
  hasSameDayExam,
  onEditExam,
  onQuickDateTimeChange,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}: ExamCardProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(exam.date);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [draftDate, setDraftDate] = useState(exam.date);
  const [draftStart, setDraftStart] = useState(exam.startTime);
  const [draftEnd, setDraftEnd] = useState(exam.endTime);

  const colorStyle = CALM_COLORS[exam.color] || CALM_COLORS.teal;
  const countdown = getExamCountdown(exam, now);

  const completedTasks = exam.tasks.filter((t) => t.completed).length;
  const totalTasks = exam.tasks.length;
  const progressPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    onAddTask(exam.id, trimmed, newTaskDueDate || exam.date);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleSaveInlineSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftDate || !draftStart || !draftEnd) return;
    onQuickDateTimeChange(exam.id, draftDate, draftStart, draftEnd);
    setEditingSchedule(false);
  };

  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Card header: Code + Countdown + Edit button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span
                className={`font-mono font-semibold text-sm ${colorStyle.text}`}
              >
                {exam.code}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formatShortDate(exam.date)}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatTimeRange(exam.startTime, exam.endTime)}
              </span>
              {hasSameDayExam && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    Double exam day
                  </span>
                </>
              )}
            </div>

            <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {exam.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDraftDate(exam.date);
                setDraftStart(exam.startTime);
                setDraftEnd(exam.endTime);
                setEditingSchedule((prev) => !prev);
              }}
              aria-label={`Change date and time for ${exam.code}`}
              title="Quick change date & time"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEditExam(exam)}
              aria-label={`Edit ${exam.code}`}
              title="Edit exam details"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline quick Date & Time adjuster */}
        {editingSchedule && (
          <form
            onSubmit={handleSaveInlineSchedule}
            className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Exam Date
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="mt-1 w-full min-h-[44px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                  required
                />
              </label>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Start Time
                <input
                  type="time"
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                  className="mt-1 w-full min-h-[44px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                  required
                />
              </label>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                End Time
                <input
                  type="time"
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                  className="mt-1 w-full min-h-[44px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
                  required
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSchedule(false)}
                className="min-h-[44px] px-4 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-lg text-sm font-medium bg-teal-700 hover:bg-teal-800 text-white transition-colors cursor-pointer"
              >
                Update Time
              </button>
            </div>
          </form>
        )}

        {/* Unboxed Exam Details & Live Countdown */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-100 dark:border-slate-800/90">
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
            <div>
              Invigilator: <span className="text-slate-800 dark:text-slate-200">{exam.invigilator || 'TBA'}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              Chief: <span className="text-slate-800 dark:text-slate-200">{exam.chiefInvigilator || 'TBA'}</span>
            </div>
            <div>
              Venue: <span className="text-slate-800 dark:text-slate-200">{exam.venue || 'To be announced'}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1.5 text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              <Clock className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{countdown.label}</span>
            </div>
            <div
              className={`text-xs ${
                countdown.isUrgent && !countdown.isPast
                  ? 'text-amber-700 dark:text-amber-300 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {countdown.sublabel}
            </div>
          </div>
        </div>

        {/* Per-exam progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Study Tasks Progress
            </span>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {completedTasks}/{totalTasks} ({progressPct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${colorStyle.progressBar}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Study tasks checklist */}
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
          {exam.tasks.length === 0 ? (
            <li className="py-3 text-sm text-slate-500 dark:text-slate-400">
              No study tasks yet. Add your first topic below.
            </li>
          ) : (
            exam.tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2 py-1">
                <button
                  type="button"
                  onClick={() => onToggleTask(exam.id, task.id)}
                  className="flex-1 min-h-[44px] flex items-center gap-3 text-left py-1.5 px-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <span
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-teal-700 border-teal-700 dark:bg-teal-500 dark:border-teal-500 text-white dark:text-slate-950'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[2.5]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm leading-snug ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                      Due {formatShortDate(task.dueDate)}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(exam.id, task.id)}
                  aria-label={`Delete task ${task.title}`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Add Task trigger or inline form */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {showAddTask ? (
          <form onSubmit={handleCreateTask} className="space-y-2.5 pt-1">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g., Practice Chapter 4 past questions"
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              autoFocus
              required
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex-1 min-w-[150px] text-xs text-slate-500 dark:text-slate-400">
                <span className="sr-only">Due Date</span>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
                  required
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl text-sm font-medium bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white transition-colors cursor-pointer"
              >
                Add Task
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNewTaskDueDate(exam.date);
              setShowAddTask(true);
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        )}
      </div>
    </article>
  );
}
