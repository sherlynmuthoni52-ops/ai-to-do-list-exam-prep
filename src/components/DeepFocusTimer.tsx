import { CheckCircle2, Pause, Play, RotateCcw, Timer, X } from 'lucide-react';

export type FocusMode = '25m' | '50m' | '5m';

export interface FocusSessionState {
  blockId: string;
  blockTitle: string;
  examCode?: string;
  mode: FocusMode;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  completedCount: number;
  finishedJustNow: boolean;
}

interface DeepFocusTimerProps {
  session: FocusSessionState;
  isBlockCompleted: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onSwitchMode: (mode: FocusMode) => void;
  onMarkBlockDone: (blockId: string) => void;
  onDismiss: () => void;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function DeepFocusTimer({
  session,
  isBlockCompleted,
  onTogglePlay,
  onReset,
  onSwitchMode,
  onMarkBlockDone,
  onDismiss,
}: DeepFocusTimerProps) {
  const elapsed = Math.max(0, session.totalSeconds - session.remainingSeconds);
  const pct =
    session.totalSeconds > 0
      ? Math.min(100, Math.round((elapsed / session.totalSeconds) * 100))
      : 0;

  return (
    <section
      aria-label="Deep Focus Pomodoro timer"
      className="rounded-2xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-[#151D24] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Session Context */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300">
              <Timer className="w-3.5 h-3.5" />
              Deep Focus Timer
            </span>
            {session.examCode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {session.examCode}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {session.completedCount}{' '}
              {session.completedCount === 1 ? 'session' : 'sessions'} completed
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {session.blockTitle}
          </h3>

          {session.finishedJustNow && (
            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
              Session complete! Take 5 minutes of recall &amp; rest, or start the next block.
            </p>
          )}
        </div>

        {/* Countdown Clock & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            {(
              [
                { id: '25m', label: '25m Focus' },
                { id: '50m', label: '50m Focus' },
                { id: '5m', label: '5m Break' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSwitchMode(opt.id)}
                className={`min-h-[40px] px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  session.mode === opt.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div
            aria-live="polite"
            className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-white min-w-[104px] text-center"
          >
            {formatClock(session.remainingSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {session.isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{elapsed > 0 && !session.finishedJustNow ? 'Resume' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReset}
              aria-label="Reset timer"
              title="Reset timer"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {!isBlockCompleted && (
              <button
                type="button"
                onClick={() => onMarkBlockDone(session.blockId)}
                title="Mark this time block done"
                className="min-h-[44px] px-3 rounded-xl border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Done</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close Deep Focus timer"
              title="Close timer"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-700 dark:bg-teal-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
