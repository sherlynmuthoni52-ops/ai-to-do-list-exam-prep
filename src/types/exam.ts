export type ExamColorKey =
  | 'teal'
  | 'indigo'
  | 'sage'
  | 'amber'
  | 'sky'
  | 'plum';

export interface StudyTask {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  venue: string;
  invigilator: string;
  chiefInvigilator: string;
  color: ExamColorKey;
  studyHoursTarget?: number;
  tasks: StudyTask[];
}

export type BlockCategory =
  | 'exam'
  | 'class'
  | 'study'
  | 'review'
  | 'routine'
  | 'break'
  | 'freetime'
  | 'rest';

export interface DailyTimeBlock {
  id: string; // deterministic e.g. `${date}_${startTime}`
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  subtitle: string;
  category: BlockCategory;
  examId?: string;
  examCode?: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  phase: string;
  examsOnDay: Exam[];
  classesOnDay: string[];
  unitsInDay: string[];
  blocks: DailyTimeBlock[];
}

export type AppView = 'overview' | 'exams' | 'timetable' | 'pdf';
