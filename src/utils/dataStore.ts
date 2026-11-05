import {
  TrackId,
  LessonScript,
  TimelineEvent,
  QuizQuestion,
  ComparisonMatrix,
  ChronologicalItem
} from '../types';
import {
  LESSON_SCRIPTS,
  TIMELINE_EVENTS,
  QUIZ_QUESTIONS,
  COMPARISON_MATRICES,
  CHRONOLOGICAL_ITEMS
} from '../data/historyData';

const CUSTOM_LESSONS_PREFIX = 'manara_custom_lessons_';
const DELETED_LESSONS_PREFIX = 'manara_deleted_lessons_';
const CUSTOM_TIMELINE_PREFIX = 'manara_custom_timeline_';
const DELETED_TIMELINE_PREFIX = 'manara_deleted_timeline_';
const CUSTOM_QUIZ_PREFIX = 'manara_custom_quiz_';
const DELETED_QUIZ_PREFIX = 'manara_deleted_quiz_';

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    return parsed ?? fallback;
  } catch (e) {
    console.error('Error reading localStorage', key, e);
    return fallback;
  }
}

function safeSetStorage(key: string, data: any, dispatchEvent: boolean = true) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (dispatchEvent) {
      window.dispatchEvent(new Event('manara_data_updated'));
    }
  } catch (e) {
    console.error('Error writing localStorage', key, e);
  }
}

// Normalizer guard for any lesson before saving
export function sanitizeLesson(raw: any, fallbackTrack: TrackId = 'track1'): LessonScript {
  const trackId = (raw.trackId as TrackId) || fallbackTrack;
  const id = raw.id ? String(raw.id) : `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const lessonTitle = raw.lessonTitle ? String(raw.lessonTitle).trim() : 'درس بدون عنوان';
  const unitTitle = raw.unitTitle ? String(raw.unitTitle).trim() : 'الوحدة الثانية: حضارة مصر القديمة (الفرعونية)';
  const academicSubtitle = raw.academicSubtitle ? String(raw.academicSubtitle).trim() : 'التاريخ — المرحلة الثانوية';
  const documentaryScript = raw.documentaryScript
    ? String(raw.documentaryScript).trim()
    : `[نبرة وقورة]\nشرح الدرس: ${lessonTitle}\nأكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710`;

  const cards = {
    question: raw.cards?.question ? String(raw.cards.question).trim() : 'ما السؤال الجوهري المرتبط بناتج التعلم؟',
    definition: raw.cards?.definition ? String(raw.cards.definition).trim() : 'المفهوم المنهجي الأساسي للدرس.',
    trick: raw.cards?.trick ? String(raw.cards.trick).trim() : 'تريكة الامتحان: التركيز على العلاقات السببية المباشرة وغير المباشرة.',
    answer: raw.cards?.answer ? String(raw.cards.answer).trim() : 'الإجابة المنهجية الحاسمة وفق نواتج التعلم المعتمدة.'
  };

  const rawSummary = raw.studentSummary || {};
  const learningOutcomes = Array.isArray(rawSummary.learningOutcomes) && rawSummary.learningOutcomes.length > 0
    ? rawSummary.learningOutcomes.map((o: any) => String(o))
    : ['استيعاب وتحليل المفاهيم التاريخية للدرس.'];

  // Normalize flashcards
  const candidateFlashcards = Array.isArray(raw.flashcards) && raw.flashcards.length > 0
    ? raw.flashcards
    : Array.isArray(rawSummary.flashcards)
    ? rawSummary.flashcards
    : [];

  const flashcards = candidateFlashcards
    .filter((c: any) => c && ((c.front && c.back) || (c.title && c.significance)))
    .map((c: any, idx: number) => ({
      id: c.id ? String(c.id) : `fc-${id}-${idx}`,
      category: c.category || 'event',
      title: (c.title || c.front || '').trim(),
      subtitle: c.subtitle || undefined,
      era: (c.era || unitTitle).trim(),
      significance: (c.significance || c.back || '').trim(),
      examLearningOutcome: (c.examLearningOutcome || 'استيعاب ناتج التعلم المعتمد للامتحان.').trim(),
      front: (c.front || c.title || '').trim(),
      back: (c.back || c.significance || '').trim()
    }));

  const studentSummary = {
    coreConcept: rawSummary.coreConcept ? String(rawSummary.coreConcept).trim() : cards.definition,
    quickCapsule: rawSummary.quickCapsule ? String(rawSummary.quickCapsule).trim() : 'كبسولة سريعة ومكثفة لنواتج التعلم.',
    directExamTrick: rawSummary.directExamTrick ? String(rawSummary.directExamTrick).trim() : cards.trick,
    learningOutcomes,
    conceptsGlossary: Array.isArray(rawSummary.conceptsGlossary) ? rawSummary.conceptsGlossary : [],
    axesExplanations: Array.isArray(rawSummary.axesExplanations) ? rawSummary.axesExplanations : [],
    specializedCorner: rawSummary.specializedCorner,
    visualEquation: rawSummary.visualEquation ? String(rawSummary.visualEquation).trim() : undefined,
    brainTeaser: rawSummary.brainTeaser,
    flashcards: flashcards.length > 0 ? flashcards : undefined
  };

  return {
    id,
    trackId,
    lessonTitle,
    unitTitle,
    academicSubtitle,
    documentaryScript,
    cards,
    spotifyUrl: raw.spotifyUrl ? String(raw.spotifyUrl).trim() : undefined,
    flashcards: flashcards.length > 0 ? flashcards : undefined,
    studentSummary
  };
}

export const DataStore = {
  // ==========================================
  // LESSONS
  // ==========================================
  getLessons(trackId: TrackId): LessonScript[] {
    try {
      const custom: LessonScript[] = safeGetStorage(`${CUSTOM_LESSONS_PREFIX}${trackId}`, []);
      const deleted: string[] = safeGetStorage(`${DELETED_LESSONS_PREFIX}${trackId}`, []);
      const safeCustom = Array.isArray(custom) ? custom.map((l) => sanitizeLesson(l, trackId)) : [];
      const safeDeleted = Array.isArray(deleted) ? deleted : [];

      const defaults = LESSON_SCRIPTS.filter((l) => l.trackId === trackId && !safeDeleted.includes(l.id));

      // Combine custom overrides + remaining defaults
      const list: LessonScript[] = [...safeCustom];
      defaults.forEach((def) => {
        if (!list.some((c) => c.id === def.id)) {
          list.push(def);
        }
      });
      return list;
    } catch (e) {
      console.error('DataStore.getLessons failed', e);
      return [];
    }
  },

  saveLesson(lesson: LessonScript, dispatchEvent: boolean = true) {
    try {
      const sanitized = sanitizeLesson(lesson, lesson.trackId);
      const trackId = sanitized.trackId;
      const currentCustom: LessonScript[] = safeGetStorage(`${CUSTOM_LESSONS_PREFIX}${trackId}`, []);
      const existsIndex = currentCustom.findIndex((l) => l.id === sanitized.id);

      let updated: LessonScript[];
      if (existsIndex >= 0) {
        updated = [...currentCustom];
        updated[existsIndex] = sanitized;
      } else {
        updated = [sanitized, ...currentCustom];
      }

      // Also remove from deleted if it was there
      const deleted: string[] = safeGetStorage(`${DELETED_LESSONS_PREFIX}${trackId}`, []);
      const updatedDeleted = deleted.filter((id) => id !== sanitized.id);
      if (updatedDeleted.length !== deleted.length) {
        safeSetStorage(`${DELETED_LESSONS_PREFIX}${trackId}`, updatedDeleted, false);
      }

      safeSetStorage(`${CUSTOM_LESSONS_PREFIX}${trackId}`, updated, dispatchEvent);
    } catch (e) {
      console.error('DataStore.saveLesson failed', e);
    }
  },

  saveLessonsBatch(lessons: LessonScript[]) {
    try {
      if (!Array.isArray(lessons) || lessons.length === 0) return;
      const byTrack: Record<string, LessonScript[]> = {};
      lessons.forEach((l) => {
        const sanitized = sanitizeLesson(l, l.trackId);
        if (!byTrack[sanitized.trackId]) byTrack[sanitized.trackId] = [];
        byTrack[sanitized.trackId].push(sanitized);
      });

      Object.keys(byTrack).forEach((tId) => {
        const trackLessons = byTrack[tId];
        const currentCustom: LessonScript[] = safeGetStorage(`${CUSTOM_LESSONS_PREFIX}${tId}`, []);
        const merged = [...trackLessons];
        currentCustom.forEach((c) => {
          if (!merged.some((m) => m.id === c.id)) {
            merged.push(c);
          }
        });
        safeSetStorage(`${CUSTOM_LESSONS_PREFIX}${tId}`, merged, false);
      });

      // Dispatch single update event
      window.dispatchEvent(new Event('manara_data_updated'));
    } catch (e) {
      console.error('DataStore.saveLessonsBatch failed', e);
    }
  },

  deleteLesson(trackId: TrackId, lessonId: string) {
    try {
      const currentCustom: LessonScript[] = safeGetStorage(`${CUSTOM_LESSONS_PREFIX}${trackId}`, []);
      const updatedCustom = currentCustom.filter((l) => l.id !== lessonId);
      safeSetStorage(`${CUSTOM_LESSONS_PREFIX}${trackId}`, updatedCustom, true);

      const isDefault = LESSON_SCRIPTS.some((l) => l.id === lessonId);
      if (isDefault) {
        const deleted: string[] = safeGetStorage(`${DELETED_LESSONS_PREFIX}${trackId}`, []);
        if (!deleted.includes(lessonId)) {
          safeSetStorage(`${DELETED_LESSONS_PREFIX}${trackId}`, [...deleted, lessonId], true);
        }
      }
    } catch (e) {
      console.error('DataStore.deleteLesson failed', e);
    }
  },

  // ==========================================
  // TIMELINE EVENTS
  // ==========================================
  getTimelineEvents(trackId: TrackId): TimelineEvent[] {
    try {
      const custom: TimelineEvent[] = safeGetStorage(`${CUSTOM_TIMELINE_PREFIX}${trackId}`, []);
      const deleted: string[] = safeGetStorage(`${DELETED_TIMELINE_PREFIX}${trackId}`, []);
      const safeCustom = Array.isArray(custom) ? custom : [];
      const safeDeleted = Array.isArray(deleted) ? deleted : [];

      const defaults = TIMELINE_EVENTS.filter((e) => e.trackId === trackId && !safeDeleted.includes(e.id));

      const list: TimelineEvent[] = [...safeCustom];
      defaults.forEach((def) => {
        if (!list.some((c) => c.id === def.id)) {
          list.push(def);
        }
      });
      return list;
    } catch (e) {
      console.error('DataStore.getTimelineEvents failed', e);
      return [];
    }
  },

  saveTimelineEvent(event: TimelineEvent) {
    try {
      const trackId = event.trackId;
      const currentCustom: TimelineEvent[] = safeGetStorage(`${CUSTOM_TIMELINE_PREFIX}${trackId}`, []);
      const idx = currentCustom.findIndex((e) => e.id === event.id);

      let updated: TimelineEvent[];
      if (idx >= 0) {
        updated = [...currentCustom];
        updated[idx] = event;
      } else {
        updated = [event, ...currentCustom];
      }
      safeSetStorage(`${CUSTOM_TIMELINE_PREFIX}${trackId}`, updated, true);
    } catch (e) {
      console.error('DataStore.saveTimelineEvent failed', e);
    }
  },

  deleteTimelineEvent(trackId: TrackId, eventId: string) {
    try {
      const currentCustom: TimelineEvent[] = safeGetStorage(`${CUSTOM_TIMELINE_PREFIX}${trackId}`, []);
      safeSetStorage(`${CUSTOM_TIMELINE_PREFIX}${trackId}`, currentCustom.filter((e) => e.id !== eventId), true);

      if (TIMELINE_EVENTS.some((e) => e.id === eventId)) {
        const deleted: string[] = safeGetStorage(`${DELETED_TIMELINE_PREFIX}${trackId}`, []);
        if (!deleted.includes(eventId)) {
          safeSetStorage(`${DELETED_TIMELINE_PREFIX}${trackId}`, [...deleted, eventId], true);
        }
      }
    } catch (e) {
      console.error('DataStore.deleteTimelineEvent failed', e);
    }
  },

  // ==========================================
  // QUIZ QUESTIONS
  // ==========================================
  getQuizQuestions(trackId: TrackId): QuizQuestion[] {
    try {
      const custom: QuizQuestion[] = safeGetStorage(`${CUSTOM_QUIZ_PREFIX}${trackId}`, []);
      const deleted: string[] = safeGetStorage(`${DELETED_QUIZ_PREFIX}${trackId}`, []);
      const safeCustom = Array.isArray(custom) ? custom : [];
      const safeDeleted = Array.isArray(deleted) ? deleted : [];

      const defaults = QUIZ_QUESTIONS.filter((q) => q.trackId === trackId && !safeDeleted.includes(q.id));

      const list: QuizQuestion[] = [...safeCustom];
      defaults.forEach((def) => {
        if (!list.some((c) => c.id === def.id)) {
          list.push(def);
        }
      });
      return list;
    } catch (e) {
      console.error('DataStore.getQuizQuestions failed', e);
      return [];
    }
  },

  saveQuizQuestion(question: QuizQuestion) {
    try {
      const trackId = question.trackId;
      const currentCustom: QuizQuestion[] = safeGetStorage(`${CUSTOM_QUIZ_PREFIX}${trackId}`, []);
      const idx = currentCustom.findIndex((q) => q.id === question.id);

      let updated: QuizQuestion[];
      if (idx >= 0) {
        updated = [...currentCustom];
        updated[idx] = question;
      } else {
        updated = [question, ...currentCustom];
      }
      safeSetStorage(`${CUSTOM_QUIZ_PREFIX}${trackId}`, updated, true);
    } catch (e) {
      console.error('DataStore.saveQuizQuestion failed', e);
    }
  },

  deleteQuizQuestion(trackId: TrackId, questionId: string) {
    try {
      const currentCustom: QuizQuestion[] = safeGetStorage(`${CUSTOM_QUIZ_PREFIX}${trackId}`, []);
      safeSetStorage(`${CUSTOM_QUIZ_PREFIX}${trackId}`, currentCustom.filter((q) => q.id !== questionId), true);

      if (QUIZ_QUESTIONS.some((q) => q.id === questionId)) {
        const deleted: string[] = safeGetStorage(`${DELETED_QUIZ_PREFIX}${trackId}`, []);
        if (!deleted.includes(questionId)) {
          safeSetStorage(`${DELETED_QUIZ_PREFIX}${trackId}`, [...deleted, questionId], true);
        }
      }
    } catch (e) {
      console.error('DataStore.deleteQuizQuestion failed', e);
    }
  },

  // ==========================================
  // RESET ALL DATA FOR TRACK TO DEFAULTS
  // ==========================================
  resetTrackData(trackId: TrackId) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${CUSTOM_LESSONS_PREFIX}${trackId}`);
      localStorage.removeItem(`${DELETED_LESSONS_PREFIX}${trackId}`);
      localStorage.removeItem(`${CUSTOM_TIMELINE_PREFIX}${trackId}`);
      localStorage.removeItem(`${DELETED_TIMELINE_PREFIX}${trackId}`);
      localStorage.removeItem(`${CUSTOM_QUIZ_PREFIX}${trackId}`);
      localStorage.removeItem(`${DELETED_QUIZ_PREFIX}${trackId}`);
      window.dispatchEvent(new Event('manara_data_updated'));
    } catch (e) {
      console.error('DataStore.resetTrackData failed', e);
    }
  }
};
