export type TrackId = 'track1' | 'track2' | 'track3' | 'podcast' | (string & {});

export interface TrackMeta {
  id: TrackId;
  title: string;
  shortTitle: string;
  academicSubtitle: string;
  curriculumBadge: string;
  description: string;
  targetSubject: string;
}

export type AppMode = 'student' | 'studio';

export type StudentTab = 'lessons' | 'timeline' | 'comparisons' | 'quiz' | 'ordering' | 'references';

export interface SynchronizedCards {
  question: string;
  definition: string;
  trick: string;
  answer: string;
}

export interface ConceptItem {
  term: string;
  definition: string;
  modernSystemSignificance: string;
}

export interface AxisExplanation {
  axisTitle: string;
  cause: string;
  effect: string;
  simpleExplanation: string;
}

export interface SpecializedCorner {
  type: 'maritime' | 'archaeological';
  title: string;
  content: string;
}

export interface BrainTeaser {
  question: string;
  hintOrSolution?: string;
  hint?: string;
  answer?: string;
}

export interface FlashcardItem {
  id: string;
  category: 'character' | 'place' | 'event' | 'personality' | string; // 👑 شخصيات | 📍 مواقع | ⏳ أحداث
  title?: string;
  subtitle?: string;
  era?: string; // العصر التاريخي
  significance?: string; // الأهمية التاريخية
  examLearningOutcome?: string; // ناتج التعلم الامتحاني المرتبط به
  front?: string; // الوجه الأمامي للكارت
  back?: string; // الوجه الخلفي للكارت
}

export interface LessonScript {
  id: string;
  trackId: TrackId;
  lessonTitle: string;
  unitTitle: string;
  academicSubtitle: string;
  documentaryScript: string; // Contains tags like [توقف قصير], [نبرة هادئة], [نبرة حماسية], [وقفة تأملية]
  cards: SynchronizedCards;
  spotifyUrl?: string; // رابط حلقة Spotify المعتمد
  flashcards?: FlashcardItem[]; // كروت المنارة للمراجعة السريعة (دليل الإنجاز السريع)
  // Student mode clean summary with the Academy Hexagonal Structure
  studentSummary: {
    coreConcept?: string;
    quickCapsule?: string;
    directExamTrick?: string;
    learningOutcomes: string[];
    conceptsGlossary?: ConceptItem[];
    axesExplanations?: AxisExplanation[];
    specializedCorner?: SpecializedCorner;
    visualEquation?: string;
    brainTeaser?: BrainTeaser;
    flashcards?: FlashcardItem[];
  };
}

export interface TimelineEvent {
  id: string;
  trackId: TrackId;
  unit: 'u1' | 'u2' | 'general';
  title: string;
  dateDisplay: string;
  isExactDate: boolean; // false if "غير محدد في الوحدة"
  yearNumeric?: number;
  era: string;
  description: string;
  learningOutcome: string;
  examTrick?: string;
  curriculumAxis: string;
}

export interface ComparisonMatrix {
  id: string;
  trackId: TrackId;
  title: string;
  criteria: string[];
  columns: {
    entityName: string;
    values: string[];
  }[];
  criticalAnalysis: string;
}

export interface QuizQuestion {
  id: string;
  trackId: TrackId;
  unit?: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  learningOutcomeCode: string;
  cognitiveLevel: 'تطبيق' | 'تحليل' | 'استنتاج وربط' | string;
  eliminationStrategy?: string; // مصفاة الاستبعاد الذكي
}

export interface ChronologicalItem {
  id: string;
  trackId: TrackId;
  title: string;
  correctOrder: number;
  dateOrEra: string;
  context: string;
}
