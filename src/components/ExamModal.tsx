import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { CALM_COLORS } from '../data/initialExams';
import { Exam, ExamColorKey } from '../types/exam';
import { getTodayKey } from '../utils/dateUtils';

interface ExamModalProps {
  isOpen: boolean;
  editingExam: Exam | null;
  onClose: () => void;
  onSave: (examData: Omit<Exam, 'id' | 'tasks'>, existingId?: string) => void;
  onDelete?: (examId: string) => void;
}

const COLOR_KEYS = Object.keys(CALM_COLORS) as ExamColorKey[];

export function ExamModal({
  isOpen,
  editingExam,
  onClose,
  onSave,
  onDelete,
}: ExamModalProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayKey());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [venue, setVenue] = useState('');
  const [invigilator, setInvigilator] = useState('');
  const [chiefInvigilator, setChiefInvigilator] = useState('');
  const [color, setColor] = useState<ExamColorKey>('teal');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setConfirmDelete(false);
    if (editingExam) {
      setCode(editingExam.code);
      setTitle(editingExam.title);
      setDate(editingExam.date);
      setStartTime(editingExam.startTime);
      setEndTime(editingExam.endTime);
      setVenue(editingExam.venue);
      setInvigilator(editingExam.invigilator);
      setChiefInvigilator(editingExam.chiefInvigilator);
      setColor(editingExam.color);
    } else {
      setCode('');
      setTitle('');
      setDate('2026-12-10');
      setStartTime('09:00');
      setEndTime('11:00');
      setVenue('');
      setInvigilator('');
      setChiefInvigilator('');
      setColor('teal');
    }
  }, [isOpen, editingExam]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim() || !date) return;
    onSave(
      {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        invigilator: invigilator.trim(),
        chiefInvigilator: chiefInvigilator.trim(),
        color,
      },
      editingExam?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#151D24] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between gap-4 mb-4">
          <h2
            id="exam-modal-title"
            className="text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            {editingExam ? `Edit ${editingExam.code}` : 'Add New Exam'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Unit Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BIT124"
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                required
              />
            </label>
            <label className="block sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Unit Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Computer Organization and Architecture"
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Exam Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Start Time
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              End Time
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Venue
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Hall A / Lab 2"
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Invigilator
              <input
                type="text"
                value={invigilator}
                onChange={(e) => setInvigilator(e.target.value)}
                placeholder="Mr. James Iraya"
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Chief Invigilator
              <input
                type="text"
                value={chiefInvigilator}
                onChange={(e) => setChiefInvigilator(e.target.value)}
                placeholder="Ms. Monicah Hinga"
                className="mt-1.5 w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </label>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Calm Color Tag
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_KEYS.map((key) => {
                const item = CALM_COLORS[key];
                const selected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    className={`min-h-[44px] px-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      selected
                        ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${item.swatchBg}`} />
                    <span className="truncate">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {editingExam && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(editingExam.id);
                      onClose();
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-[44px] px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="min-h-[44px] px-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Exam</span>
                </button>
              )
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                {editingExam ? 'Save Changes' : 'Add Exam'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
