import React, { useState, useEffect } from 'react';
import {
  TrackId,
  TrackMeta,
  LessonScript,
  TimelineEvent,
  QuizQuestion
} from '../../types';
import {
  TRACKS,
  LESSON_SCRIPTS,
  TIMELINE_EVENTS,
  QUIZ_QUESTIONS
} from '../../data/historyData';
import {
  X,
  SlidersHorizontal,
  BookOpen,
  Calendar,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Check,
  Save,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileCode,
  Download,
  Upload,
  Copy,
  Layers,
  Sparkles
} from 'lucide-react';

interface ManualTrackManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackId;
  allTracks: Record<string, TrackMeta>;
  onTrackDataUpdated: () => void;
  onAddCustomTrack?: (track: TrackMeta) => void;
  initialTab?: TabType;
}

type TabType = 'lessons' | 'timeline' | 'quiz' | 'newTrack' | 'backup' | 'reset';

export const ManualTrackManagerModal: React.FC<ManualTrackManagerModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  allTracks,
  onTrackDataUpdated,
  onAddCustomTrack,
  initialTab = 'lessons'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [trackToManage, setTrackToManage] = useState<TrackId>(currentTrack);

  useEffect(() => {
    setTrackToManage(currentTrack);
  }, [currentTrack]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const trackMeta = allTracks[trackToManage] || TRACKS[trackToManage] || TRACKS['track1'];

  // Current track custom storage keys
  const lessonsKey = `manara_custom_lessons_${trackToManage}`;
  const timelineKey = `manara_custom_timeline_${trackToManage}`;
  const quizKey = `manara_custom_quiz_${trackToManage}`;

  // Local state for lessons, timeline, quiz
  const [customLessons, setCustomLessons] = useState<LessonScript[]>([]);
  const [customEvents, setCustomEvents] = useState<TimelineEvent[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>([]);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Load data for trackToManage
  const loadTrackData = () => {
    try {
      const storedLessons = localStorage.getItem(lessonsKey);
      setCustomLessons(storedLessons ? JSON.parse(storedLessons) : []);

      const storedEvents = localStorage.getItem(timelineKey);
      setCustomEvents(storedEvents ? JSON.parse(storedEvents) : []);

      const storedQuiz = localStorage.getItem(quizKey);
      setCustomQuestions(storedQuiz ? JSON.parse(storedQuiz) : []);
    } catch (e) {
      console.error('Error loading track custom data', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrackData();
      setIsEditingLesson(false);
      setIsEditingEvent(false);
      setIsEditingQuestion(false);
    }
  }, [isOpen, trackToManage]);

  // Combined track lists
  const defaultTrackLessons = LESSON_SCRIPTS.filter((l) => l.trackId === trackToManage);
  const defaultTrackEvents = TIMELINE_EVENTS.filter((e) => e.trackId === trackToManage);
  const defaultTrackQuestions = QUIZ_QUESTIONS.filter((q) => q.trackId === trackToManage);

  const allDisplayLessons: LessonScript[] = [...customLessons, ...defaultTrackLessons.filter(dl => !customLessons.some(cl => cl.id === dl.id))];
  const allDisplayEvents: TimelineEvent[] = [...customEvents, ...defaultTrackEvents.filter(de => !customEvents.some(ce => ce.id === de.id))];
  const allDisplayQuestions: QuizQuestion[] = [...customQuestions, ...defaultTrackQuestions.filter(dq => !customQuestions.some(cq => cq.id === dq.id))];

  // ===================== 1. LESSON FORM STATE =====================
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [lessonFormId, setLessonFormId] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonUnit, setLessonUnit] = useState('الوحدة الأولى');
  const [documentaryScript, setDocumentaryScript] = useState('');
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardDefinition, setCardDefinition] = useState('');
  const [cardTrick, setCardTrick] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');
  const [learningOutcomesText, setLearningOutcomesText] = useState('');

  const openNewLessonForm = () => {
    setLessonFormId(`custom-${trackToManage}-l${Date.now()}`);
    setLessonTitle('');
    setLessonUnit('الوحدة الأولى');
    setDocumentaryScript('أهلاً بكم في درس جديد من مقررات أكاديمية المنارة التعليمية.\n[توقف قصير]\nنتناول اليوم فكرة تاريخية محورية...');
    setCardQuestion('');
    setCardDefinition('');
    setCardTrick('');
    setCardAnswer('');
    setLearningOutcomesText('استيعاب المفهوم الجوهري للدرس وتطبيقاته.\nالربط الدقيق بين الشواهد التاريخية ونواتج التعلم.');
    setIsEditingLesson(true);
  };

  const openEditLessonForm = (lesson: LessonScript) => {
    setLessonFormId(lesson.id);
    setLessonTitle(lesson.lessonTitle);
    setLessonUnit(lesson.unitTitle);
    setDocumentaryScript(lesson.documentaryScript);
    setCardQuestion(lesson.cards.question);
    setCardDefinition(lesson.cards.definition);
    setCardTrick(lesson.cards.trick);
    setCardAnswer(lesson.cards.answer);
    setLearningOutcomesText(lesson.studentSummary?.learningOutcomes?.join('\n') || '');
    setIsEditingLesson(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) {
      showFeedback('يرجى إدخال عنوان الدرس', 'error');
      return;
    }

    const outcomes = learningOutcomesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newLesson: LessonScript = {
      id: lessonFormId || `custom-${trackToManage}-${Date.now()}`,
      trackId: trackToManage,
      lessonTitle: lessonTitle.trim(),
      unitTitle: lessonUnit.trim(),
      academicSubtitle: trackMeta.academicSubtitle,
      documentaryScript: documentaryScript.trim(),
      cards: {
        question: cardQuestion.trim() || 'سؤال ناتج التعلم التطبيقي للدرس',
        definition: cardDefinition.trim() || 'المفهوم المنهجي الأساسي',
        trick: cardTrick.trim() || 'تريكة الامتحان وعلاقة السبب بالنتيجة',
        answer: cardAnswer.trim() || 'الإجابة المنهجية الحاسمة'
      },
      studentSummary: {
        coreConcept: cardDefinition.trim(),
        quickCapsule: documentaryScript.slice(0, 150) + '...',
        directExamTrick: cardTrick.trim(),
        learningOutcomes: outcomes.length > 0 ? outcomes : ['إتقان نواتج التعلم المستهدفة للدرس.']
      }
    };

    const updated = [
      ...customLessons.filter((l) => l.id !== newLesson.id),
      newLesson
    ];

    setCustomLessons(updated);
    localStorage.setItem(lessonsKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('manara_data_updated'));
    setIsEditingLesson(false);
    showFeedback('تم حفظ الدرس بنجاح ومزامنته مع واجهة الطالب والمعلم');
    onTrackDataUpdated();
  };

  const handleDeleteLesson = (lessonId: string) => {
    const updated = customLessons.filter((l) => l.id !== lessonId);
    setCustomLessons(updated);
    localStorage.setItem(lessonsKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('manara_data_updated'));
    showFeedback('تم حذف الدرس بنجاح من التخزين المحلي للمسار');
    onTrackDataUpdated();
  };

  // ===================== 2. TIMELINE FORM STATE =====================
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [eventFormId, setEventFormId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateDisplay, setEventDateDisplay] = useState('');
  const [isExactDate, setIsExactDate] = useState(false);
  const [eventEra, setEventEra] = useState('العصور القديمة');
  const [eventDescription, setEventDescription] = useState('');
  const [eventOutcome, setEventOutcome] = useState('');
  const [eventTrick, setEventTrick] = useState('');
  const [eventAxis, setEventAxis] = useState('المحور السياسي والحضاري');

  const openNewEventForm = () => {
    setEventFormId(`custom-ev-${trackToManage}-${Date.now()}`);
    setEventTitle('');
    setEventDateDisplay('غير محدد في الوحدة');
    setIsExactDate(false);
    setEventEra('العصور القديمة');
    setEventDescription('');
    setEventOutcome('');
    setEventTrick('');
    setEventAxis('المحور السياسي والحضاري');
    setIsEditingEvent(true);
  };

  const openEditEventForm = (ev: TimelineEvent) => {
    setEventFormId(ev.id);
    setEventTitle(ev.title);
    setEventDateDisplay(ev.dateDisplay);
    setIsExactDate(ev.isExactDate);
    setEventEra(ev.era);
    setEventDescription(ev.description);
    setEventOutcome(ev.learningOutcome);
    setEventTrick(ev.examTrick || '');
    setEventAxis(ev.curriculumAxis);
    setIsEditingEvent(true);
  };

  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      showFeedback('يرجى إدخال اسم الحدث الزمني', 'error');
      return;
    }

    const newEvent: TimelineEvent = {
      id: eventFormId || `custom-ev-${trackToManage}-${Date.now()}`,
      trackId: trackToManage,
      unit: 'general',
      title: eventTitle.trim(),
      dateDisplay: isExactDate ? eventDateDisplay.trim() : 'غير محدد في الوحدة',
      isExactDate,
      era: eventEra.trim(),
      description: eventDescription.trim(),
      learningOutcome: eventOutcome.trim() || 'فهم السياق التاريخي للحدث وتحليله.',
      examTrick: eventTrick.trim(),
      curriculumAxis: eventAxis.trim()
    };

    const updated = [
      ...customEvents.filter((e) => e.id !== newEvent.id),
      newEvent
    ];

    setCustomEvents(updated);
    localStorage.setItem(timelineKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('manara_data_updated'));
    setIsEditingEvent(false);
    showFeedback('تم حفظ الحدث الزمني بنجاح');
    onTrackDataUpdated();
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = customEvents.filter((e) => e.id !== eventId);
    setCustomEvents(updated);
    localStorage.setItem(timelineKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('manara_data_updated'));
    showFeedback('تم حذف الحدث الزمني');
    onTrackDataUpdated();
  };

  // ===================== 3. QUIZ FORM STATE =====================
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [qFormId, setQFormId] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qOutcomeCode, setQOutcomeCode] = useState('ن.ت: 1-1');
  const [qCognitiveLevel, setQCognitiveLevel] = useState<'تطبيق' | 'تحليل' | 'استنتاج وربط' | string>('تحليل');
  const [qElimination, setQElimination] = useState('');

  const openNewQuestionForm = () => {
    setQFormId(`custom-q-${trackToManage}-${Date.now()}`);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrectIndex(0);
    setQExplanation('');
    setQOutcomeCode('ن.ت: 1-1');
    setQCognitiveLevel('تحليل');
    setQElimination('');
    setIsEditingQuestion(true);
  };

  const openEditQuestionForm = (q: QuizQuestion) => {
    setQFormId(q.id);
    setQText(q.questionText);
    setQOptions(q.options.length >= 4 ? [...q.options] : [...q.options, '', '', ''].slice(0, 4));
    setQCorrectIndex(q.correctIndex);
    setQExplanation(q.explanation);
    setQOutcomeCode(q.learningOutcomeCode);
    setQCognitiveLevel(q.cognitiveLevel || 'تحليل');
    setQElimination(q.eliminationStrategy || '');
    setIsEditingQuestion(true);
  };

  const handleSaveQuestion = () => {
    if (!qText.trim()) {
      showFeedback('يرجى إدخال نص السؤال', 'error');
      return;
    }
    if (qOptions.some((o) => !o.trim())) {
      showFeedback('يرجى ملء جميع الخيارات الأربعة', 'error');
      return;
    }

    const newQ: QuizQuestion = {
      id: qFormId || `custom-q-${trackToManage}-${Date.now()}`,
      trackId: trackToManage,
      questionText: qText.trim(),
      options: qOptions.map((o) => o.trim()),
      correctIndex: qCorrectIndex,
      explanation: qExplanation.trim() || 'الإجابة المنهجية الصحيحة وفق نواتج التعلم.',
      learningOutcomeCode: qOutcomeCode.trim(),
      cognitiveLevel: qCognitiveLevel,
      eliminationStrategy: qElimination.trim() || 'استبعاد البدائل المشتتة وتطبيق قاعدة السبب والنتيجة.'
    };

    const updated = [
      ...customQuestions.filter((q) => q.id !== newQ.id),
      newQ
    ];

    setCustomQuestions(updated);
    localStorage.setItem(quizKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('manara_data_updated'));
    setIsEditingQuestion(false);
    showFeedback('تم حفظ السؤال بنجاح في بنك التقييم للمسار');
    onTrackDataUpdated();
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updated = customQuestions.filter((q) => q.id !== questionId);
    setCustomQuestions(updated);
    localStorage.setItem(quizKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('manara_data_updated'));
    showFeedback('تم حذف السؤال من بنك التقييم');
    onTrackDataUpdated();
  };

  // ===================== 4. NEW TRACK CREATION STATE =====================
  const [ntShortTitle, setNtShortTitle] = useState('');
  const [ntTitle, setNtTitle] = useState('');
  const [ntSubject, setNtSubject] = useState('التاريخ الوطني');
  const [ntSubtitle, setNtSubtitle] = useState('');
  const [ntBadge, setNtBadge] = useState('مقرر وزاري جديد');
  const [ntDesc, setNtDesc] = useState('');

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ntShortTitle.trim() || !ntTitle.trim()) {
      showFeedback('يرجى ملء اسم المسار المختصر وعنوان المقرر كاملاً', 'error');
      return;
    }

    const trackId = `track_custom_${Date.now()}`;
    const cleanSubject = ntSubject.trim() || 'التاريخ';
    const newTrackObj: TrackMeta = {
      id: trackId,
      shortTitle: ntShortTitle.trim(),
      title: ntTitle.trim(),
      targetSubject: cleanSubject,
      academicSubtitle: ntSubtitle.trim() || `${cleanSubject} — مقرر معتمد جديد`,
      curriculumBadge: ntBadge.trim() || 'مقرر دراسي معتمد',
      description: ntDesc.trim() || `المحتوى الأكاديمي والوثائقي المعتمد لمقرر ${ntTitle.trim()} وفق نواتج التعلم الوزارية.`
    };

    // Save track to custom tracks in localStorage
    try {
      const saved = localStorage.getItem('manara_custom_tracks');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed[trackId] = newTrackObj;
      localStorage.setItem('manara_custom_tracks', JSON.stringify(parsed));
    } catch (err) {
      console.error(err);
    }

    if (onAddCustomTrack) {
      onAddCustomTrack(newTrackObj);
    }
    setTrackToManage(trackId);
    setActiveTab('lessons');
    window.dispatchEvent(new Event('manara_data_updated'));
    showFeedback(`تم إنشاء المسار «${newTrackObj.shortTitle}» بنجاح وهو المسار النشط الآن`);
    onTrackDataUpdated();
  };

  const handleFillTrackPreset = (preset: 't2_sem2' | 'geo' | 'civics') => {
    if (preset === 't2_sem2') {
      setNtShortTitle('2 ث - ترم 2');
      setNtTitle('التاريخ الوطني (الفصل الدراسي الثاني)');
      setNtSubject('التاريخ الوطني');
      setNtSubtitle('التاريخ الوطني — الصف الثاني الثانوي — الفصل الدراسي الثاني');
      setNtBadge('الوحدتان الثالثة والرابعة');
      setNtDesc('مواصلة دراسة التاريخ الوطني، بناء الدولة، واستخلاص العبر وفق نواتج التعلم للبكالوريا المصرية.');
    } else if (preset === 'geo') {
      setNtShortTitle('جغرافيا 1 ث');
      setNtTitle('جغرافيا مصر والتضاريس الطبيعية');
      setNtSubject('الجغرافيا');
      setNtSubtitle('الجغرافيا — الصف الأول الثانوي — الفصل الدراسي الأول');
      setNtBadge('الوحدة الأولى والثانية');
      setNtDesc('دراسة موقع مصر وأهميته، التكوينات الجيولوجية، ومظاهر السطح والمناخ.');
    } else {
      setNtShortTitle('مواطنة 2 ث');
      setNtTitle('المواطنة وحقوق الإنسان');
      setNtSubject('التربية الوطنية');
      setNtSubtitle('التربية الوطنية — الصف الثاني الثانوي');
      setNtBadge('مقرر الثقافة والهوية');
      setNtDesc('مفاهيم المواطنة الإيجابية، الحقوق والواجبات الدستورية، ومقومات الدولة المصرية الحديثة.');
    }
  };

  // ===================== 5. BACKUP & EXPORT/IMPORT STATE =====================
  const [backupSubTab, setBackupSubTab] = useState<'export' | 'import'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);

  const gatherBackupJson = () => {
    const customTracks = localStorage.getItem('manara_custom_tracks');
    const parsedTracks = customTracks ? JSON.parse(customTracks) : {};

    const customLessonsMap: Record<string, LessonScript[]> = {};
    const customTimelineMap: Record<string, TimelineEvent[]> = {};
    const customQuizMap: Record<string, QuizQuestion[]> = {};

    Object.keys(allTracks).forEach((tId) => {
      const savedLessons = localStorage.getItem(`manara_custom_lessons_${tId}`);
      if (savedLessons) customLessonsMap[tId] = JSON.parse(savedLessons);
      const savedTimeline = localStorage.getItem(`manara_custom_timeline_${tId}`);
      if (savedTimeline) customTimelineMap[tId] = JSON.parse(savedTimeline);
      const savedQuiz = localStorage.getItem(`manara_custom_quiz_${tId}`);
      if (savedQuiz) customQuizMap[tId] = JSON.parse(savedQuiz);
    });

    return {
      exportedAt: new Date().toISOString(),
      platform: 'أكاديمية المنارة التعليمية',
      customTracks: parsedTracks,
      customLessons: customLessonsMap,
      customTimeline: customTimelineMap,
      customQuiz: customQuizMap
    };
  };

  const handleCopyExportJson = () => {
    const data = gatherBackupJson();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
    showFeedback('تم نسخ كود البيانات (JSON) إلى الحافظة بنجاح');
  };

  const handleDownloadBackup = () => {
    const data = gatherBackupJson();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manara_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('تم تحميل ملف النسخة الاحتياطية بنجاح');
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      showFeedback('يرجى لصق نص كود JSON أولاً', 'error');
      return;
    }
    try {
      const data = JSON.parse(importJsonText);
      if (data.customTracks) {
        localStorage.setItem('manara_custom_tracks', JSON.stringify(data.customTracks));
      }
      if (data.customLessons) {
        Object.keys(data.customLessons).forEach((tId) => {
          localStorage.setItem(`manara_custom_lessons_${tId}`, JSON.stringify(data.customLessons[tId]));
        });
      }
      if (data.customTimeline) {
        Object.keys(data.customTimeline).forEach((tId) => {
          localStorage.setItem(`manara_custom_timeline_${tId}`, JSON.stringify(data.customTimeline[tId]));
        });
      }
      if (data.customQuiz) {
        Object.keys(data.customQuiz).forEach((tId) => {
          localStorage.setItem(`manara_custom_quiz_${tId}`, JSON.stringify(data.customQuiz[tId]));
        });
      }
      window.dispatchEvent(new Event('manara_data_updated'));
      loadTrackData();
      showFeedback('تم استيراد ودمج البيانات بنجاح واستعادة المسارات');
      onTrackDataUpdated();
      setImportJsonText('');
    } catch (err: any) {
      showFeedback(`خطأ في قراءة ملف JSON: ${err.message}`, 'error');
    }
  };

  // Reset track to defaults
  const handleResetTrack = () => {
    try {
      localStorage.removeItem(lessonsKey);
      localStorage.removeItem(timelineKey);
      localStorage.removeItem(quizKey);
      localStorage.removeItem(`manara_custom_comparisons_${trackToManage}`);
      setCustomLessons([]);
      setCustomEvents([]);
      setCustomQuestions([]);
      window.dispatchEvent(new Event('manara_data_updated'));
      showFeedback('تمت إعادة تعيين محتوى المسار بنجاح إلى النسخة الوزارية الافتراضية');
      onTrackDataUpdated();
    } catch (e) {
      console.error(e);
      showFeedback('تعذر إعادة التعيين', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Comfortable max-w-3xl modal container */}
      <div className="bg-[#0B1B3D] border border-[#D4AF37]/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header (Compact & Elegant) */}
        <div className="px-5 py-3.5 border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#071024] to-[#162C5B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-cairo">
                إدارة المحتوى والمسارات
              </h3>
              <p className="text-[11px] text-slate-300 font-tajawal">
                أكاديمية المنارة التعليمية • تحكم شامل بالدروس والخط الزمني والأسئلة والمسارات
              </p>
            </div>
          </div>

          {/* Quick Header Action Pills (New Track, Export, Import) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab('newTrack');
                setIsEditingLesson(false);
                setIsEditingEvent(false);
                setIsEditingQuestion(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer font-cairo ${
                activeTab === 'newTrack'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37]'
                  : 'bg-[#162C5B] text-amber-200 hover:text-white border-[#D4AF37]/30'
              }`}
              title="إنشاء مسار دراسي جديد"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">مسار جديد</span>
            </button>

            <button
              onClick={() => {
                setBackupSubTab('export');
                setActiveTab('backup');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer font-cairo ${
                activeTab === 'backup' && backupSubTab === 'export'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37]'
                  : 'bg-[#162C5B] text-sky-200 hover:text-white border-sky-400/30'
              }`}
              title="تصدير كود البيانات"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">تصدير</span>
            </button>

            <button
              onClick={() => {
                setBackupSubTab('import');
                setActiveTab('backup');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer font-cairo ${
                activeTab === 'backup' && backupSubTab === 'import'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37]'
                  : 'bg-[#162C5B] text-slate-300 hover:text-white border-slate-600'
              }`}
              title="استيراد نسخة JSON"
            >
              <Upload className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">استيراد</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track Selector Ribbon (Clean & Scrollable) */}
        <div className="bg-[#060E21] px-5 py-2.5 border-b border-[#D4AF37]/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-amber-300 font-cairo shrink-0">المسار النشط:</span>
            {(Object.keys(allTracks) as TrackId[]).map((tId) => {
              const meta = allTracks[tId];
              if (!meta) return null;
              const isSelected = trackToManage === tId;
              return (
                <button
                  key={tId}
                  onClick={() => {
                    setTrackToManage(tId);
                    setIsEditingLesson(false);
                    setIsEditingEvent(false);
                    setIsEditingQuestion(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                      : 'bg-[#162C5B] text-slate-300 hover:text-white font-tajawal'
                  }`}
                >
                  {meta.shortTitle}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-slate-400 font-tajawal hidden md:inline truncate max-w-[200px]">
            {trackMeta.title}
          </span>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            className={`px-5 py-2 text-xs font-bold font-cairo flex items-center gap-2 shrink-0 ${
              feedback.type === 'error'
                ? 'bg-rose-950/80 text-rose-300 border-b border-rose-700/50'
                : 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-700/50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-[#D4AF37]/20 bg-[#0A1838] px-5 gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-2.5 px-3 text-xs font-bold font-cairo flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lessons'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الدروس ({allDisplayLessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 text-xs font-bold font-cairo flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>الخط الزمني ({allDisplayEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-2.5 px-3 text-xs font-bold font-cairo flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>بنك الأسئلة ({allDisplayQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('newTrack')}
            className={`py-2.5 px-3 text-xs font-bold font-cairo flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'newTrack'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>مسار جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 text-xs font-bold font-cairo flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>النسخ والاحتياطي</span>
          </button>

          <button
            onClick={() => setActiveTab('reset')}
            className={`py-2.5 px-3 text-xs font-bold font-cairo flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reset'
                ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                : 'border-transparent text-slate-400 hover:text-rose-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>الافتراضي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ======================= TAB 1: LESSONS ======================= */}
          {activeTab === 'lessons' && (
            <div>
              {!isEditingLesson ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-cairo">
                        دروس مسار: {trackMeta.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-tajawal">
                        تعديل وإضافة الدروس وكروت الشاشة التزامنية الأربعة
                      </p>
                    </div>

                    <button
                      onClick={openNewLessonForm}
                      className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة درس جديد</span>
                    </button>
                  </div>

                  {allDisplayLessons.length === 0 ? (
                    <div className="glass-panel p-6 rounded-2xl text-center space-y-2 border-dashed border-slate-700">
                      <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-cairo">لا توجد دروس مدخلة في هذا المسار حالياً.</p>
                      <button
                        onClick={openNewLessonForm}
                        className="px-3.5 py-1.5 rounded-xl bg-[#162C5B] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0B1B3D] transition-all cursor-pointer"
                      >
                        إضافة أول درس
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {allDisplayLessons.map((lesson) => {
                        const isCustom = customLessons.some((cl) => cl.id === lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className="bg-[#060E21]/80 border border-slate-700/80 hover:border-[#D4AF37]/40 p-3.5 rounded-xl space-y-2.5 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] bg-[#162C5B] text-sky-300 px-2 py-0.5 rounded font-mono font-bold block mb-1">
                                  {lesson.unitTitle}
                                </span>
                                <h5 className="text-xs sm:text-sm font-bold text-white font-cairo">
                                  {lesson.lessonTitle}
                                </h5>
                              </div>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded font-bold font-cairo shrink-0 ${
                                  isCustom
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                    : 'bg-blue-950 text-blue-300 border border-blue-700/50'
                                }`}
                              >
                                {isCustom ? 'يدوي' : 'افتراضي'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 font-tajawal">
                              {lesson.documentaryScript}
                            </p>

                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-amber-300/80">
                                {lesson.cards?.question ? 'الكروت: مكتملة' : 'الكروت: غير معينة'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditLessonForm(lesson)}
                                  className="p-1 rounded-lg bg-[#162C5B] text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                                  title="تعديل الدرس"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="p-1 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                                    title="حذف الدرس"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Lesson Form */
                <div className="space-y-3.5 bg-[#060E21]/60 p-4 rounded-2xl border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs sm:text-sm font-bold text-[#F5E6AB] font-cairo flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#D4AF37]" />
                      <span>{lessonFormId.includes('custom') ? 'إضافة درس يدوي جديد' : 'تعديل بيانات الدرس'}</span>
                    </h4>
                    <button
                      onClick={() => setIsEditingLesson(false)}
                      className="text-xs text-slate-400 hover:text-white font-tajawal flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>العودة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                        عنوان الدرس *
                      </label>
                      <input
                        type="text"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        placeholder="مثال: الدرس الأول: الحضارة والتاريخ"
                        className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                        الوحدة الدراسية
                      </label>
                      <input
                        type="text"
                        value={lessonUnit}
                        onChange={(e) => setLessonUnit(e.target.value)}
                        placeholder="مثال: الوحدة الأولى"
                        className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-300 font-cairo">
                        الاسكريبت الوثائقي (مع علامات الإلقاء) *
                      </label>
                      <div className="flex items-center gap-1">
                        {['[توقف قصير]', '[نبرة هادئة]', '[نبرة حماسية]', '[وقفة تأملية]'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setDocumentaryScript((prev) => prev + ` ${tag} `)}
                            className="text-[9px] bg-[#162C5B] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1B3D] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 font-mono transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      value={documentaryScript}
                      onChange={(e) => setDocumentaryScript(e.target.value)}
                      placeholder="اكتب هنا النص السردي الوثائقي..."
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37] font-tajawal leading-relaxed"
                    />
                  </div>

                  {/* 4 Synchronized Cards */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-[#D4AF37] block font-cairo">
                      كروت الشاشة التزامنية الأربعة:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-300 font-cairo mb-0.5">
                          [QUESTION]: السؤال الفكري أو التطبيقي
                        </label>
                        <input
                          type="text"
                          value={cardQuestion}
                          onChange={(e) => setCardQuestion(e.target.value)}
                          placeholder="سؤال ناتج التعلم..."
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-sky-300 font-cairo mb-0.5">
                          [DEFINITION]: المفهوم أو المصطلح المنهجي
                        </label>
                        <input
                          type="text"
                          value={cardDefinition}
                          onChange={(e) => setCardDefinition(e.target.value)}
                          placeholder="المفهوم المنهجي..."
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-300 font-cairo mb-0.5">
                          [TRICK]: تريكة الامتحان وناتج التعلم
                        </label>
                        <input
                          type="text"
                          value={cardTrick}
                          onChange={(e) => setCardTrick(e.target.value)}
                          placeholder="تريكة الامتحان..."
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-purple-300 font-cairo mb-0.5">
                          [ANSWER]: الإجابة المنهجية الحاسمة
                        </label>
                        <input
                          type="text"
                          value={cardAnswer}
                          onChange={(e) => setCardAnswer(e.target.value)}
                          placeholder="الإجابة الحاسمة..."
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 font-cairo mb-1">
                      نواتج التعلم المعتمدة للدرس (ناتج في كل سطر)
                    </label>
                    <textarea
                      rows={2}
                      value={learningOutcomesText}
                      onChange={(e) => setLearningOutcomesText(e.target.value)}
                      placeholder="اكتب كل ناتج تعلم في سطر مستقل..."
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingLesson(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveLesson}
                      className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ الدرس في المسار</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 2: TIMELINE ======================= */}
          {activeTab === 'timeline' && (
            <div>
              {!isEditingEvent ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-cairo">
                        الخط الزمني لمسار: {trackMeta.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-tajawal">
                        إضافة وتعديل الأحداث مع ضابط «غير محدد في الوحدة»
                      </p>
                    </div>

                    <button
                      onClick={openNewEventForm}
                      className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة حدث زمني</span>
                    </button>
                  </div>

                  {allDisplayEvents.length === 0 ? (
                    <div className="glass-panel p-6 rounded-2xl text-center space-y-2 border-dashed border-slate-700">
                      <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-cairo">لا توجد أحداث زمنية مسجلة في هذا المسار.</p>
                      <button
                        onClick={openNewEventForm}
                        className="px-3.5 py-1.5 rounded-xl bg-[#162C5B] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0B1B3D] transition-all cursor-pointer"
                      >
                        إضافة حدث زمني
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allDisplayEvents.map((ev) => {
                        const isCustom = customEvents.some((ce) => ce.id === ev.id);
                        return (
                          <div
                            key={ev.id}
                            className="bg-[#060E21]/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-[#D4AF37]/40 transition-all"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                                  ev.isExactDate
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                                }`}
                              >
                                {ev.dateDisplay}
                              </span>

                              <div>
                                <h5 className="text-xs font-bold text-white font-cairo">
                                  {ev.title}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-tajawal line-clamp-1">
                                  {ev.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openEditEventForm(ev)}
                                className="p-1 rounded-lg bg-[#162C5B] text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                                title="تعديل الحدث"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {isCustom && (
                                <button
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="p-1 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                                  title="حذف الحدث"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Event Form */
                <div className="space-y-3.5 bg-[#060E21]/60 p-4 rounded-2xl border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs sm:text-sm font-bold text-[#F5E6AB] font-cairo flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <span>إضافة / تعديل حدث زمني</span>
                    </h4>
                    <button
                      onClick={() => setIsEditingEvent(false)}
                      className="text-xs text-slate-400 hover:text-white font-tajawal flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>العودة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                        اسم الحدث *
                      </label>
                      <input
                        type="text"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="مثال: وحدة القطرين على يد الملك نعرمر"
                        className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                        العصر التاريخي
                      </label>
                      <input
                        type="text"
                        value={eventEra}
                        onChange={(e) => setEventEra(e.target.value)}
                        placeholder="مثال: العصر العتيق"
                        className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                      />
                    </div>
                  </div>

                  {/* Date toggle */}
                  <div className="p-3 bg-[#0B1B3D] rounded-xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white font-cairo">التأريخ والتوثيق الوزاري:</span>
                      <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isExactDate}
                          onChange={(e) => {
                            setIsExactDate(e.target.checked);
                            if (!e.target.checked) setEventDateDisplay('غير محدد في الوحدة');
                          }}
                          className="w-3.5 h-3.5 rounded text-[#D4AF37] focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold text-[11px] font-cairo">سنة صريحة بكتاب الوزارة</span>
                      </label>
                    </div>

                    {isExactDate ? (
                      <input
                        type="text"
                        value={eventDateDisplay}
                        onChange={(e) => setEventDateDisplay(e.target.value)}
                        placeholder="مثال: 3200 ق.م"
                        className="w-full bg-[#060E21] border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-mono"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200 font-tajawal flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>سيتم التنويه الصريح: <strong className="text-white underline">«غير محدد في الوحدة»</strong></span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                      الوصف والسياق التاريخي
                    </label>
                    <textarea
                      rows={2}
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="شرح موجز للحدث..."
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingEvent(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ الحدث</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 3: QUIZ ======================= */}
          {activeTab === 'quiz' && (
            <div>
              {!isEditingQuestion ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-cairo">
                        بنك أسئلة مسار: {trackMeta.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-tajawal">
                        إضافة وتعديل الأسئلة مع استراتيجية استبعاد البدائل
                      </p>
                    </div>

                    <button
                      onClick={openNewQuestionForm}
                      className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سؤال</span>
                    </button>
                  </div>

                  {allDisplayQuestions.length === 0 ? (
                    <div className="glass-panel p-6 rounded-2xl text-center space-y-2 border-dashed border-slate-700">
                      <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-cairo">لا توجد أسئلة مسجلة في بنك هذا المسار.</p>
                      <button
                        onClick={openNewQuestionForm}
                        className="px-3.5 py-1.5 rounded-xl bg-[#162C5B] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0B1B3D] transition-all cursor-pointer"
                      >
                        إضافة أول سؤال
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {allDisplayQuestions.map((q, idx) => {
                        const isCustom = customQuestions.some((cq) => cq.id === q.id);
                        return (
                          <div
                            key={q.id}
                            className="bg-[#060E21]/80 border border-slate-700/80 p-3 rounded-xl space-y-2 hover:border-[#D4AF37]/40 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold flex items-center justify-center font-cairo">
                                  {idx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-white font-cairo">
                                  {q.questionText}
                                </h5>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditQuestionForm(q)}
                                  className="p-1 rounded-lg bg-[#162C5B] text-sky-300 hover:bg-sky-500 hover:text-white transition-colors cursor-pointer"
                                  title="تعديل السؤال"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                                    title="حذف السؤال"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-1.5 rounded-lg border font-tajawal text-[10px] ${
                                    oIdx === q.correctIndex
                                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold'
                                      : 'bg-[#0B1B3D]/60 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <span className="font-mono ml-1 font-bold">({oIdx + 1})</span>
                                  <span>{opt}</span>
                                  {oIdx === q.correctIndex && <span className="mr-1 text-emerald-400">✓</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Question Form */
                <div className="space-y-3.5 bg-[#060E21]/60 p-4 rounded-2xl border border-[#D4AF37]/30">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs sm:text-sm font-bold text-[#F5E6AB] font-cairo flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                      <span>إضافة / تعديل سؤال تقييم</span>
                    </h4>
                    <button
                      onClick={() => setIsEditingQuestion(false)}
                      className="text-xs text-slate-400 hover:text-white font-tajawal flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>العودة</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                      نص السؤال *
                    </label>
                    <textarea
                      rows={2}
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="اكتب صيغة السؤال التقييمي..."
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-amber-300 font-cairo">
                      الخيارات الأربعة (حدد زر الإجابة الصحيحة):
                    </label>

                    {qOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <label className="flex items-center gap-1 bg-[#162C5B] px-2.5 py-1.5 rounded-lg border border-slate-700 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="correct_choice"
                            checked={qCorrectIndex === oIdx}
                            onChange={() => setQCorrectIndex(oIdx)}
                            className="text-[#D4AF37] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-[#F5E6AB] font-mono">
                            {oIdx + 1}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...qOptions];
                            updated[oIdx] = e.target.value;
                            setQOptions(updated);
                          }}
                          placeholder={`نص الخيار رقم ${oIdx + 1}`}
                          className={`flex-1 bg-[#0B1B3D] border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-tajawal ${
                            qCorrectIndex === oIdx
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-slate-700 focus:border-[#D4AF37]'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditingQuestion(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveQuestion}
                      className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ السؤال</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 4: NEW TRACK CREATION ======================= */}
          {activeTab === 'newTrack' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white font-cairo flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                    <span>إنشاء مسار دراسي أو مقرر جديد</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-tajawal">
                    يرث المسار فورياً هوية المنارة، الشعار المتغير «هنذاكر [المادة] سوا» 🎯، وتصدير PDF
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleFillTrackPreset('t2_sem2')}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#162C5B] text-sky-300 hover:bg-[#D4AF37] hover:text-[#0B1B3D] transition-colors"
                  >
                    2 ث - ترم 2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillTrackPreset('geo')}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#162C5B] text-emerald-300 hover:bg-[#D4AF37] hover:text-[#0B1B3D] transition-colors"
                  >
                    جغرافيا 1 ث
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTrack} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                      اسم المسار المختصر (للأزرار) *
                    </label>
                    <input
                      type="text"
                      value={ntShortTitle}
                      onChange={(e) => setNtShortTitle(e.target.value)}
                      placeholder="مثال: 2 ث - ترم 2"
                      className="w-full bg-[#060E21] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                      اسم المادة المستهدفة *
                    </label>
                    <input
                      type="text"
                      value={ntSubject}
                      onChange={(e) => setNtSubject(e.target.value)}
                      placeholder="مثال: التاريخ الوطني أو الجغرافيا"
                      className="w-full bg-[#060E21] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                    عنوان المسار كاملاً *
                  </label>
                  <input
                    type="text"
                    value={ntTitle}
                    onChange={(e) => setNtTitle(e.target.value)}
                    placeholder="مثال: التاريخ الوطني — أركان الدولة ومقومات الصمود"
                    className="w-full bg-[#060E21] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                      سطر التوصيف الأكاديمي الرسمي
                    </label>
                    <input
                      type="text"
                      value={ntSubtitle}
                      onChange={(e) => setNtSubtitle(e.target.value)}
                      placeholder="مثال: [التاريخ الوطني — الصف الثاني الثانوي]"
                      className="w-full bg-[#060E21] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                      شارة المنهج / الوحدات
                    </label>
                    <input
                      type="text"
                      value={ntBadge}
                      onChange={(e) => setNtBadge(e.target.value)}
                      placeholder="مثال: الوحدتان 3 و 4"
                      className="w-full bg-[#060E21] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-tajawal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 font-cairo mb-1">
                    الوصف العام للمقرر
                  </label>
                  <textarea
                    rows={2}
                    value={ntDesc}
                    onChange={(e) => setNtDesc(e.target.value)}
                    placeholder="وصف مختصر لموضوعات المسار..."
                    className="w-full bg-[#060E21] border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37] font-tajawal"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إنشاء المسار وتفعيله فوراً</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================= TAB 5: BACKUP & EXPORT/IMPORT ======================= */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white font-cairo flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#D4AF37]" />
                    <span>النسخ الاحتياطي وتصدير / استيراد البيانات</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-tajawal">
                    حفظ نسخة احتياطية من كافة الدروس والمسارات كملف JSON أو استيرادها
                  </p>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center p-1 bg-[#060E21] rounded-xl border border-slate-700">
                  <button
                    onClick={() => setBackupSubTab('export')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      backupSubTab === 'export' ? 'bg-[#D4AF37] text-[#0B1B3D]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    تصدير (Export)
                  </button>
                  <button
                    onClick={() => setBackupSubTab('import')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      backupSubTab === 'import' ? 'bg-[#D4AF37] text-[#0B1B3D]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    استيراد (Import)
                  </button>
                </div>
              </div>

              {backupSubTab === 'export' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed font-tajawal">
                    يمكنك تنزيل ملف JSON كامل يحتوي على كل الدروس المخصصة والخط الزمني وبنوك الأسئلة والمسارات الجديدة لحفظها بأمان، أو نسخ كود البيانات:
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleCopyExportJson}
                      className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-white hover:text-[#0B1B3D] text-xs font-bold border border-[#D4AF37]/30 flex items-center gap-1.5 transition-all cursor-pointer font-cairo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedExport ? 'تم النسخ بنجاح ✓' : 'نسخ كود JSON كاملاً'}</span>
                    </button>

                    <button
                      onClick={handleDownloadBackup}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-cairo shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل ملف Backup (.json)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed font-tajawal">
                    الصق نص كود JSON الاحتياطي في المربع أدناه لاستعادة ودمج الدروس والمسارات في التخزين المحلي:
                  </p>

                  <textarea
                    rows={6}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='{"platform": "أكاديمية المنارة التعليمية", ...}'
                    className="w-full bg-[#060E21] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#D4AF37]"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleImportJson}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>استيراد وتطبيق البيانات فوراً</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 6: RESET TO DEFAULTS ======================= */}
          {activeTab === 'reset' && (
            <div className="space-y-3 py-2">
              <div className="bg-rose-950/30 border border-rose-700/50 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs sm:text-sm font-bold font-cairo">
                    إعادة تعيين مسار: {trackMeta.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-tajawal">
                  مسح التعديلات المخصصة في هذا المسار فقط والعودة التامة إلى البيانات الوزارية الرسمية الافتراضية.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من رغبتك في إعادة تعيين هذا المسار للافتراضي؟')) {
                        handleResetTrack();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-cairo flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تأكيد إعادة تعيين هذا المسار للافتراضي</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t border-[#D4AF37]/30 bg-[#071024] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-tajawal">
            أكاديمية المنارة التعليمية | «هنذاكر {trackMeta.targetSubject} سوا» 🎯
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-white hover:text-[#0B1B3D] text-xs font-bold font-cairo transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
