import { Exam } from '../types/exam';

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayKey(): string {
  return toLocalDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function diffDays(fromDateKey: string, toDateKey: string): number {
  const from = parseDateKey(fromDateKey);
  const to = parseDateKey(toDateKey);
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

export function formatShortDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDayParts(dateKey: string): {
  weekdayShort: string;
  dayNum: string;
  monthShort: string;
} {
  const date = parseDateKey(dateKey);
  return {
    weekdayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: String(date.getDate()),
    monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
  };
}

export function getExamCountdown(
  exam: Exam,
  now: Date
): {
  label: string;
  sublabel: string;
  daysLeft: number;
  hoursLeft: number;
  isPast: boolean;
  isToday: boolean;
  isUrgent: boolean;
} {
  const [y, m, d] = exam.date.split('-').map(Number);
  const [hh, mm] = exam.startTime.split(':').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1, hh || 9, mm || 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const todayKey = toLocalDateKey(now);
  const isToday = exam.date === todayKey;

  if (diffMs <= 0) {
    const endParts = exam.endTime.split(':').map(Number);
    const endTarget = new Date(
      y,
      (m || 1) - 1,
      d || 1,
      endParts[0] || 11,
      endParts[1] || 0,
      0
    );
    if (now.getTime() <= endTarget.getTime()) {
      return {
        label: 'In Progress',
        sublabel: `Ends at ${formatTime12h(exam.endTime)}`,
        daysLeft: 0,
        hoursLeft: 0,
        isPast: false,
        isToday: true,
        isUrgent: true,
      };
    }
    return {
      label: 'Completed',
      sublabel: formatShortDate(exam.date),
      daysLeft: 0,
      hoursLeft: 0,
      isPast: true,
      isToday,
      isUrgent: false,
    };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const daysLeft = Math.floor(totalMinutes / (60 * 24));
  const hoursLeft = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minsLeft = totalMinutes % 60;

  if (daysLeft === 0) {
    return {
      label: `${hoursLeft}h ${minsLeft}m`,
      sublabel: isToday ? 'Today' : 'Tomorrow morning',
      daysLeft,
      hoursLeft,
      isPast: false,
      isToday,
      isUrgent: true,
    };
  }

  if (daysLeft === 1) {
    return {
      label: `1d ${hoursLeft}h`,
      sublabel: 'Tomorrow',
      daysLeft,
      hoursLeft,
      isPast: false,
      isToday: false,
      isUrgent: true,
    };
  }

  return {
    label: `${daysLeft}d ${hoursLeft}h`,
    sublabel: daysLeft <= 3 ? 'Approaching soon' : `${daysLeft} days away`,
    daysLeft,
    hoursLeft,
    isPast: false,
    isToday: false,
    isUrgent: daysLeft <= 3,
  };
}

export function sortExamsChronologically(exams: Exam[]): Exam[] {
  return [...exams].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export function getDateRangeKeys(startDateKey: string, endDateKey: string): string[] {
  const days = diffDays(startDateKey, endDateKey);
  const total = Math.max(0, days);
  const keys: string[] = [];
  for (let i = 0; i <= total; i++) {
    keys.push(addDays(startDateKey, i));
  }
  return keys;
}
