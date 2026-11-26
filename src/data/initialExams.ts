import { Exam, ExamColorKey } from '../types/exam';

export interface CalmColorStyle {
  label: string;
  swatchBg: string;
  softBg: string;
  text: string;
  border: string;
  progressBar: string;
  pdfRgb: [number, number, number];
}

export const CALM_COLORS: Record<ExamColorKey, CalmColorStyle> = {
  teal: {
    label: 'Eucalyptus',
    swatchBg: 'bg-teal-600 dark:bg-teal-400',
    softBg: 'bg-teal-50/80 dark:bg-teal-950/50',
    text: 'text-teal-800 dark:text-teal-200',
    border: 'border-teal-200 dark:border-teal-800/70',
    progressBar: 'bg-teal-600 dark:bg-teal-400',
    pdfRgb: [15, 118, 110],
  },
  indigo: {
    label: 'Slate Indigo',
    swatchBg: 'bg-indigo-600 dark:bg-indigo-400',
    softBg: 'bg-indigo-50/80 dark:bg-indigo-950/50',
    text: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-200 dark:border-indigo-800/70',
    progressBar: 'bg-indigo-600 dark:bg-indigo-400',
    pdfRgb: [67, 56, 202],
  },
  sage: {
    label: 'Forest Sage',
    swatchBg: 'bg-emerald-600 dark:bg-emerald-400',
    softBg: 'bg-emerald-50/80 dark:bg-emerald-950/50',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    progressBar: 'bg-emerald-600 dark:bg-emerald-400',
    pdfRgb: [5, 150, 105],
  },
  amber: {
    label: 'Warm Ochre',
    swatchBg: 'bg-amber-600 dark:bg-amber-400',
    softBg: 'bg-amber-50/80 dark:bg-amber-950/45',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-800/70',
    progressBar: 'bg-amber-600 dark:bg-amber-400',
    pdfRgb: [180, 83, 9],
  },
  sky: {
    label: 'Mist Blue',
    swatchBg: 'bg-sky-600 dark:bg-sky-400',
    softBg: 'bg-sky-50/80 dark:bg-sky-950/50',
    text: 'text-sky-800 dark:text-sky-200',
    border: 'border-sky-200 dark:border-sky-800/70',
    progressBar: 'bg-sky-600 dark:bg-sky-400',
    pdfRgb: [2, 132, 199],
  },
  plum: {
    label: 'Muted Plum',
    swatchBg: 'bg-violet-600 dark:bg-violet-400',
    softBg: 'bg-violet-50/80 dark:bg-violet-950/50',
    text: 'text-violet-800 dark:text-violet-200',
    border: 'border-violet-200 dark:border-violet-800/70',
    progressBar: 'bg-violet-600 dark:bg-violet-400',
    pdfRgb: [109, 40, 217],
  },
};

export const ACADEMIC_PROFILE = {
  program: 'Bachelor of IT, Africa International University',
  goal: "Goal: A's and B's in all 6 units · Daily 7:00 AM – 11:00 PM",
  classCutoffDate: '2026-12-04',
};

export interface ClassSession {
  dayOfWeek: number; // 1 = Mon, 2 = Tue, 3 = Wed, 5 = Fri
  code: string;
  title: string;
  startTime: string;
  endTime: string;
  mode?: string;
}

export const WEEKLY_CLASSES: ClassSession[] = [
  {
    dayOfWeek: 1,
    code: 'BIT124',
    title: 'CLASS: Computer Organization & Architecture',
    startTime: '07:00',
    endTime: '10:00',
  },
  {
    dayOfWeek: 1,
    code: 'BIT224',
    title: 'CLASS: Geographical Information Systems',
    startTime: '14:00',
    endTime: '17:00',
  },
  {
    dayOfWeek: 1,
    code: 'UCC222',
    title: 'CLASS: Introduction to Sociology (MS Teams)',
    startTime: '17:30',
    endTime: '20:30',
    mode: 'MS Teams',
  },
  {
    dayOfWeek: 2,
    code: 'BIT310',
    title: 'CLASS: Multimedia Systems (MS Teams)',
    startTime: '11:00',
    endTime: '14:00',
    mode: 'MS Teams',
  },
  {
    dayOfWeek: 3,
    code: 'BIT113',
    title: 'CLASS: Computer Support & Maintenance',
    startTime: '07:00',
    endTime: '10:00',
  },
  {
    dayOfWeek: 5,
    code: 'UCC122',
    title: 'CLASS: Introduction to Psychology (MS Teams)',
    startTime: '17:30',
    endTime: '20:30',
    mode: 'MS Teams',
  },
];

export const UNIT_STUDY_METHODS = [
  {
    code: 'BIT124 (COA)',
    method:
      'Read Stallings Ch1–18 slides, then write a one-page summary per chapter group. Practise numbers (cache mapping, binary/floating point, addressing modes) by hand. Do end-of-chapter review questions as timed mocks.',
  },
  {
    code: 'BIT224 (GIS)',
    method:
      'Build definitions and comparison tables (raster vs vector, projections, overlay vs buffer). Practise explaining each process in your own words, with an example.',
  },
  {
    code: 'BIT113 (Support & Maintenance)',
    method:
      'Learn procedures as steps and troubleshooting as symptom, cause, fix. Say each aloud as if explaining to a client.',
  },
  {
    code: 'BIT310 (Multimedia)',
    method:
      'Use MOD 1–7 slides and redo CAT 1 timed. Keep a glossary of key terms (formats, compression, tools) with a diagram for each.',
  },
  {
    code: 'UCC122 & UCC222',
    method:
      'For each topic, make a list of key terms, theorists and one example. Practise short answers and essay outlines out loud or on paper.',
  },
];

export const DAILY_STUDY_RULES = [
  'Work in 50-minute focus sessions with 10-minute rests inside each 2-hour block. Phone away during blocks.',
  'End every block with 5 minutes of recall: close the notes, write what you remember, then check.',
  'Use the 8:00 PM review every day: tick off tasks, write 3 things learned, move unfinished work to the next free block.',
  'Sleep by 11:00 PM, 7+ hours. Never trade sleep for study before an exam.',
  'If you fall behind: protect the exams that come first (BIT124, BIT224), cut revision of strong topics, never cut meals or sleep.',
];

export const EXAM_DAY_CHECKLIST = [
  'Student ID and exam card',
  '2+ pens, pencil, and eraser',
  'Calculator (only if the unit allows it)',
  'Water bottle',
  'Confirm the venue on the notice board or student portal the day before',
  'Arrive 30 minutes early; read all instructions, plan time per question, and do not discuss the paper between exams',
];

export function createOfficialExams(): Exam[] {
  return [
    {
      id: 'exam-bit124',
      code: 'BIT124',
      title: 'Computer Organization and Architecture',
      date: '2026-12-07',
      startTime: '09:00',
      endTime: '11:00',
      venue: '',
      invigilator: 'Mr. James Iraya',
      chiefInvigilator: 'Ms. Monicah Hinga',
      color: 'teal',
      studyHoursTarget: 58,
      tasks: [
        {
          id: 't-bit124-p1-a',
          title: 'Pass 1 Ch 4–7: Cache mapping, Internal/External memory & I/O (DMA, interrupts)',
          dueDate: '2026-11-26',
          completed: false,
        },
        {
          id: 't-bit124-p1-b',
          title: 'Pass 1 Ch 8–13: OS support, arithmetic (10 problems), instruction sets, pipelining, RISC/CISC',
          dueDate: '2026-11-28',
          completed: false,
        },
        {
          id: 't-bit124-p1-c',
          title: 'Pass 1 Ch 14–18: ILP, control unit, multicore + 1-page summaries (Ch1–6, 7–13, 14–18)',
          dueDate: '2026-11-29',
          completed: false,
        },
        {
          id: 't-bit124-p2',
          title: 'Pass 2 Ch 1–18: Redo cache & numerical problems + timed 2h mock & formula sheet',
          dueDate: '2026-12-05',
          completed: false,
        },
      ],
    },
    {
      id: 'exam-bit224',
      code: 'BIT224',
      title: 'Geographical Information Systems',
      date: '2026-12-07',
      startTime: '14:00',
      endTime: '16:00',
      venue: '',
      invigilator: 'Mr. James Iraya',
      chiefInvigilator: 'Ms. Monicah Hinga',
      color: 'sage',
      studyHoursTarget: 24,
      tasks: [
        {
          id: 't-bit224-notes',
          title: 'Collect BIT224 notes/textbook from lecturer or classmates & list syllabus topics',
          dueDate: '2026-11-25',
          completed: false,
        },
        {
          id: 't-bit224-1',
          title: 'GIS fundamentals: components, raster vs vector data models & comparison table',
          dueDate: '2026-11-27',
          completed: false,
        },
        {
          id: 't-bit224-2',
          title: 'Coordinate systems, map projections, GPS/remote sensing & spatial analysis (overlay, buffer)',
          dueDate: '2026-12-01',
          completed: false,
        },
        {
          id: 't-bit224-3',
          title: 'Timed 2h GIS mock, fix weak areas & final one-page GIS summary',
          dueDate: '2026-12-05',
          completed: false,
        },
      ],
    },
    {
      id: 'exam-bit113',
      code: 'BIT113',
      title: 'Computer Support and Maintenance',
      date: '2026-12-09',
      startTime: '09:00',
      endTime: '11:00',
      venue: '',
      invigilator: 'Mr. David Gitau',
      chiefInvigilator: 'Ms. Monicah Hinga',
      color: 'amber',
      studyHoursTarget: 30,
      tasks: [
        {
          id: 't-bit113-1',
          title: 'Notes Pass 1: First & second half of course outline + tidy class notes summary',
          dueDate: '2026-11-29',
          completed: false,
        },
        {
          id: 't-bit113-2',
          title: 'Notes Pass 2: Hardware, BIOS/POST, OS installation, drivers & troubleshooting scenarios',
          dueDate: '2026-12-03',
          completed: false,
        },
        {
          id: 't-bit113-3',
          title: 'Preventive maintenance, peripherals, networking basics & explain procedures aloud',
          dueDate: '2026-12-08',
          completed: false,
        },
        {
          id: 't-bit113-4',
          title: 'Timed 2h mock (symptom, cause, fix) + light recall before exam morning',
          dueDate: '2026-12-08',
          completed: false,
        },
      ],
    },
    {
      id: 'exam-ucc122',
      code: 'UCC122',
      title: 'Introduction To Psychology (Group A&C)',
      date: '2026-12-14',
      startTime: '14:00',
      endTime: '16:00',
      venue: '',
      invigilator: "Mrs. Lucy Kang'ethe",
      chiefInvigilator: 'Prof. Niceta Ireri',
      color: 'indigo',
      studyHoursTarget: 24,
      tasks: [
        {
          id: 't-ucc122-notes',
          title: 'Collect UCC122 outline/notes & read intro, research methods, biological bases',
          dueDate: '2026-11-27',
          completed: false,
        },
        {
          id: 't-ucc122-1',
          title: 'Sensation, perception, learning, memory, cognition, motivation & emotion',
          dueDate: '2026-12-10',
          completed: false,
        },
        {
          id: 't-ucc122-2',
          title: 'Development, personality, disorders & therapy, social psychology summaries',
          dueDate: '2026-12-11',
          completed: false,
        },
        {
          id: 't-ucc122-3',
          title: 'Key theorists/terms sheet & timed practice: 2 essay questions + short answers',
          dueDate: '2026-12-13',
          completed: false,
        },
      ],
    },
    {
      id: 'exam-bit310',
      code: 'BIT310',
      title: 'Multimedia Systems',
      date: '2026-12-15',
      startTime: '09:00',
      endTime: '11:00',
      venue: '',
      invigilator: 'Dr. Nicodemus Ishmael',
      chiefInvigilator: 'Ms. Monicah Hinga',
      color: 'plum',
      studyHoursTarget: 21,
      tasks: [
        {
          id: 't-bit310-1',
          title: 'MOD 1–3: Re-read slides/notes and build concise module summaries',
          dueDate: '2026-12-10',
          completed: false,
        },
        {
          id: 't-bit310-2',
          title: 'MOD 4–7: Re-read slides/notes and build glossary (formats, compression, tools + diagrams)',
          dueDate: '2026-12-11',
          completed: false,
        },
        {
          id: 't-bit310-3',
          title: 'Redo CAT 1 under timed conditions, mark & fix weak areas across MOD 1–7',
          dueDate: '2026-12-12',
          completed: false,
        },
        {
          id: 't-bit310-4',
          title: 'Final MOD 1–7 recall: key terms, compression diagrams & CAT-style questions',
          dueDate: '2026-12-14',
          completed: false,
        },
      ],
    },
    {
      id: 'exam-ucc222',
      code: 'UCC222',
      title: 'Introduction To Sociology (Group A&C)',
      date: '2026-12-16',
      startTime: '09:00',
      endTime: '11:00',
      venue: '',
      invigilator: 'Dr. Alice Waruingi',
      chiefInvigilator: 'Dr. Francisca Ngala',
      color: 'sky',
      studyHoursTarget: 17,
      tasks: [
        {
          id: 't-ucc222-1',
          title: 'Read syllabus, list all topics & review Functionalism, Conflict, Interactionism + culture',
          dueDate: '2026-12-10',
          completed: false,
        },
        {
          id: 't-ucc222-2',
          title: 'Socialization, social structure, stratification, family, religion, education & deviance',
          dueDate: '2026-12-11',
          completed: false,
        },
        {
          id: 't-ucc222-3',
          title: 'Consolidate Sociology summary sheets & 1 essay outline per major topic',
          dueDate: '2026-12-13',
          completed: false,
        },
        {
          id: 't-ucc222-4',
          title: 'Practise essay outlines, short answers & final weak-spot recall',
          dueDate: '2026-12-15',
          completed: false,
        },
      ],
    },
  ];
}
