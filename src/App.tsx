import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  LayoutGrid,
  ListChecks,
  Moon,
  Plus,
  RotateCcw,
  Shuffle,
  Sun,
} from 'lucide-react';
import { DailyTimetableView } from './components/DailyTimetableView';
import { FocusMode, FocusSessionState } from './components/DeepFocusTimer';
import { ExamCard } from './components/ExamCard';
import { ExamModal } from './components/ExamModal';
import { PdfPlanPreview } from './components/PdfPlanPreview';
import { Timeline14Day } from './components/Timeline14Day';
import { ACADEMIC_PROFILE, createOfficialExams } from './data/initialExams';
import { AppView, DailyTimeBlock, Exam } from './types/exam';
import {
  formatShortDate,
  formatTimeRange,
  getExamCountdown,
  getTodayKey,
  sortExamsChronologically,
} from './utils/dateUtils';
import { exportStudyPlanPdf } from './utils/pdfExport';
import {
  buildDailySchedule,
  spreadExamsAcrossDates,
} from './utils/scheduleGenerator';

const STORAGE_EXAMS_KEY = 'calmprep_exams_v2';
const STORAGE_BLOCK_DONE_KEY = 'calmprep_block_done_v1';
const STORAGE_BLOCK_NOTES_KEY = 'calmprep_block_notes_v1';
const STORAGE_DAILY_GOALS_KEY = 'calmprep_daily_goals_v1';
const STORAGE_INCLUDE_CLASSES_KEY = 'calmprep_include_classes_v1';
const STORAGE_FOCUS_COUNT_KEY = 'calmprep_focus_count_v1';
const STORAGE_THEME_KEY = 'calmprep_theme_v1';

const MODE_SECONDS: Record<FocusMode, number> = {
  '25m': 25 * 60,
  '50m': 50 * 60,
  '5m': 5 * 60,
};

function playSoftChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [523.25, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      gain.gain.setValueAtTime(0.001, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.6);
    });
  } catch {
    // ignore Web Audio autoplay restrictions
  }
}

function loadStoredExams(): Exam[] {
  try {
    const raw = localStorage.getItem(STORAGE_EXAMS_KEY);
    if (!raw) return createOfficialExams();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return createOfficialExams();
  } catch {
    return createOfficialExams();
  }
}

function loadStoredRecord<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore storage errors
  }
  return 'light';
}

export default function App() {
  const [exams, setExams] = useState<Exam[]>(loadStoredExams);
  const [completedBlockIds, setCompletedBlockIds] = useState<
    Record<string, boolean>
  >(() => loadStoredRecord(STORAGE_BLOCK_DONE_KEY, {}));
  const [customBlockNotes, setCustomBlockNotes] = useState<
    Record<string, string>
  >(() => loadStoredRecord(STORAGE_BLOCK_NOTES_KEY, {}));
  const [dailyMainGoals, setDailyMainGoals] = useState<
    Record<string, string>
  >(() => loadStoredRecord(STORAGE_DAILY_GOALS_KEY, {}));
  const [includeClasses, setIncludeClasses] = useState<boolean>(() =>
    loadStoredRecord(STORAGE_INCLUDE_CLASSES_KEY, true)
  );
  const [focusCompletedCount, setFocusCompletedCount] = useState<number>(() =>
    loadStoredRecord(STORAGE_FOCUS_COUNT_KEY, 0)
  );
  const [focusSession, setFocusSession] = useState<FocusSessionState | null>(
    null
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(loadInitialTheme);

  const [activeView, setActiveView] = useState<AppView>('overview');
  const [now, setNow] = useState<Date>(() => new Date());

  const todayKey = getTodayKey();
  const [timelineStart, setTimelineStart] = useState<string>(todayKey);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examFilter, setExamFilter] = useState<'all' | 'upcoming' | 'pending'>(
    'all'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live countdown ticker (every 30s keeps minutes accurate without jitter)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Pomodoro Deep Focus countdown loop
  useEffect(() => {
    if (!focusSession?.isRunning) return;
    const interval = window.setInterval(() => {
      setFocusSession((prev) => {
        if (!prev || !prev.isRunning) return prev;
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            remainingSeconds: 0,
            isRunning: false,
            finishedJustNow: true,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [focusSession?.isRunning]);

  // Handle Deep Focus session completion chime, counter & toast cleanly
  useEffect(() => {
    if (!focusSession?.finishedJustNow) return;
    playSoftChime();
    if (focusSession.mode !== '5m') {
      const nextCount = focusCompletedCount + 1;
      setFocusCompletedCount(nextCount);
      setFocusSession((prev) =>
        prev ? { ...prev, completedCount: nextCount } : prev
      );
    }
    showToast(
      focusSession.mode === '5m'
        ? 'Break complete — ready for the next study block!'
        : `Deep Focus complete for ${focusSession.examCode || 'study block'}!`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSession?.finishedJustNow]);

  // Sync dark mode class on <html> and save preference
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Persist exams
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXAMS_KEY, JSON.stringify(exams));
    } catch {
      // ignore
    }
  }, [exams]);

  // Persist timetable checks & notes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_BLOCK_DONE_KEY,
        JSON.stringify(completedBlockIds)
      );
    } catch {
      // ignore
    }
  }, [completedBlockIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_BLOCK_NOTES_KEY,
        JSON.stringify(customBlockNotes)
      );
    } catch {
      // ignore
    }
  }, [customBlockNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_DAILY_GOALS_KEY,
        JSON.stringify(dailyMainGoals)
      );
    } catch {
      // ignore
    }
  }, [dailyMainGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_INCLUDE_CLASSES_KEY,
        JSON.stringify(includeClasses)
      );
    } catch {
      // ignore
    }
  }, [includeClasses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_FOCUS_COUNT_KEY,
        JSON.stringify(focusCompletedCount)
      );
    } catch {
      // ignore
    }
  }, [focusCompletedCount]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const sortedExams = useMemo(() => sortExamsChronologically(exams), [exams]);

  const sameDayDates = useMemo(() => {
    const counts: Record<string, number> = {};
    sortedExams.forEach((e) => {
      counts[e.date] = (counts[e.date] || 0) + 1;
    });
    return new Set(
      Object.entries(counts)
        .filter(([, count]) => count > 1)
        .map(([date]) => date)
    );
  }, [sortedExams]);

  const totalTasks = useMemo(
    () => sortedExams.reduce((sum, exam) => sum + exam.tasks.length, 0),
    [sortedExams]
  );
  const completedTasks = useMemo(
    () =>
      sortedExams.reduce(
        (sum, exam) => sum + exam.tasks.filter((t) => t.completed).length,
        0
      ),
    [sortedExams]
  );
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const nextExam = useMemo(() => {
    return sortedExams.find((e) => !getExamCountdown(e, now).isPast) || sortedExams[0];
  }, [sortedExams, now]);

  const nextExamCountdown = nextExam ? getExamCountdown(nextExam, now) : null;

  const todaySchedule = useMemo(
    () => buildDailySchedule(todayKey, sortedExams, 0, includeClasses),
    [todayKey, sortedExams, includeClasses]
  );

  // Handlers
  const handleSaveExam = (
    examData: Omit<Exam, 'id' | 'tasks'>,
    existingId?: string
  ) => {
    if (existingId) {
      setExams((prev) =>
        prev.map((e) => (e.id === existingId ? { ...e, ...examData } : e))
      );
      showToast(`Updated ${examData.code}`);
    } else {
      const newExam: Exam = {
        ...examData,
        id: `exam-${Date.now()}`,
        tasks: [
          {
            id: `t-${Date.now()}-1`,
            title: `Review core syllabus & summary notes for ${examData.code}`,
            dueDate: examData.date,
            completed: false,
          },
          {
            id: `t-${Date.now()}-2`,
            title: `Complete past-paper timed practice for ${examData.code}`,
            dueDate: examData.date,
            completed: false,
          },
        ],
      };
      setExams((prev) => [...prev, newExam]);
      showToast(`Added ${examData.code}`);
    }
  };

  const handleDeleteExam = (examId: string) => {
    const target = exams.find((e) => e.id === examId);
    setExams((prev) => prev.filter((e) => e.id !== examId));
    if (target) showToast(`Removed ${target.code}`);
  };

  const handleQuickDateTimeChange = (
    examId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, date, startTime, endTime } : e
      )
    );
    showToast('Updated exam date & time');
  };

  const handleToggleTask = (examId: string, taskId: string) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              tasks: exam.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : exam
      )
    );
  };

  const handleAddTask = (examId: string, title: string, dueDate: string) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              tasks: [
                ...exam.tasks,
                {
                  id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  title,
                  dueDate,
                  completed: false,
                },
              ],
            }
          : exam
      )
    );
    showToast('Study task added');
  };

  const handleDeleteTask = (examId: string, taskId: string) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === examId
          ? {
              ...exam,
              tasks: exam.tasks.filter((t) => t.id !== taskId),
            }
          : exam
      )
    );
  };

  const handleSpreadExams = () => {
    const startAnchor = sortedExams[0]?.date || '2026-12-07';
    setExams((prev) => spreadExamsAcrossDates(prev, startAnchor));
    showToast('Spread exams across separate days');
  };

  const handleResetOfficial = () => {
    setExams(createOfficialExams());
    showToast('Restored official December 2026 timetable');
  };

  const handleToggleBlockComplete = (blockId: string) => {
    setCompletedBlockIds((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const handleSaveBlockNote = (blockId: string, note: string) => {
    setCustomBlockNotes((prev) => {
      const next = { ...prev };
      if (!note) {
        delete next[blockId];
      } else {
        next[blockId] = note;
      }
      return next;
    });
    showToast('Saved schedule note');
  };

  const handleSaveDailyGoal = (dateKey: string, goal: string) => {
    setDailyMainGoals((prev) => {
      const next = { ...prev };
      if (!goal) {
        delete next[dateKey];
      } else {
        next[dateKey] = goal;
      }
      return next;
    });
  };

  const handleDownloadPdf = () => {
    exportStudyPlanPdf(exams, includeClasses, dailyMainGoals);
    showToast('Downloaded AIU PDF study plan');
  };

  const handleStartFocusForBlock = (block: DailyTimeBlock) => {
    const secs = MODE_SECONDS['25m'];
    setFocusSession({
      blockId: block.id,
      blockTitle: block.title,
      examCode: block.examCode,
      mode: '25m',
      totalSeconds: secs,
      remainingSeconds: secs,
      isRunning: true,
      completedCount: focusCompletedCount,
      finishedJustNow: false,
    });
    showToast(`Started 25m Deep Focus: ${block.examCode || block.title}`);
  };

  const handleToggleFocusPlay = () => {
    setFocusSession((prev) => {
      if (!prev) return prev;
      if (prev.remainingSeconds === 0) {
        return {
          ...prev,
          remainingSeconds: prev.totalSeconds,
          isRunning: true,
          finishedJustNow: false,
        };
      }
      return {
        ...prev,
        isRunning: !prev.isRunning,
        finishedJustNow: false,
      };
    });
  };

  const handleResetFocus = () => {
    setFocusSession((prev) =>
      prev
        ? {
            ...prev,
            remainingSeconds: prev.totalSeconds,
            isRunning: false,
            finishedJustNow: false,
          }
        : prev
    );
  };

  const handleSwitchFocusMode = (mode: FocusMode) => {
    const secs = MODE_SECONDS[mode];
    setFocusSession((prev) =>
      prev
        ? {
            ...prev,
            mode,
            totalSeconds: secs,
            remainingSeconds: secs,
            isRunning: false,
            finishedJustNow: false,
          }
        : prev
    );
  };

  const handleDismissFocus = () => {
    setFocusSession(null);
  };

  const filteredExams = useMemo(() => {
    if (examFilter === 'upcoming') {
      return sortedExams.filter((e) => !getExamCountdown(e, now).isPast);
    }
    if (examFilter === 'pending') {
      return sortedExams.filter((e) => e.tasks.some((t) => !t.completed));
    }
    return sortedExams;
  }, [sortedExams, examFilter, now]);

  const navItems: { id: AppView; label: string; shortLabel: string; icon: typeof LayoutGrid }[] = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutGrid },
    { id: 'exams', label: 'Exams & Tasks', shortLabel: 'Exams', icon: ListChecks },
    { id: 'timetable', label: 'Daily 7am–11pm', shortLabel: 'Timetable', icon: CalendarDays },
    { id: 'pdf', label: 'PDF Study Plan', shortLabel: 'PDF Plan', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-[#0E1418] text-slate-900 dark:text-slate-100 pb-24 md:pb-12 transition-colors">
      {/* Top Bar (Strict 3-Zone Contract) */}
      <header className="no-print sticky top-0 z-30 h-[52px] md:h-16 bg-white/90 dark:bg-[#131A20]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            CalmPrep
          </button>

          {/* Zone 2: Single-line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`min-h-[44px] px-1 inline-flex items-center border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-teal-700 dark:border-teal-400 text-teal-800 dark:text-teal-300 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="min-h-[40px] md:min-h-[44px] px-3.5 md:px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        {/* Workspace Utility & Readiness Strip */}
        <section
          aria-label="Study readiness and workspace controls"
          className="no-print rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]">
                December 2026 Examination Planner
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                {ACADEMIC_PROFILE.program} · {sortedExams.length} units ·{' '}
                {nextExam && nextExamCountdown ? (
                  <span className="font-medium text-teal-800 dark:text-teal-300 tabular-nums">
                    Next up: {nextExam.code} in {nextExamCountdown.label}
                  </span>
                ) : (
                  'Add your upcoming exams to begin'
                )}
              </p>
            </div>

            {/* Action Toolbar (Big >=44px tap targets) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
                }
                aria-label={
                  theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
                }
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSpreadExams}
                title="Distribute exams evenly across days"
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Spread Exams</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingExam(null);
                  setModalOpen(true);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exam</span>
              </button>
            </div>
          </div>

          {/* Overall Task Completion Progress Bar */}
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/90 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-800 dark:text-slate-200 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  Overall Study Task Readiness
                </span>
                <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {completedTasks} / {totalTasks} tasks ({overallProgress}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-700 dark:bg-teal-400 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {nextExam && nextExamCountdown && (
              <div className="flex items-center justify-between md:justify-end gap-4 md:pl-4 md:border-l border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Nearest Exam
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {nextExam.code} · {formatShortDate(nextExam.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono tabular-nums text-teal-800 dark:text-teal-300">
                    {nextExamCountdown.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatTimeRange(nextExam.startTime, nextExam.endTime)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* OVERVIEW VIEW */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* 14-day timeline */}
            <Timeline14Day
              exams={sortedExams}
              windowStart={timelineStart}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              onShiftWindow={(d) => setTimelineStart(d)}
              onOpenDayTimetable={(d) => {
                setSelectedDate(d);
                setActiveView('timetable');
              }}
            />

            {/* Quick Exam Countdowns Row */}
            <section aria-label="Exam countdown strip">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Exam Countdowns
                </h2>
                {sameDayDates.size > 0 && (
                  <div className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <span>
                      Two papers share {Array.from(sameDayDates).map(formatShortDate).join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={handleSpreadExams}
                      className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
                    >
                      Spread across days
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedExams.map((exam) => {
                  const cd = getExamCountdown(exam, now);
                  const done = exam.tasks.filter((t) => t.completed).length;
                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => {
                        setEditingExam(exam);
                        setModalOpen(true);
                      }}
                      className="min-h-[84px] text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 hover:border-teal-600/60 dark:hover:border-teal-500/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-teal-800 dark:text-teal-300">
                            {exam.code} · {formatShortDate(exam.date)}
                          </div>
                          <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {exam.title}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white">
                            {cd.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            {formatTimeRange(exam.startTime, exam.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {done}/{exam.tasks.length} study tasks done · Tap to change date/time
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Today's 7am - 11pm Snapshot */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Today’s Study Plan (7:00 AM – 11:00 PM)
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatShortDate(todayKey)} · Balanced study blocks, breaks, and evening review
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(todayKey);
                    setActiveView('timetable');
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>View All Days</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {todaySchedule.blocks.slice(0, 6).map((block) => {
                  const tint =
                    block.category === 'class'
                      ? 'border-sky-200 dark:border-sky-800/70 bg-sky-50/80 dark:bg-sky-950/35'
                      : block.category === 'exam'
                        ? 'border-rose-200 dark:border-rose-800/70 bg-rose-50/80 dark:bg-rose-950/35'
                        : block.category === 'review'
                          ? 'border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/30'
                          : block.category === 'freetime'
                            ? 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/30'
                            : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40';
                  return (
                    <div
                      key={block.id}
                      className={`rounded-xl border p-3 ${tint}`}
                    >
                      <div className="font-mono text-xs font-semibold tabular-nums text-teal-800 dark:text-teal-300">
                        {formatTimeRange(block.startTime, block.endTime)}
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                        {block.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {block.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Full Exam Cards Grid */}
            <section aria-label="Exams and study tasks">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Units &amp; Study Tasks
                </h2>
                <button
                  type="button"
                  onClick={handleResetOfficial}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Official Timetable</span>
                </button>
              </div>

              {sortedExams.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-8 text-center">
                  <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                    No exams scheduled yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExam(null);
                      setModalOpen(true);
                    }}
                    className="mt-4 min-h-[44px] px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium cursor-pointer"
                  >
                    Add Your First Exam
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {sortedExams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      now={now}
                      hasSameDayExam={sameDayDates.has(exam.date)}
                      onEditExam={(ex) => {
                        setEditingExam(ex);
                        setModalOpen(true);
                      }}
                      onQuickDateTimeChange={handleQuickDateTimeChange}
                      onToggleTask={handleToggleTask}
                      onAddTask={handleAddTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* EXAMS & TASKS VIEW */}
        {activeView === 'exams' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Exams &amp; Study Tasks
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Edit any exam’s date, time, venue, or add custom study tasks and due dates.
                </p>
              </div>

              <div className="inline-flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-1 self-start">
                {(
                  [
                    { id: 'all', label: 'All Units' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'pending', label: 'Tasks Pending' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setExamFilter(tab.id)}
                    className={`min-h-[40px] px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      examFilter === tab.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredExams.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D24] p-8 text-center">
                <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                  No exams match this filter.
                </p>
                <button
                  type="button"
                  onClick={() => setExamFilter('all')}
                  className="mt-3 min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Show All Units
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredExams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    now={now}
                    hasSameDayExam={sameDayDates.has(exam.date)}
                    onEditExam={(ex) => {
                      setEditingExam(ex);
                      setModalOpen(true);
                    }}
                    onQuickDateTimeChange={handleQuickDateTimeChange}
                    onToggleTask={handleToggleTask}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DAILY 7AM - 11PM TIMETABLE VIEW */}
        {activeView === 'timetable' && (
          <DailyTimetableView
            exams={sortedExams}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            completedBlockIds={completedBlockIds}
            customBlockNotes={customBlockNotes}
            dailyMainGoals={dailyMainGoals}
            includeClasses={includeClasses}
            focusSession={focusSession}
            onToggleIncludeClasses={() => setIncludeClasses((prev) => !prev)}
            onToggleBlockComplete={handleToggleBlockComplete}
            onSaveBlockNote={handleSaveBlockNote}
            onSaveDailyGoal={handleSaveDailyGoal}
            onStartFocusForBlock={handleStartFocusForBlock}
            onToggleFocusPlay={handleToggleFocusPlay}
            onResetFocus={handleResetFocus}
            onSwitchFocusMode={handleSwitchFocusMode}
            onDismissFocus={handleDismissFocus}
            onDownloadPdf={handleDownloadPdf}
          />
        )}

        {/* PDF STUDY PLAN VIEW */}
        {activeView === 'pdf' && (
          <PdfPlanPreview
            exams={sortedExams}
            includeClasses={includeClasses}
            dailyMainGoals={dailyMainGoals}
            onDownloadPdf={handleDownloadPdf}
            onSpreadExams={handleSpreadExams}
            onResetOfficial={handleResetOfficial}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Thumb Zone, total sticky height <= 15% mobile viewport) */}
      <nav
        aria-label="Mobile navigation"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-white/95 dark:bg-[#131A20]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                isActive
                  ? 'text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Add / Edit Exam Modal */}
      <ExamModal
        isOpen={modalOpen}
        editingExam={editingExam}
        onClose={() => {
          setModalOpen(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        onDelete={handleDeleteExam}
      />

      {/* Subtle Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 text-sm font-medium shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
