import {
  ACADEMIC_PROFILE,
  WEEKLY_CLASSES,
} from '../data/initialExams';
import { DailyTimeBlock, DaySchedule, Exam } from '../types/exam';
import {
  addDays,
  diffDays,
  formatTimeRange,
  getDateRangeKeys,
  getTodayKey,
  parseDateKey,
  sortExamsChronologically,
} from './dateUtils';

interface CurriculumBlueprintEntry {
  blocks: Array<{
    startTime: string;
    endTime: string;
    title: string;
    subtitle: string;
    category: DailyTimeBlock['category'];
    examCode?: string;
  }>;
}

// Specific daily study blocks aligned with the Nov 25 – Dec 16 PDF study plan
const CURRICULUM_BY_DATE: Record<string, CurriculumBlueprintEntry> = {
  '2026-11-25': {
    blocks: [
      {
        startTime: '10:30',
        endTime: '12:30',
        title: 'BIT124 — Ch4: Cache Memory',
        subtitle: 'Mapping, replacement policies & write policy (Stallings)',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:30',
        endTime: '13:30',
        title: 'Lunch and rest',
        subtitle: 'Proper midday break away from study notes',
        category: 'routine',
      },
      {
        startTime: '13:30',
        endTime: '15:30',
        title: 'BIT124 — Cache Mapping Practice + Ch5 Internal Memory',
        subtitle: 'Work cache mapping numericals by hand and read Ch5 slides',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '15:30',
        endTime: '16:00',
        title: 'Break: walk & snack',
        subtitle: 'Fresh air and hydration',
        category: 'break',
      },
      {
        startTime: '16:00',
        endTime: '17:30',
        title: 'BIT224 — Gather GIS Notes & List Syllabus Topics',
        subtitle: 'Ask lecturer/classmates for notes, read intro & map syllabus',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Light movement and evening meal',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT113 — Tidy Class Notes into One-Page Summary',
        subtitle: 'Consolidate today’s BIT113 lecture points into clean steps',
        category: 'study',
        examCode: 'BIT113',
      },
    ],
  },
  '2026-11-26': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Ch5–6: Internal & External Memory',
        subtitle: 'RAM types, RAID levels, optical & tape storage (Stallings)',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: '15-minute reset',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT124 — Ch7: Input/Output (I/O Modules, DMA, Interrupts)',
        subtitle: 'Trace programmed I/O, interrupt-driven I/O & DMA cycles',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying during lunch',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT224 — GIS Fundamentals',
        subtitle: 'What GIS is, core components, raster vs vector data models',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Step outside briefly',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT113 — Notes Pass 1: First Half of Course Outline',
        subtitle: 'Hardware components, assembly & BIOS/POST procedures',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Balanced meal and movement',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT124 — Active Recall Ch1–7',
        subtitle: 'Close slides, write everything remembered, then check gaps',
        category: 'study',
        examCode: 'BIT124',
      },
    ],
  },
  '2026-11-27': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Ch8: Operating System Support',
        subtitle: 'Scheduling, memory management & paging/segmentation',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break',
        subtitle: 'Short stretch and water',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT124 — Ch9: Computer Arithmetic',
        subtitle: "Binary, two's complement, floating point — work 10 problems by hand",
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and rest',
        subtitle: 'Full screen-free break',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT224 — Coordinate Systems, Projections & Data Capture',
        subtitle: 'Map projections, GPS & remote sensing comparison table',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack',
        subtitle: 'Recharge before afternoon prep',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:00',
        title: 'UCC122 — Get Outline/Notes & Read Topic 1',
        subtitle: 'Collect UCC122 notes; read intro & research methods',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '17:00',
        endTime: '17:30',
        title: 'Light dinner & log on to MS Teams',
        subtitle: 'Prepare for evening UCC122 class',
        category: 'routine',
      },
    ],
  },
  '2026-11-28': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Ch10–11: Instruction Sets',
        subtitle: 'Characteristics, addressing modes & instruction formats',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Short pause',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT124 — Ch12: Processor Structure & Function',
        subtitle: 'Registers, instruction cycle & pipelining hazards',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT124 — Ch13: RISC vs CISC',
        subtitle: 'Compare architectures, register windows & compiler trade-offs',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Step outside',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT224 — Spatial Analysis & Applications',
        subtitle: 'Overlay, buffering, spatial queries & real-world GIS examples',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening meal & stretch',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT124 — Active Recall Ch8–13',
        subtitle: 'Closed-book summary check & addressing-mode drills',
        category: 'study',
        examCode: 'BIT124',
      },
    ],
  },
  '2026-11-29': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Ch14: Instruction-Level Parallelism & Superscalar',
        subtitle: 'Superscalar execution, branch prediction & dependencies',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Quick refresh',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT124 — Ch15–16: Control Unit & Microprogrammed Control',
        subtitle: 'Hardwired vs microprogrammed control signals',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'Rest away from screens',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT124 — Ch17–18: Parallel Processing & Multicore',
        subtitle: 'SMP, cache coherence & multicore organization',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Short outdoor walk',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT124 — Finish Pass 1 Summaries (Ch1–6, 7–13, 14–18)',
        subtitle: 'Create one-page summary sheet for each chapter group',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening break',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT113 — Notes Pass 1: Second Half of Outline + Recall',
        subtitle: 'Weekly check: verify Pass 1 of BIT124 is complete',
        category: 'study',
        examCode: 'BIT113',
      },
    ],
  },
  '2026-11-30': {
    blocks: [
      {
        startTime: '10:30',
        endTime: '12:30',
        title: 'BIT124 — Pass 2, Ch1–5',
        subtitle: 'Read summaries, redo cache problems & fix weak gaps',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:30',
        endTime: '13:30',
        title: 'Lunch and rest',
        subtitle: 'Midday pause',
        category: 'routine',
      },
      {
        startTime: '13:30',
        endTime: '14:00',
        title: 'BIT224 — Skim Last Week’s GIS Notes Before Class',
        subtitle: 'Quick 30-min pre-class warm-up',
        category: 'study',
        examCode: 'BIT224',
      },
    ],
  },
  '2026-12-01': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Pass 2, Ch6–11: Numerical Practice',
        subtitle: 'Arithmetic, two’s complement, floating point & addressing modes',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break',
        subtitle: 'Short stretch',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '11:00',
        title: 'BIT310 — Pre-Class: Skim MOD Slides & Write 3 Questions',
        subtitle: 'Prepare for 11 AM Multimedia Systems class',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '14:00',
        endTime: '15:00',
        title: 'Lunch and rest',
        subtitle: 'Screen break after MS Teams class',
        category: 'routine',
      },
      {
        startTime: '15:00',
        endTime: '17:00',
        title: 'BIT224 — GIS Summary Sheet',
        subtitle: 'Condense data models, projections & spatial analysis onto 1 page',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '17:00',
        endTime: '18:30',
        title: 'Dinner, exercise, rest',
        subtitle: 'Movement and dinner',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT113 — Notes Pass 2 + Practise Explaining Topics Aloud',
        subtitle: 'Explain procedures step-by-step as if to a client',
        category: 'study',
        examCode: 'BIT113',
      },
    ],
  },
  '2026-12-02': {
    blocks: [
      {
        startTime: '10:30',
        endTime: '12:30',
        title: 'BIT124 — Pass 2, Ch12–18',
        subtitle: 'Pipelining, RISC vs CISC, control unit & multicore parallelism',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:30',
        endTime: '13:30',
        title: 'Lunch and rest',
        subtitle: 'Midday pause',
        category: 'routine',
      },
      {
        startTime: '13:30',
        endTime: '15:30',
        title: 'BIT224 — GIS Practice Questions',
        subtitle: 'Define, compare (raster vs vector, overlay vs buffer) & apply',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '15:30',
        endTime: '16:00',
        title: 'Break: walk, snack',
        subtitle: 'Fresh air',
        category: 'break',
      },
      {
        startTime: '16:00',
        endTime: '17:30',
        title: 'BIT113 — Hardware & OS Topics + Troubleshooting Scenarios',
        subtitle: 'Practise symptom → cause → fix drills',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening meal and rest',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT124 — Active Recall Ch1–18 Using Summary Pages',
        subtitle: 'Closed-book sweep of all 18 chapters',
        category: 'study',
        examCode: 'BIT124',
      },
    ],
  },
  '2026-12-03': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — TIMED MOCK (2 hrs)',
        subtitle: 'End-of-chapter review questions & problems under exam timing',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Short breather between mocks',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT224 — TIMED MOCK (2 hrs) on GIS',
        subtitle: 'Write full answers, then mark against notes',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT113 — Revision + Timed Mock (2 hrs)',
        subtitle: 'Full 2-hour practice paper',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Reset after mocks',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT124 — Fix Weak Areas Found in Mock',
        subtitle: 'Rework missed numericals and diagrams',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening recharge',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT224 — Mixed Recall: BIT124 + BIT224 Flashcards',
        subtitle: 'Rapid definitions & formula check',
        category: 'study',
        examCode: 'BIT224',
      },
    ],
  },
  '2026-12-04': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Weak Areas + Key Formulas / Definitions Sheet',
        subtitle: 'Last day of normal classes — lock down formulas',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break',
        subtitle: 'Stretch & hydrate',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT224 — Weak Areas + Final One-Page GIS Summary',
        subtitle: 'Tighten comparisons and examples',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and rest',
        subtitle: 'Midday rest',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT113 — Revision: Topics 1 to Half of Outline',
        subtitle: 'Steady consolidation',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack',
        subtitle: 'Fresh air',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:00',
        title: 'UCC122 — Catch Up on Notes; Read & Summarise 2 Topics',
        subtitle: 'Prepare before evening Psychology class',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '17:00',
        endTime: '17:30',
        title: 'Light dinner & log on to MS Teams',
        subtitle: 'Ready for 5:30 PM UCC122 class',
        category: 'routine',
      },
    ],
  },
  '2026-12-05': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Full Revision Ch1–9 Using Summary Sheets',
        subtitle: 'No cramming new material; reinforce core logic & cache',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: '15-minute pause',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT124 — Full Revision Ch10–18 Using Summary Sheets',
        subtitle: 'Instruction sets, pipelining, RISC/CISC & multicore',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT224 — Final Full Revision of GIS (All Topics)',
        subtitle: 'No new material — definitions, projections, spatial analysis',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Outdoor reset',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT113 — Revision + Mini Mock',
        subtitle: 'Keep hardware & maintenance warm',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Meal and light stretch',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT124 — Mixed Recall: 124 / 224 / 113 Key Points',
        subtitle: 'Fast active recall across first-week exams',
        category: 'study',
        examCode: 'BIT124',
      },
    ],
  },
  '2026-12-06': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT124 — Final Read of Summary Sheets Ch1–9',
        subtitle: 'Eve of first exam: key points and formulas only (light revision)',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break',
        subtitle: 'Hydrate and relax',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT224 — Final GIS Review: Definitions, Processes, Comparisons',
        subtitle: 'Calm skim only — no new topics',
        category: 'study',
        examCode: 'BIT224',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and rest',
        subtitle: 'Relaxed midday meal',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '14:30',
        title: 'BIT124 — Final Read Ch10–18 Key Points + Quick Warm-up',
        subtitle: 'Quick problem warm-up for confidence',
        category: 'study',
        examCode: 'BIT124',
      },
      {
        startTime: '14:30',
        endTime: '15:30',
        title: 'Break: walk or short nap',
        subtitle: 'Keep energy steady for tomorrow’s double exam',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:00',
        title: 'BIT113 — Light Skim of BIT113 Summary',
        subtitle: 'Quick touch — main BIT113 day is Tuesday',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '17:00',
        endTime: '18:00',
        title: 'Pack Exam Bag & Confirm Venue',
        subtitle: 'Student ID, exam card, 2+ pens, water. Check notice board/portal',
        category: 'routine',
      },
      {
        startTime: '18:00',
        endTime: '19:00',
        title: 'Dinner',
        subtitle: 'Nutritious early dinner',
        category: 'routine',
      },
      {
        startTime: '19:00',
        endTime: '20:00',
        title: 'BIT224 — Light Recall Only; Stop New Learning',
        subtitle: 'Close books at 8:00 PM',
        category: 'study',
        examCode: 'BIT224',
      },
    ],
  },
  '2026-12-08': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT113 — Topics 1: Hardware, Assembly & BIOS/POST',
        subtitle: 'Full day for BIT113 (exam tomorrow) per course outline',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Short pause',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'BIT113 — Topics 2: OS Installation, Drivers & Troubleshooting',
        subtitle: 'Practise symptom → cause → fix aloud',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT113 — Topics 3: Preventive Maintenance, Peripherals & Safety',
        subtitle: 'Networking basics & ESD protocols',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Reset before timed mock',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT113 — TIMED MOCK (2 hrs) + Fix Weak Spots',
        subtitle: 'Full simulated paper',
        category: 'study',
        examCode: 'BIT113',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening meal & stretch',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT113 — Light Recall Only, Then Early Night',
        subtitle: 'Confirm venue & pack exam card',
        category: 'study',
        examCode: 'BIT113',
      },
    ],
  },
  '2026-12-10': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'UCC122 — Psychology: Sensation, Perception, Learning',
        subtitle: 'Key concepts, experiments & classical/operant conditioning',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Short pause',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'UCC122 — Psychology: Memory, Cognition, Motivation & Emotion',
        subtitle: 'Summarize stages & theories with examples',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT310 — MOD 1–3: Re-read Slides & Make Summaries',
        subtitle: 'Build glossary terms & diagrams for MOD 1–3',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Fresh air',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT310 — MOD 4–5: Re-read Slides & Make Summaries',
        subtitle: 'Image, audio, formats & compression foundations',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening meal & stretch',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'UCC222 — Sociology: Perspectives & Culture',
        subtitle: 'Functionalism, Conflict, Interactionism & culture examples',
        category: 'study',
        examCode: 'UCC222',
      },
    ],
  },
  '2026-12-11': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'UCC222 — Sociology: Socialization, Structure & Stratification',
        subtitle: 'List key terms, theorists & one example per topic',
        category: 'study',
        examCode: 'UCC222',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Short pause',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'UCC222 — Sociology: Family, Religion, Education, Deviance',
        subtitle: 'Social institutions & social change essay points',
        category: 'study',
        examCode: 'UCC222',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT310 — MOD 6–7: Re-read Slides & Make Summaries',
        subtitle: 'Complete all MOD 1–7 summary notes & glossary',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Step outside',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'UCC122 — Psychology: Development, Personality, Therapy, Social',
        subtitle: 'Complete remaining Psychology syllabus topics',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening break',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'BIT310 — Active Recall MOD 1–7',
        subtitle: 'Test glossary terms & diagrams from memory',
        category: 'study',
        examCode: 'BIT310',
      },
    ],
  },
  '2026-12-12': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'BIT310 — Redo CAT 1 Under Timed Conditions',
        subtitle: 'Mark answers and log weak areas across MOD 1–7',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: '15-minute reset',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'UCC122 — Consolidate Psychology',
        subtitle: 'Key theorists, terms & practice essay questions',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'UCC222 — Consolidate Sociology',
        subtitle: 'Key concepts & practice essay outlines',
        category: 'study',
        examCode: 'UCC222',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Fresh air',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'BIT310 — Weak Areas from CAT 1 + MOD Summaries',
        subtitle: 'Fix missed questions and redraw key diagrams',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening meal & stretch',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'UCC122 — Active Recall: Psychology Summary Sheet',
        subtitle: 'Closed-book theorist & term recall',
        category: 'study',
        examCode: 'UCC122',
      },
    ],
  },
  '2026-12-13': {
    blocks: [
      {
        startTime: '07:45',
        endTime: '09:45',
        title: 'UCC122 — Final Review: Summary Sheet, Key Terms & Theorists',
        subtitle: 'UCC122 exam tomorrow at 2:00 PM',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '09:45',
        endTime: '10:00',
        title: 'Break: stretch, water',
        subtitle: 'Short pause',
        category: 'break',
      },
      {
        startTime: '10:00',
        endTime: '12:00',
        title: 'UCC122 — Timed Practice: 2 Essay Questions + Short Answers',
        subtitle: 'Practise structuring clear psychology arguments',
        category: 'study',
        examCode: 'UCC122',
      },
      {
        startTime: '12:00',
        endTime: '13:00',
        title: 'Lunch and proper rest',
        subtitle: 'No phone studying',
        category: 'routine',
      },
      {
        startTime: '13:00',
        endTime: '15:00',
        title: 'BIT310 — Final Recall MOD 1–7, Key Terms & Diagrams',
        subtitle: 'Keep Multimedia sharp before Tuesday morning paper',
        category: 'study',
        examCode: 'BIT310',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        title: 'Break: walk, snack, fresh air',
        subtitle: 'Fresh air',
        category: 'break',
      },
      {
        startTime: '15:30',
        endTime: '17:30',
        title: 'UCC222 — Summary Sheet + 1 Essay Outline per Major Topic',
        subtitle: 'Build rapid-recall sociology outlines',
        category: 'study',
        examCode: 'UCC222',
      },
      {
        startTime: '17:30',
        endTime: '18:30',
        title: 'Dinner and exercise / free time',
        subtitle: 'Evening meal',
        category: 'routine',
      },
      {
        startTime: '18:30',
        endTime: '20:00',
        title: 'UCC122 — Light Recall & Pack Exam Bag for Tomorrow',
        subtitle: 'Confirm venue, ID & exam card',
        category: 'study',
        examCode: 'UCC122',
      },
    ],
  },
};

function getPhaseLabel(dateKey: string, sortedExams: Exam[]): string {
  if (dateKey <= '2026-11-29') return 'Phase 1: Foundation';
  if (dateKey <= '2026-12-06') return 'Phase 2: Consolidation & Practice';
  if (dateKey <= '2026-12-09') return 'Phase 3: Exam Days (First Week)';
  const firstExam = sortedExams[0]?.date;
  if (firstExam && dateKey < firstExam) {
    return diffDays(dateKey, firstExam) <= 7
      ? 'Phase 2: Consolidation & Practice'
      : 'Phase 1: Foundation';
  }
  return 'Phase 4: Final Stretch';
}

function pickTaskHint(exam: Exam, dayIndex: number): string {
  const pending = exam.tasks.filter((t) => !t.completed);
  if (pending.length > 0) {
    return pending[dayIndex % pending.length].title;
  }
  if (exam.tasks.length > 0) {
    return exam.tasks[dayIndex % exam.tasks.length].title;
  }
  return 'Core concepts, active recall & timed past-paper questions';
}

function selectFocusExam(
  ranked: Exam[],
  dateKey: string,
  slotIndex: number,
  dayOffset: number
): Exam | undefined {
  if (ranked.length === 0) return undefined;
  const futureAfterToday = ranked.filter((e) => e.date > dateKey);
  const pool = futureAfterToday.length > 0 ? futureAfterToday : ranked;

  const tomorrow = pool.filter((e) => diffDays(dateKey, e.date) === 1);
  if (tomorrow.length > 0 && (slotIndex === 0 || slotIndex === 2)) {
    return tomorrow[(dayOffset + slotIndex) % tomorrow.length];
  }

  const urgent = pool.filter((e) => diffDays(dateKey, e.date) <= 4);
  if (urgent.length > 0 && slotIndex <= 1) {
    return urgent[(dayOffset + slotIndex) % urgent.length];
  }

  const topWindow = pool.slice(0, Math.min(4, pool.length));
  return topWindow[(dayOffset + slotIndex) % topWindow.length];
}

function getClassesForDate(dateKey: string, includeClasses: boolean) {
  if (!includeClasses || dateKey > ACADEMIC_PROFILE.classCutoffDate) return [];
  const d = parseDateKey(dateKey);
  const dow = d.getDay(); // 0=Sun..6=Sat
  return WEEKLY_CLASSES.filter((c) => c.dayOfWeek === dow);
}

function isOfficialExamMatch(
  examsOnDay: Exam[],
  dateKey: string
): { exactDoubleExam: boolean; exactBit113: boolean; exactUcc122: boolean; exactBit310: boolean; exactUcc222: boolean } {
  return {
    exactDoubleExam:
      dateKey === '2026-12-07' &&
      examsOnDay.some((e) => e.code === 'BIT124') &&
      examsOnDay.some((e) => e.code === 'BIT224'),
    exactBit113:
      dateKey === '2026-12-09' && examsOnDay.some((e) => e.code === 'BIT113'),
    exactUcc122:
      dateKey === '2026-12-14' && examsOnDay.some((e) => e.code === 'UCC122'),
    exactBit310:
      dateKey === '2026-12-15' && examsOnDay.some((e) => e.code === 'BIT310'),
    exactUcc222:
      dateKey === '2026-12-16' && examsOnDay.some((e) => e.code === 'UCC222'),
  };
}

export function buildDailySchedule(
  dateKey: string,
  allExams: Exam[],
  dayOffset: number,
  includeClasses = true
): DaySchedule {
  const sortedExams = sortExamsChronologically(allExams);
  const examsOnDay = sortedExams.filter((e) => e.date === dateKey);
  const classesToday = getClassesForDate(dateKey, includeClasses);
  const phase = getPhaseLabel(dateKey, sortedExams);
  const ranked = sortedExams.filter((e) => e.date >= dateKey);
  const effectiveRanked = ranked.length > 0 ? ranked : sortedExams;

  const blocks: DailyTimeBlock[] = [];
  const pushBlock = (
    startTime: string,
    endTime: string,
    title: string,
    subtitle: string,
    category: DailyTimeBlock['category'],
    examId?: string,
    examCode?: string
  ) => {
    blocks.push({
      id: `${dateKey}_${startTime}`,
      startTime,
      endTime,
      title,
      subtitle,
      category,
      examId,
      examCode,
    });
  };

  const hasMorningClass = classesToday.find((c) => c.startTime === '07:00');
  const hasEveningClass = classesToday.find((c) => c.startTime === '17:30');
  const officialFlags = isOfficialExamMatch(examsOnDay, dateKey);
  const laterExams = sortedExams.filter((e) => e.date > dateKey);
  const isFinalDay = examsOnDay.length > 0 && laterExams.length === 0;

  // 1. EXAM DAY FLOWS (handles both exact official exam days and custom/spread exam days!)
  if (examsOnDay.length > 0) {
    const morningExam = examsOnDay.find((e) => Number(e.startTime.split(':')[0]) < 13);
    const afternoonExam = examsOnDay.find((e) => Number(e.startTime.split(':')[0]) >= 13);

    pushBlock(
      '07:00',
      '07:45',
      'Wake up, breakfast & check exam card / ID / pens',
      'Confirm venue on notice board or portal; eat a steady breakfast',
      'routine'
    );

    if (morningExam) {
      if (morningExam.startTime > '07:45') {
        pushBlock(
          '07:45',
          '08:30',
          `${morningExam.code} — Light Skim`,
          'Formula sheet, key terms & diagrams only — no new material',
          'review',
          morningExam.id,
          morningExam.code
        );
        if (morningExam.startTime > '08:30') {
          pushBlock(
            '08:30',
            morningExam.startTime,
            'Travel and settle at the venue',
            `Arrive 30 minutes early${morningExam.venue ? ` · Venue: ${morningExam.venue}` : ' · Confirm venue on notice board/portal'}`,
            'routine'
          );
        }
      }
      pushBlock(
        morningExam.startTime,
        morningExam.endTime,
        `EXAM: ${morningExam.code} — ${morningExam.title}`,
        `Invigilator: ${morningExam.invigilator || 'TBA'} · Chief: ${morningExam.chiefInvigilator || 'TBA'}${morningExam.venue ? ` · Venue: ${morningExam.venue}` : ''}`,
        'exam',
        morningExam.id,
        morningExam.code
      );
    } else if (afternoonExam) {
      pushBlock(
        '07:45',
        '09:45',
        `${afternoonExam.code} — Final Review: Summary Sheet & Key Terms`,
        'Review condensed summary pages and key concepts',
        'study',
        afternoonExam.id,
        afternoonExam.code
      );
      pushBlock('09:45', '10:00', 'Break', 'Stretch and hydrate', 'break');
      pushBlock(
        '10:00',
        '12:00',
        `${afternoonExam.code} — Short Answers & Essay Plans`,
        'Light practice then stop new content at noon',
        'study',
        afternoonExam.id,
        afternoonExam.code
      );
      pushBlock('12:00', '13:00', 'Lunch and rest', 'Balanced meal before afternoon sitting', 'routine');
    }

    // Midday between morning & afternoon exam, or after morning exam
    if (morningExam && afternoonExam) {
      pushBlock(
        morningExam.endTime,
        '12:00',
        'Decompress & snack',
        'No post-mortem — the next exam matters now',
        'break'
      );
      pushBlock(
        '12:00',
        '13:30',
        `${afternoonExam.code} — Final Review`,
        'Summary sheet, key definitions and processes',
        'study',
        afternoonExam.id,
        afternoonExam.code
      );
      pushBlock(
        '13:30',
        afternoonExam.startTime,
        'Light lunch, travel and settle at the venue',
        afternoonExam.venue ? `Venue: ${afternoonExam.venue}` : 'Confirm venue & arrive early',
        'routine'
      );
      pushBlock(
        afternoonExam.startTime,
        afternoonExam.endTime,
        `EXAM: ${afternoonExam.code} — ${afternoonExam.title}`,
        `Invigilator: ${afternoonExam.invigilator || 'TBA'} · Chief: ${afternoonExam.chiefInvigilator || 'TBA'}${afternoonExam.venue ? ` · Venue: ${afternoonExam.venue}` : ''}`,
        'exam',
        afternoonExam.id,
        afternoonExam.code
      );
    } else if (!morningExam && afternoonExam) {
      pushBlock(
        '13:00',
        '13:30',
        `${afternoonExam.code} — Final Skim (One-Page Summary Only)`,
        'Calm final glance only',
        'review',
        afternoonExam.id,
        afternoonExam.code
      );
      pushBlock(
        '13:30',
        afternoonExam.startTime,
        'Travel and settle at the venue',
        afternoonExam.venue ? `Venue: ${afternoonExam.venue}` : 'Arrive early & confirm venue',
        'routine'
      );
      pushBlock(
        afternoonExam.startTime,
        afternoonExam.endTime,
        `EXAM: ${afternoonExam.code} — ${afternoonExam.title}`,
        `Invigilator: ${afternoonExam.invigilator || 'TBA'} · Chief: ${afternoonExam.chiefInvigilator || 'TBA'}${afternoonExam.venue ? ` · Venue: ${afternoonExam.venue}` : ''}`,
        'exam',
        afternoonExam.id,
        afternoonExam.code
      );
    }

    // Post-exam blocks
    if (isFinalDay && !afternoonExam) {
      pushBlock(
        morningExam ? morningExam.endTime : '11:00',
        '23:00',
        'You are done! Celebrate, rest & sleep in',
        'Last exam finished — well done on the whole semester',
        'freetime'
      );
    } else if (isFinalDay && afternoonExam) {
      pushBlock(
        afternoonExam.endTime,
        '23:00',
        'You are done! Celebrate, rest & unwind',
        'Last exam finished — well done on the whole semester',
        'freetime'
      );
    } else if (officialFlags.exactBit113) {
      pushBlock('11:00', '12:00', 'Decompress & snack', 'No post-mortem', 'break');
      pushBlock('12:00', '13:00', 'Lunch and proper rest', 'No studying over lunch', 'routine');
      pushBlock('13:00', '15:00', 'UCC122 — Psychology: Intro, Research Methods & Biological Bases', 'Start Phase 4 steady preparation', 'study', undefined, 'UCC122');
      pushBlock('15:00', '15:30', 'Break: walk, snack', 'Fresh air', 'break');
      pushBlock('15:30', '17:30', 'BIT310 — Multimedia: Re-read MOD 1–2 & Summarize', 'Core concepts & diagrams', 'study', undefined, 'BIT310');
      pushBlock('17:30', '18:30', 'Dinner and rest', 'Balanced meal', 'routine');
      pushBlock('18:30', '20:00', 'UCC222 — Sociology: Read Syllabus & List All Topics', 'Map key theorists', 'study', undefined, 'UCC222');
      pushBlock('20:00', '20:30', 'Daily review: tick off tasks, write 3 things learned, plan tomorrow', 'Reflect and organize tomorrow', 'review');
      pushBlock('20:30', '22:00', 'Free time: piano / singing, relax', 'Screens off by 22:00', 'freetime');
      pushBlock('22:00', '23:00', 'Wind down, lights out by 23:00', 'Rest well', 'rest');
    } else if (officialFlags.exactBit310) {
      pushBlock('11:00', '12:00', 'Decompress & snack', 'No post-mortem', 'break');
      pushBlock('12:00', '13:00', 'Lunch and rest', 'Midday recovery', 'routine');
      pushBlock('13:00', '15:00', 'UCC222 — Sociology: Read Summary Sheets, Key Concepts & Theorists', 'UCC222 is your final exam tomorrow at 9 AM', 'study', undefined, 'UCC222');
      pushBlock('15:00', '15:30', 'Break', 'Short walk & water', 'break');
      pushBlock('15:30', '17:30', 'UCC222 — Practice Essay Outlines & Short Answers', 'Outline major topics clearly', 'study', undefined, 'UCC222');
      pushBlock('17:30', '18:30', 'Dinner and rest', 'Relaxed dinner', 'routine');
      pushBlock('18:30', '20:00', 'UCC222 — Active Recall & Last Look at Weak Spots', 'Final check before packing bag', 'study', undefined, 'UCC222');
      pushBlock('20:00', '20:30', 'Pack exam bag, set out tomorrow & quick review', 'ID, exam card, pens ready', 'review');
      pushBlock('20:30', '22:00', 'Calm down: piano / singing', 'Relax and unwind', 'freetime');
      pushBlock('22:00', '23:00', 'Early night, lights out by 23:00', 'Sleep for sharp recall tomorrow', 'rest');
    } else if (officialFlags.exactDoubleExam) {
      pushBlock('16:00', '17:30', 'Rest: eat, walk, nap', 'You completed two exams today — recharge properly', 'break');
      pushBlock('17:30', '19:00', 'BIT113 — Revision: Summary Pages & Key Procedures', 'Shift focus to Wednesday morning BIT113', 'study', undefined, 'BIT113');
      pushBlock('19:00', '19:45', 'Dinner', 'Nourishing evening meal', 'routine');
      pushBlock('19:45', '21:15', 'BIT113 — Active Recall + Troubleshooting Scenarios', 'Symptom, cause, fix practice', 'study', undefined, 'BIT113');
      pushBlock('21:15', '21:30', 'Quick review & set out tomorrow', 'Plan Tuesday full BIT113 day', 'review');
      pushBlock('21:30', '23:00', 'Relax, lights out by 23:00', 'Full rest', 'freetime');
    } else if (officialFlags.exactUcc122) {
      pushBlock('16:00', '17:30', 'Rest and decompress', 'Reset after afternoon exam', 'break');
      pushBlock('17:30', '19:00', 'BIT310 — Recall: MOD 1–7, Definitions & Diagrams', 'BIT310 exam is tomorrow at 9:00 AM', 'study', undefined, 'BIT310');
      pushBlock('19:00', '19:45', 'Dinner', 'Evening meal', 'routine');
      pushBlock('19:45', '21:00', 'BIT310 — CAT-Style Questions + Weak Spots', 'Focused review of tricky MOD 1–7 topics', 'study', undefined, 'BIT310');
      pushBlock('21:00', '21:30', 'Review and plan tomorrow', 'Pack exam bag for 9 AM sitting', 'review');
      pushBlock('21:30', '23:00', 'Relax, lights out by 23:00', 'Rest well', 'freetime');
    } else {
      // Generic post-exam flow for rescheduled/custom exam dates
      const nextPaper = laterExams[0];
      const latestEnd = afternoonExam ? afternoonExam.endTime : morningExam!.endTime;
      if (latestEnd < '13:00') {
        pushBlock(latestEnd, '13:00', 'Decompress, snack & lunch', 'No post-mortem on finished paper', 'break');
        if (nextPaper) {
          pushBlock('13:00', '15:30', `${nextPaper.code} — Core Revision`, pickTaskHint(nextPaper, dayOffset), 'study', nextPaper.id, nextPaper.code);
          pushBlock('15:30', '16:00', 'Break: walk & snack', 'Fresh air', 'break');
          pushBlock('16:00', '18:00', `${nextPaper.code} — Practice & Recall`, 'Past paper questions & summary review', 'study', nextPaper.id, nextPaper.code);
        }
        pushBlock('18:00', '19:00', 'Dinner and rest', 'Evening recharge', 'routine');
        if (nextPaper) {
          pushBlock('19:00', '20:00', `${nextPaper.code} — Summary Sheet Check`, 'Consolidate weak spots', 'study', nextPaper.id, nextPaper.code);
        }
      } else {
        pushBlock(latestEnd, '17:30', 'Rest & decompress', 'Take a proper breather after your exam', 'break');
        if (nextPaper) {
          pushBlock('17:30', '19:00', `${nextPaper.code} — Focused Recall`, pickTaskHint(nextPaper, dayOffset), 'study', nextPaper.id, nextPaper.code);
        }
        pushBlock('19:00', '20:00', 'Dinner', 'Evening meal', 'routine');
      }
      pushBlock('20:00', '20:30', 'Daily review: tick off tasks, write 3 things learned, plan tomorrow', 'Reflect and pack for tomorrow', 'review');
      pushBlock('20:30', '22:00', 'Free time: piano / singing, family, relax', 'Screens off by 22:00', 'freetime');
      pushBlock('22:00', '23:00', 'Wind down, lights out by 23:00', 'Full sleep for retention', 'rest');
    }

    const unitsInDay = Array.from(
      new Set(
        blocks
          .map((b) => b.examCode)
          .filter((c): c is string => Boolean(c))
      )
    );
    return {
      date: dateKey,
      phase,
      examsOnDay,
      classesOnDay: classesToday.map((c) => c.code),
      unitsInDay,
      blocks,
    };
  }

  // 2. NON-EXAM DAYS (Study Days & Class Days until Dec 4)
  // Morning Wake / Class
  if (hasMorningClass) {
    pushBlock(
      hasMorningClass.startTime,
      hasMorningClass.endTime,
      hasMorningClass.title,
      'Morning lecture session',
      'class',
      undefined,
      hasMorningClass.code
    );
    pushBlock(
      '10:00',
      '10:30',
      'Breakfast and break',
      'Refuel before deep study block',
      'routine'
    );
  } else {
    pushBlock(
      '07:00',
      '07:45',
      'Wake up, breakfast, get ready',
      'Hydrate and start calmly without rushing',
      'routine'
    );
  }

  const blueprint = CURRICULUM_BY_DATE[dateKey];
  if (blueprint) {
    // Merge blueprint study/break/routine blocks with any dynamic classes on that weekday
    blueprint.blocks.forEach((item) => {
      // Skip blueprint morning blocks if they overlap morning class
      if (hasMorningClass && item.startTime < '10:30') return;
      pushBlock(
        item.startTime,
        item.endTime,
        item.title,
        item.subtitle,
        item.category,
        undefined,
        item.examCode
      );
    });

    // Insert midday/evening classes if present
    classesToday
      .filter((c) => c.startTime !== '07:00')
      .forEach((cls) => {
        pushBlock(
          cls.startTime,
          cls.endTime,
          cls.title,
          cls.mode ? `Live online class (${cls.mode})` : 'Scheduled lecture session',
          'class',
          undefined,
          cls.code
        );
      });

    // Sort blocks chronologically
    blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  } else {
    // Dynamic generator for any custom/extended dates beyond blueprint
    const focus1 = selectFocusExam(effectiveRanked, dateKey, 0, dayOffset);
    const focus2 = selectFocusExam(effectiveRanked, dateKey, 1, dayOffset);
    const focus3 = selectFocusExam(effectiveRanked, dateKey, 2, dayOffset);
    const focus4 = selectFocusExam(effectiveRanked, dateKey, 3, dayOffset);

    if (!hasMorningClass) {
      pushBlock(
        '07:45',
        '09:45',
        focus1 ? `${focus1.code} — Study Block A` : 'Study Block A (2 h)',
        focus1 ? pickTaskHint(focus1, dayOffset) : '50-min focus + 10-min rest',
        'study',
        focus1?.id,
        focus1?.code
      );
      pushBlock('09:45', '10:00', 'Break: stretch, water', 'Short reset', 'break');
      pushBlock(
        '10:00',
        '12:00',
        focus2 ? `${focus2.code} — Study Block B` : 'Study Block B (2 h)',
        focus2 ? pickTaskHint(focus2, dayOffset + 1) : 'Worked problems & summary notes',
        'study',
        focus2?.id,
        focus2?.code
      );
    } else {
      pushBlock(
        '10:30',
        '12:30',
        focus1 ? `${focus1.code} — Study Block A` : 'Morning Study Block (2 h)',
        focus1 ? pickTaskHint(focus1, dayOffset) : '50-min focus + 10-min rest',
        'study',
        focus1?.id,
        focus1?.code
      );
    }

    pushBlock('12:00', '13:00', 'Lunch and proper rest', 'No phone studying', 'routine');

    const middayClass = classesToday.find(
      (c) => c.startTime >= '11:00' && c.startTime < '17:00'
    );
    if (middayClass) {
      pushBlock(
        middayClass.startTime,
        middayClass.endTime,
        middayClass.title,
        middayClass.mode ? `Live class (${middayClass.mode})` : 'Scheduled lecture',
        'class',
        undefined,
        middayClass.code
      );
    } else {
      pushBlock(
        '13:00',
        '15:00',
        focus3 ? `${focus3.code} — Study Block C` : 'Study Block C (2 h)',
        focus3 ? pickTaskHint(focus3, dayOffset + 2) : 'Practice questions & recall',
        'study',
        focus3?.id,
        focus3?.code
      );
      pushBlock('15:00', '15:30', 'Break: walk, snack, fresh air', 'Step outside', 'break');
      pushBlock(
        '15:30',
        '17:30',
        focus1 ? `${focus1.code} — Study Block D` : 'Study Block D (2 h)',
        focus1 ? `Deep practice · ${pickTaskHint(focus1, dayOffset + 3)}` : 'Past papers',
        'study',
        focus1?.id,
        focus1?.code
      );
    }

    if (hasEveningClass) {
      pushBlock(
        hasEveningClass.startTime,
        hasEveningClass.endTime,
        hasEveningClass.title,
        hasEveningClass.mode ? `Live online class (${hasEveningClass.mode})` : 'Evening class',
        'class',
        undefined,
        hasEveningClass.code
      );
    } else {
      pushBlock('17:30', '18:30', 'Dinner and exercise / free time', 'Meal & stretch', 'routine');
      pushBlock(
        '18:30',
        '20:00',
        focus4 ? `${focus4.code} — Active Recall (1.5 h)` : 'Study Block E: Active Recall',
        focus4 ? `Closed-book recall · ${pickTaskHint(focus4, dayOffset + 4)}` : 'Close notes and recall',
        'study',
        focus4?.id,
        focus4?.code
      );
    }

    blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Evening review, free time (piano/singing) & lights out at 11 PM
  if (hasEveningClass) {
    pushBlock('20:30', '21:00', 'Dinner', 'Unwind after evening class', 'routine');
    pushBlock(
      '21:00',
      '21:45',
      'Review class notes: 5 key points, 2 questions to look up',
      'Quick consolidation while fresh',
      'review'
    );
    pushBlock(
      '21:45',
      '23:00',
      'Wind down, lights out by 23:00',
      '7+ hours of sleep for memory consolidation',
      'rest'
    );
  } else if (dateKey !== '2026-12-06') {
    pushBlock(
      '20:00',
      '20:30',
      "Daily review: tick off today's tasks, write 3 things you learned, plan tomorrow",
      'Move any unfinished work to the next free block',
      'review'
    );
    pushBlock(
      '20:30',
      '22:00',
      'Free time: piano / singing, family, relax',
      'Screens off by 22:00',
      'freetime'
    );
    pushBlock(
      '22:00',
      '23:00',
      'Wind down, pack bag, set out tomorrow’s notes, lights out by 23:00',
      'Sleep by 11 PM — never trade sleep for cramming',
      'rest'
    );
  } else {
    // Dec 6 early-sleep finish
    pushBlock(
      '20:00',
      '20:30',
      'Review and relax',
      'Light confidence check only',
      'review'
    );
    pushBlock(
      '20:30',
      '22:00',
      'Free time: piano / singing, calm down',
      'Step away from books',
      'freetime'
    );
    pushBlock(
      '22:00',
      '23:00',
      'In bed early. Sleep matters more than one extra hour of study',
      'Rest before Monday double exam',
      'rest'
    );
  }

  const unitsInDay = Array.from(
    new Set(
      blocks
        .map((b) => b.examCode)
        .filter((c): c is string => Boolean(c))
    )
  );

  return {
    date: dateKey,
    phase,
    examsOnDay,
    classesOnDay: classesToday.map((c) => c.code),
    unitsInDay,
    blocks,
  };
}

export function buildFullPrepPlan(
  exams: Exam[],
  includeClasses = true
): DaySchedule[] {
  const today = getTodayKey();
  const sorted = sortExamsChronologically(exams);
  if (sorted.length === 0) {
    return Array.from({ length: 14 }, (_, idx) =>
      buildDailySchedule(addDays(today, idx), exams, idx, includeClasses)
    );
  }
  const earliestExam = sorted[0].date;
  const latestExam = sorted[sorted.length - 1].date;
  const startKey = today < earliestExam ? today : earliestExam;
  const endKey = latestExam > startKey ? latestExam : addDays(startKey, 13);
  const keys = getDateRangeKeys(startKey, endKey);

  return keys.map((key, idx) =>
    buildDailySchedule(key, sorted, idx, includeClasses)
  );
}

export function spreadExamsAcrossDates(
  exams: Exam[],
  startDateKey: string
): Exam[] {
  const sorted = sortExamsChronologically(exams);
  if (sorted.length === 0) return exams;
  const gapDays = sorted.length <= 6 ? 2 : 1;
  return sorted.map((exam, idx) => ({
    ...exam,
    date: addDays(startDateKey, idx * gapDays),
    startTime: '09:00',
    endTime: '11:00',
  }));
}

export function summarizeDayEvents(day: DaySchedule): string {
  const parts: string[] = [...day.unitsInDay];
  day.examsOnDay.forEach((e) => {
    parts.push(`EXAM ${e.code} (${formatTimeRange(e.startTime, e.endTime)})`);
  });
  return parts.length > 0 ? parts.join(' · ') : 'Rest / Study';
}
