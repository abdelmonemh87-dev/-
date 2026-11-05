import React, { useState } from 'react';
import {
  TrackId,
  TrackMeta,
  LessonScript,
  ConceptItem,
  AxisExplanation,
  StudentTab,
  TimelineEvent,
  ComparisonMatrix,
  QuizQuestion,
  ChronologicalItem
} from '../../types';
import {
  TRACKS,
  LESSON_SCRIPTS,
  TIMELINE_EVENTS,
  COMPARISON_MATRICES,
  QUIZ_QUESTIONS,
  CHRONOLOGICAL_ITEMS
} from '../../data/historyData';
import {
  BookOpen,
  Calendar,
  Scale,
  Award,
  Layers,
  FileCheck,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Compass,
  HelpCircle,
  Anchor,
  Landmark,
  CheckSquare,
  Info,
  Eye,
  ArrowLeft,
  ShieldCheck,
  Printer,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Edit3,
  Trash2,
  PlusCircle,
  Radio,
  Headphones,
  Sliders
} from 'lucide-react';
import { PrintFirstPageHeader, PrintEndFooter } from '../Common/PrintHeaderFooter';
import { CurriculumSwitcher } from '../Common/CurriculumSwitcher';
import { ScreenLiveControlBar } from '../Common/ScreenLiveControlBar';
import { ScreenControlModal } from '../Modals/ScreenControlModal';
import { FlashcardDeck } from './FlashcardDeck';
import { DataStore } from '../../utils/dataStore';

interface StudentWorkspaceProps {
  currentTrack: TrackId;
  allTracks?: Record<string, TrackMeta>;
  onSelectTrack?: (track: TrackId) => void;
  isStudentLocked?: boolean;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  currentTrack,
  allTracks,
  onSelectTrack,
  isStudentLocked = false
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('timeline');
  const trackMeta = (allTracks && allTracks[currentTrack]) || TRACKS[currentTrack] || TRACKS['track1'];

  // Listen to global data updates from ingestion or import
  const [dataVersion, setDataVersion] = useState(0);
  React.useEffect(() => {
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener('manara_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('manara_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Screen Control Modal state
  const [isScreenControlOpen, setIsScreenControlOpen] = useState(false);
  const [screenControlTab, setScreenControlTab] = useState<'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack'>('editLesson');

  const openScreenControl = (tab: 'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack') => {
    setScreenControlTab(tab);
    setIsScreenControlOpen(true);
  };

  // Brain teaser reveal state per lesson
  const [revealedTeasers, setRevealedTeasers] = useState<Record<string, boolean>>({});
  const toggleTeaser = (lessonId: string) => {
    setRevealedTeasers((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Quiz compass banner collapsible state
  const [isCompassOpen, setIsCompassOpen] = useState(true);

  // Question elimination strategy reveal state per question
  const [revealedEliminations, setRevealedEliminations] = useState<Record<string, boolean>>({});
  const toggleElimination = (questionId: string) => {
    setRevealedEliminations((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Merging built-in and custom data for current track using DataStore (Guarded with try/catch)
  const trackLessons = React.useMemo(() => {
    try {
      const lessons = DataStore.getLessons(currentTrack);
      return Array.isArray(lessons) ? lessons : [];
    } catch (e) {
      console.error('Failed to load lessons', e);
      return [];
    }
  }, [currentTrack, dataVersion]);

  const trackEvents = React.useMemo(() => {
    try {
      const events = DataStore.getTimelineEvents(currentTrack);
      return Array.isArray(events) ? events : [];
    } catch (e) {
      console.error('Failed to load timeline events', e);
      return [];
    }
  }, [currentTrack, dataVersion]);

  const trackComparisons = React.useMemo(() => {
    try {
      return COMPARISON_MATRICES.filter((c) => c && c.trackId === currentTrack);
    } catch (e) {
      console.error('Failed to load comparisons', e);
      return [];
    }
  }, [currentTrack]);

  const trackQuestions = React.useMemo(() => {
    try {
      const questions = DataStore.getQuizQuestions(currentTrack);
      return Array.isArray(questions) ? questions : [];
    } catch (e) {
      console.error('Failed to load quiz questions', e);
      return [];
    }
  }, [currentTrack, dataVersion]);

  const trackOrdering = React.useMemo(() => {
    try {
      return CHRONOLOGICAL_ITEMS.filter((o) => o && o.trackId === currentTrack);
    } catch (e) {
      console.error('Failed to load ordering items', e);
      return [];
    }
  }, [currentTrack]);

  // Lesson counts per track for CurriculumSwitcher
  const lessonCounts = React.useMemo(() => {
    try {
      const counts: Record<string, number> = {};
      const keys = Object.keys(allTracks || TRACKS);
      keys.forEach((k) => {
        try {
          counts[k] = DataStore.getLessons(k as TrackId).length;
        } catch {
          counts[k] = 0;
        }
      });
      return counts;
    } catch (e) {
      console.error('Failed to calculate lesson counts', e);
      return {};
    }
  }, [allTracks, dataVersion]);

  // Selected Lesson in Lessons Tab (instant derivation, zero delay)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  React.useEffect(() => {
    if (trackLessons.length > 0) {
      setSelectedLessonId(trackLessons[0].id);
    }
    if (currentTrack === 'podcast' && activeTab !== 'lessons' && activeTab !== 'timeline') {
      setActiveTab('lessons');
    }
  }, [currentTrack, trackLessons.length]);

  const activeLesson = React.useMemo(() => {
    if (trackLessons.length === 0) return null;
    return trackLessons.find((l) => l.id === selectedLessonId) || trackLessons[0];
  }, [trackLessons, selectedLessonId]);

  // Live Audio Narrator state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [voiceTone, setVoiceTone] = useState<'narrator' | 'teacher' | 'custom'>('narrator');
  const [audioSpeed, setAudioSpeed] = useState<number>(0.92);
  const [readAlongSentence, setReadAlongSentence] = useState<string>('');
  const [showFullScript, setShowFullScript] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeAudioCard, setActiveAudioCard] = useState<'question' | 'definition' | 'trick' | 'answer' | null>(null);

  const synthRef = React.useRef<SpeechSynthesis | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlayingAudio(false);
    setReadAlongSentence('');
    setActiveAudioCard(null);
  };

  React.useEffect(() => {
    stopAudio();
  }, [activeLesson?.id, currentTrack]);

  const handlePlayAudio = () => {
    if (!activeLesson) return;
    if (isPlayingAudio) {
      stopAudio();
      return;
    }
    if (!synthRef.current) {
      setIsPlayingAudio(true);
      const sentences = activeLesson.documentaryScript
        .replace(/\[[^\]]+\]/g, '')
        .split('\n')
        .filter((s) => s.trim().length > 0);
      let sIdx = 0;
      setReadAlongSentence(sentences[0] || '');
      const timer = setInterval(() => {
        sIdx++;
        if (sIdx >= sentences.length) {
          clearInterval(timer);
          setIsPlayingAudio(false);
          setReadAlongSentence('');
        } else {
          setReadAlongSentence(sentences[sIdx]);
        }
      }, 3500);
      return;
    }

    synthRef.current.cancel();
    const cleanText = activeLesson.documentaryScript
      .replace(/\[توقف قصير\]/g, ' ... ')
      .replace(/\[وقفة تأملية\]/g, ' .... ')
      .replace(/\[نبرة هادئة\]/g, '')
      .replace(/\[نبرة حماسية\]/g, '')
      .replace(/\[وقفة طويلة\]/g, ' ..... ')
      .replace(/\[سكتة هادئة\]/g, ' ... ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = voiceTone === 'teacher' ? 1.05 : audioSpeed;
    utterance.pitch = voiceTone === 'teacher' ? 1.1 : 0.95;

    const voices = synthRef.current.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onboundary = (event) => {
      const charIdx = event.charIndex;
      const textSoFar = cleanText.substring(charIdx, charIdx + 70);
      const firstSentence = textSoFar.split('.')[0] || textSoFar;
      setReadAlongSentence(firstSentence);

      // Card sync simulation
      const ratio = charIdx / Math.max(cleanText.length, 1);
      if (ratio < 0.25) setActiveAudioCard('question');
      else if (ratio < 0.5) setActiveAudioCard('definition');
      else if (ratio < 0.75) setActiveAudioCard('trick');
      else setActiveAudioCard('answer');
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setReadAlongSentence('');
      setActiveAudioCard(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setReadAlongSentence('');
      setActiveAudioCard(null);
    };

    synthRef.current.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Timeline Filters
  const [timelineUnitFilter, setTimelineUnitFilter] = useState<'all' | 'u1' | 'u2'>('all');
  const [exactDatesOnly, setExactDatesOnly] = useState<boolean>(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredTimeline = React.useMemo(() => {
    return trackEvents.filter((ev) => {
      if (timelineUnitFilter !== 'all' && ev.unit !== timelineUnitFilter && ev.unit !== 'general') {
        return false;
      }
      if (exactDatesOnly && !ev.isExactDate) {
        return false;
      }
      return true;
    });
  }, [trackEvents, timelineUnitFilter, exactDatesOnly]);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let score = 0;
    trackQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  // Ordering activity state (synced with current track)
  const currentOrderingItems = trackOrdering.length > 0 ? trackOrdering : CHRONOLOGICAL_ITEMS;
  const [orderedItems, setOrderedItems] = useState<ChronologicalItem[]>(() => {
    return [...currentOrderingItems].sort(() => Math.random() - 0.5);
  });
  const [orderingChecked, setOrderingChecked] = useState(false);
  const [isOrderingCorrect, setIsOrderingCorrect] = useState(false);

  React.useEffect(() => {
    const items = trackOrdering.length > 0 ? trackOrdering : CHRONOLOGICAL_ITEMS;
    setOrderedItems([...items].sort(() => Math.random() - 0.5));
    setOrderingChecked(false);
    setSelectedAnswers({});
    setShowResults(false);
  }, [currentTrack, trackOrdering]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (orderingChecked) setOrderingChecked(false);
    const newItems = [...orderedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setOrderedItems(newItems);
  };

  const checkOrdering = () => {
    const isCorrect = orderedItems.every((item, idx) => item.correctOrder === idx + 1);
    setIsOrderingCorrect(isCorrect);
    setOrderingChecked(true);
  };

  const resetOrdering = () => {
    setOrderedItems([...currentOrderingItems].sort(() => Math.random() - 0.5));
    setOrderingChecked(false);
  };

  return (
    <div className="space-y-6">
      {/* Curriculum Switcher - All Secondary Stages */}
      {onSelectTrack && (
        <CurriculumSwitcher
          currentTrack={currentTrack}
          onSelectTrack={onSelectTrack}
          allTracks={allTracks}
          lessonCounts={lessonCounts}
        />
      )}

      {/* Screen Live Control Bar (Hidden if student locked) */}
      {!isStudentLocked && (
        <ScreenLiveControlBar
          currentTrack={currentTrack}
          currentLesson={activeLesson}
          onOpenControlModal={openScreenControl}
        />
      )}

      {/* Student Welcome Header & Fast Track Switcher */}
      <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/35 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6AB] to-[#D4AF37] font-cairo">
              المنارة في {trackMeta.targetSubject}
            </span>
            <span className="text-xs bg-[#162C5B] text-sky-200 font-bold px-2.5 py-0.5 rounded-full border border-sky-400/30">
              واجهة الطالب
            </span>
          </div>
          <p className="text-xs font-bold text-[#F5E6AB] font-tajawal">
            [{trackMeta.academicSubtitle}]
          </p>
          <p className="text-xs text-slate-300 mt-1">
            ملخصات الدروس المركزة، كبسولات الفهم السريعة، وتريكات الامتحان المباشرة لطلاب المرحلة الثانوية.
          </p>
        </div>

        {/* Tab Navigation Segmented Bar (Touch & Tablet Optimized) */}
        <div className="flex items-center gap-1.5 bg-[#060E21] p-1.5 rounded-xl border border-[#D4AF37]/25 w-full md:w-auto overflow-x-auto no-scrollbar touch-pan-x overscroll-x-contain">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                : 'text-slate-300 hover:text-white font-tajawal'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>الخط الزمني</span>
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                : 'text-slate-300 hover:text-white font-tajawal'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>كبسولات الدروس</span>
          </button>

          <button
            onClick={() => setActiveTab('comparisons')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'comparisons'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                : 'text-slate-300 hover:text-white font-tajawal'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>جداول المقارنة</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                : 'text-slate-300 hover:text-white font-tajawal'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>بنك التقييمات</span>
          </button>

          <button
            onClick={() => setActiveTab('ordering')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ordering'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                : 'text-slate-300 hover:text-white font-tajawal'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>أنشطة التفكير</span>
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'references'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm font-cairo'
                : 'text-slate-300 hover:text-white font-tajawal'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>المراجع المعتمدة</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: INTERACTIVE TIMELINE */}
      {/* ========================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline Filter Controls */}
          <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#F5E6AB] ml-1 font-cairo">
                تصفية الخط الزمني:
              </span>
              <button
                onClick={() => setTimelineUnitFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timelineUnitFilter === 'all'
                    ? 'bg-[#D4AF37] text-[#0B1B3D]'
                    : 'bg-[#162C5B] text-slate-300 hover:text-white'
                }`}
              >
                عرض الكل
              </button>
              <button
                onClick={() => setTimelineUnitFilter('u1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timelineUnitFilter === 'u1'
                    ? 'bg-[#D4AF37] text-[#0B1B3D]'
                    : 'bg-[#162C5B] text-slate-300 hover:text-white'
                }`}
              >
                الوحدة الأولى
              </button>
              <button
                onClick={() => setTimelineUnitFilter('u2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timelineUnitFilter === 'u2'
                    ? 'bg-[#D4AF37] text-[#0B1B3D]'
                    : 'bg-[#162C5B] text-slate-300 hover:text-white'
                }`}
              >
                الوحدة الثانية
              </button>
            </div>

            {/* Exact Date Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={exactDatesOnly}
                onChange={(e) => setExactDatesOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-[#D4AF37] bg-[#162C5B] border-slate-700"
              />
              <span className="font-semibold">عرض التواريخ المؤكدة رقمياً فقط</span>
            </label>
          </div>

          {/* Academic Integrity Notice */}
          <div className="bg-[#162C5B]/60 p-3.5 rounded-xl border border-[#D4AF37]/20 text-xs text-slate-300 flex items-start gap-2.5 font-tajawal">
            <span className="text-base text-amber-300">📜</span>
            <div>
              <strong className="text-[#F5E6AB]">قاعدة التوثيق المنهجي الصارم:</strong>{' '}
              التواريخ والأحداث موثقة وفق كتاب الوزارة الرسمي. وعند غياب تاريخ محدد في نصوص الوزارة، تم التنويه الصريح بعبارة{' '}
              <span className="text-amber-300 font-bold underline decoration-dotted">«غير محدد في الوحدة»</span>{' '}
              التزاماً بالأمانة العلمية والتربوية لطلابنا.
            </div>
          </div>

          {/* Timeline Events Stack */}
          <div className="relative border-r-2 border-[#D4AF37]/40 pr-6 space-y-6 mr-3">
            {filteredTimeline.map((ev, idx) => {
              const isExpanded = expandedEventId === ev.id;
              return (
                <div key={ev.id} className="relative group">
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute -right-[33px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                      ev.isExactDate
                        ? 'bg-[#D4AF37] border-white shadow-md shadow-[#D4AF37]/50'
                        : 'bg-[#0B1B3D] border-[#D4AF37]'
                    }`}
                  />

                  {/* Event Card with Subtle Watermark */}
                  <div className="glass-panel manara-watermark hover:bg-[#162C5B]/90 p-4 sm:p-5 rounded-xl border border-[#D4AF37]/30 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300 bg-[#060E21] px-2.5 py-0.5 rounded border border-amber-500/30 font-mono">
                          {ev.dateDisplay}
                        </span>
                        <span className="text-xs text-slate-400 font-tajawal">
                          {ev.era}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#F5E6AB]/80 font-tajawal bg-[#060E21]/60 px-2.5 py-0.5 rounded border border-[#D4AF37]/20">
                        {ev.curriculumAxis}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-cairo mb-2">
                      {ev.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-tajawal mb-3">
                      {ev.description}
                    </p>

                    {/* Expandable Learning Outcome & Exam Trick */}
                    <button
                      onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                      className="text-xs font-bold text-[#F5E6AB] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>ناتج التعلم وتريكة الامتحان</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#D4AF37]/20 space-y-2 text-xs">
                        <div className="bg-[#060E21]/80 p-3 rounded-lg border border-sky-500/30">
                          <strong className="text-sky-300 block mb-1">
                            🎯 ناتج التعلم المستهدف:
                          </strong>
                          <span className="text-slate-300 font-tajawal leading-relaxed">
                            {ev.learningOutcome}
                          </span>
                        </div>
                        {ev.examTrick && (
                          <div className="bg-[#060E21]/80 p-3 rounded-lg border border-amber-500/30">
                            <strong className="text-amber-300 block mb-1">
                              ⚡ تريكة الامتحان المركبة:
                            </strong>
                            <span className="text-slate-300 font-tajawal leading-relaxed">
                              {ev.examTrick}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LESSON CAPSULES & DIRECT TRICKS */}
      {/* ========================================================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {trackLessons.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border border-dashed border-[#D4AF37]/30">
              <BookOpen className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
              <h4 className="text-base font-bold text-white font-cairo">
                لا توجد كبسولات دروس مسجلة في مسار: {trackMeta.title}
              </h4>
              <p className="text-xs text-slate-300 font-tajawal max-w-md mx-auto leading-relaxed">
                يمكن للمعلم تغذية المسار بدرس جديد أو بنك أسئلة من «ساحة المعلم» أو استخدام «لوحة التحكم اليدوي في مدخلات المسار».
              </p>
            </div>
          ) : (
            <>
              {/* Lesson Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {trackLessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLessonId(l.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeLesson?.id === l.id
                        ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-md font-cairo'
                        : 'bg-[#162C5B] text-slate-300 hover:text-white border border-[#D4AF37]/20 font-tajawal'
                    }`}
                  >
                    {l.lessonTitle}
                  </button>
                ))}
              </div>

              {/* Lesson Capsule Display with Full Academy Hexagonal Structure */}
              <div className="space-y-6 print-page-watermark">
            {/* Dedicated First Page Header for Print Only */}
            <PrintFirstPageHeader
              currentTrack={currentTrack}
              documentTitle={activeLesson?.lessonTitle}
              documentSubtext={activeLesson?.unitTitle}
            />

            {/* Header of Active Lesson (Screen Only) */}
            <div className="glass-panel manara-watermark p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30 inline-block mb-2 font-cairo">
                  {activeLesson?.unitTitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-cairo">
                  {activeLesson?.lessonTitle}
                </h3>
                <p className="text-xs text-slate-300 font-tajawal mt-1">
                  {activeLesson?.academicSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* 🎙️ Spotify Podcast Button */}
                <a
                  href={activeLesson?.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(activeLesson?.lessonTitle || 'حواديت منسية')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print px-3.5 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all font-cairo cursor-pointer"
                  title="الاستماع لحدوتة الدرس على منصة Spotify"
                >
                  <Radio className="w-4 h-4 text-white" />
                  <span>🎙️ استمع لحدوتة الدرس على Spotify</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="no-print px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer font-cairo"
                  title="طباعة أو تصدير الدرس كملزمة صافية PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ طباعة الملزمة بالتنسيق المعتمد</span>
                </button>
                <span className="no-print text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold flex items-center gap-1 font-cairo">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>معتمد وفق نواتج التعلم الوزارية</span>
                </span>
              </div>
            </div>

            {/* Quick Actions & Live Audio Narrator Bar */}
            <div className="no-print space-y-4">
              {/* Quick Inline Actions Toolbar */}
              <div className="bg-[#0B1B3D]/90 p-3 rounded-xl border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
                {!isStudentLocked ? (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <button
                      onClick={() => openScreenControl('editLesson')}
                      className="px-3 py-1.5 rounded-lg bg-[#162C5B] hover:bg-[#1E3B7A] border border-[#D4AF37]/40 text-[#F5E6AB] font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                      <span>✏️ تعديل سريع على الدرس</span>
                    </button>

                    <button
                      onClick={() => openScreenControl('addLesson')}
                      className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] font-black font-cairo flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>➕ درس جديد</span>
                    </button>

                    <button
                      onClick={() => openScreenControl('deleteCurrent')}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 font-bold font-cairo flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>🗑️ حذف</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#F5E6AB] font-cairo">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>وضع الطالب المعتمد — أكاديمية المنارة التعليمية</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFullScript(!showFullScript)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    <span>{showFullScript ? 'إخفاء الاسكريبت' : '📜 عرض الاسكريبت الوثائقي'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!activeLesson) return;
                      navigator.clipboard.writeText(activeLesson.documentaryScript);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedScript ? 'تم النسخ!' : 'نسخ الاسكريبت'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Audio Narrator (محرّك الإلقاء الوثائقي والتزامن) */}
              <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#0B1B3D] via-[#0E2046] to-[#071024] space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-[#0B1B3D] flex items-center justify-center font-black shadow-md">
                      🎙️
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white font-cairo flex items-center gap-2">
                        <span>محرّك الإلقاء الصوتي للراوي (Web Speech TTS)</span>
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono font-bold">
                          Live Active
                        </span>
                      </h4>
                      <p className="text-xs text-[#F5E6AB] font-tajawal">
                        استمع للدرس بالصوت المعتمد وتتبع النص بالتزامن الحي (Read-Along)
                      </p>
                    </div>
                  </div>

                  {/* Audio Controls (Play/Pause, Tones, Speeds) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tone Selectors */}
                    <div className="flex items-center bg-[#070e1f] p-1 rounded-xl border border-slate-700/80 text-xs font-bold font-cairo">
                      <button
                        onClick={() => setVoiceTone('narrator')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          voiceTone === 'narrator'
                            ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title="صوت 1: راوي المنارة الوثائقي (وقور ورصين)"
                      >
                        صوت 1: راوي وثائقي
                      </button>
                      <button
                        onClick={() => setVoiceTone('teacher')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          voiceTone === 'teacher'
                            ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                            : 'text-slate-300 hover:text-white'
                        }`}
                        title="صوت 2: معلم المنارة التفاعلي (حيوي ومباشر)"
                      >
                        صوت 2: معلم تفاعلي
                      </button>
                    </div>

                    {/* Speed Selector */}
                    <div className="flex items-center bg-[#070e1f] p-1 rounded-xl border border-slate-700/80 text-xs font-mono font-bold">
                      {[0.75, 1.0, 1.25].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setAudioSpeed(spd)}
                          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            audioSpeed === spd
                              ? 'bg-[#162C5B] text-[#D4AF37] border border-[#D4AF37]/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Big Play / Pause Button */}
                    <button
                      onClick={handlePlayAudio}
                      className={`px-4 py-2 rounded-xl text-xs font-black font-cairo flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                        isPlayingAudio
                          ? 'bg-amber-500 hover:bg-amber-600 text-[#0B1B3D] animate-pulse ring-2 ring-amber-400/50'
                          : 'bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 hover:brightness-110 text-[#0B1B3D]'
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>▶️ استمع للإلقاء الصوتي</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Real-time Read-Along Sentence Ticker */}
                {readAlongSentence && (
                  <div className="p-3 bg-[#071024] rounded-xl border-2 border-[#D4AF37] shadow-inner flex items-center gap-3 animate-fade-in">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#D4AF37] font-bold block mb-0.5 font-cairo">
                        التزامن الصوتي المباشر (Read-Along):
                      </span>
                      <p className="text-xs sm:text-sm text-white font-bold font-tajawal leading-relaxed">
                        {readAlongSentence}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4 Synchronous Screen Cards Grid */}
                {activeLesson?.cards && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#D4AF37] font-cairo flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>كروت الشاشة التزامنية الأربعة للدرس:</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        تتزامن وتضيء مع موضع الإلقاء
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Card 1: QUESTION */}
                      <div
                        className={`p-3.5 rounded-xl border transition-all ${
                          activeAudioCard === 'question'
                            ? 'bg-amber-950/60 border-amber-400 shadow-lg ring-2 ring-amber-400/50 scale-[1.02]'
                            : 'bg-[#071024]/90 border-amber-500/30 hover:border-amber-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-amber-300 font-cairo px-2 py-0.5 rounded bg-amber-500/20">
                            [QUESTION]
                          </span>
                          <span className="text-base">❓</span>
                        </div>
                        <h5 className="text-xs font-bold text-white font-tajawal leading-relaxed">
                          {activeLesson.cards.question}
                        </h5>
                      </div>

                      {/* Card 2: DEFINITION */}
                      <div
                        className={`p-3.5 rounded-xl border transition-all ${
                          activeAudioCard === 'definition'
                            ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-2 ring-sky-400/50 scale-[1.02]'
                            : 'bg-[#071024]/90 border-sky-500/30 hover:border-sky-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-sky-300 font-cairo px-2 py-0.5 rounded bg-sky-500/20">
                            [DEFINITION]
                          </span>
                          <span className="text-base">📖</span>
                        </div>
                        <p className="text-xs text-slate-200 font-tajawal leading-relaxed">
                          {activeLesson.cards.definition}
                        </p>
                      </div>

                      {/* Card 3: TRICK */}
                      <div
                        className={`p-3.5 rounded-xl border transition-all ${
                          activeAudioCard === 'trick'
                            ? 'bg-emerald-950/60 border-emerald-400 shadow-lg ring-2 ring-emerald-400/50 scale-[1.02]'
                            : 'bg-[#071024]/90 border-emerald-500/30 hover:border-emerald-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-emerald-300 font-cairo px-2 py-0.5 rounded bg-emerald-500/20">
                            [TRICK]
                          </span>
                          <span className="text-base">⚡</span>
                        </div>
                        <p className="text-xs text-emerald-100 font-tajawal leading-relaxed">
                          {activeLesson.cards.trick}
                        </p>
                      </div>

                      {/* Card 4: ANSWER */}
                      <div
                        className={`p-3.5 rounded-xl border transition-all ${
                          activeAudioCard === 'answer'
                            ? 'bg-purple-950/60 border-purple-400 shadow-lg ring-2 ring-purple-400/50 scale-[1.02]'
                            : 'bg-[#071024]/90 border-purple-500/30 hover:border-purple-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-purple-300 font-cairo px-2 py-0.5 rounded bg-purple-500/20">
                            [ANSWER]
                          </span>
                          <span className="text-base">💡</span>
                        </div>
                        <p className="text-xs text-purple-100 font-tajawal leading-relaxed">
                          {activeLesson.cards.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Export Specs Box */}
                <div className="p-2.5 rounded-xl bg-[#060E21] border border-slate-700/60 flex flex-wrap items-center justify-between text-[11px] text-slate-300 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] font-bold">المواصفات الصوتية للتصدير:</span>
                    <span className="font-mono bg-[#0B1B3D] px-2 py-0.5 rounded border border-[#D4AF37]/30 text-[#F5E6AB]">
                      {activeLesson ? `${activeLesson.lessonTitle.replace(/[\s:«»—]+/g, '_')}_Podcast_Mono.mp3` : 'Lesson_Podcast_Mono.mp3'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-emerald-400 font-bold">صيغة MP3 Mono فائقة الخفة (32-64 kbps)</span>
                    <span className="text-sky-300">الحجم التقديري: &lt; 250 كيلوبايت للدقيقة</span>
                  </div>
                </div>

                {/* Expandable Full Documentary Script */}
                {showFullScript && activeLesson && (
                  <div className="p-4 rounded-xl bg-[#060E21] border border-[#D4AF37]/30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-[#D4AF37] font-cairo">
                        نص الاسكريبت الوثائقي المعتمد بعلامات الإلقاء والوقفات:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {activeLesson.documentaryScript.length} حرف
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap font-tajawal text-xs text-slate-200 leading-relaxed max-h-72 overflow-y-auto">
                      {activeLesson.documentaryScript}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 1. SECTION 1: LEARNING OUTCOMES CARD (بطاقة نواتج التعلم المعتمدة) */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
                <span className="text-sm font-bold text-white flex items-center gap-2 font-cairo">
                  <Target className="w-5 h-5 text-[#D4AF37]" />
                  <span>1. نواتج التعلم المعتمدة للدرس (معايير الفهم والتحليل والمقارنة)</span>
                </span>
                <span className="text-xs text-amber-300 font-bold font-mono">
                  {activeLesson?.studentSummary.learningOutcomes.length} نواتج
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeLesson?.studentSummary.learningOutcomes.map((outcome: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[#060E21]/80 p-3.5 rounded-xl border border-slate-700/80 flex items-start gap-2.5 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#D4AF37]/30 font-cairo">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-tajawal">
                      {outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SECTION 2: CONCEPTS GLOSSARY (قاموس المفاهيم والمصطلحات التأسيسية) */}
            {activeLesson?.studentSummary.conceptsGlossary && activeLesson.studentSummary.conceptsGlossary.length > 0 && (
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
                  <span className="text-sm font-bold text-white flex items-center gap-2 font-cairo">
                    <BookOpen className="w-5 h-5 text-sky-400" />
                    <span>2. قاموس المفاهيم والمصطلحات التأسيسية</span>
                  </span>
                  <span className="text-xs text-sky-300 font-cairo">
                    مصطلحات رئيسية ودلالاتها بنظام التقييم
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {activeLesson.studentSummary.conceptsGlossary.map((item: ConceptItem, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#060E21]/85 p-4 rounded-xl border border-slate-700/70 hover:border-sky-400/50 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base text-sky-400">📖</span>
                          <h4 className="text-sm font-bold text-[#F5E6AB] font-cairo">
                            {item.term}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-tajawal bg-[#0B1B3D]/60 p-2.5 rounded-lg border border-slate-800">
                          {item.definition}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-xs">
                        <span className="text-[11px] font-bold text-emerald-400 block mb-1 flex items-center gap-1 font-cairo">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          دلالته بنظام التقييم الحديث 🎯:
                        </span>
                        <p className="text-[11px] text-emerald-200/90 leading-relaxed font-tajawal">
                          {item.modernSystemSignificance}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SECTION 3: AXES EXPLANATIONS (محاور الشرح المقسمة منطقياً: السبب ⬅️ النتيجة) */}
            {activeLesson?.studentSummary.axesExplanations && activeLesson.studentSummary.axesExplanations.length > 0 && (
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
                  <span className="text-sm font-bold text-white flex items-center gap-2 font-cairo">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <span>3. محاور الشرح المقسمة منطقياً (السبب ⬅️ النتيجة والشرح المبسط)</span>
                  </span>
                  <span className="text-xs text-[#F5E6AB] font-cairo">
                    علاقات السببية والتحليل التاريخي
                  </span>
                </div>

                <div className="space-y-4">
                  {activeLesson.studentSummary.axesExplanations.map((axis: AxisExplanation, aIdx: number) => (
                    <div
                      key={aIdx}
                      className="bg-[#060E21]/80 p-4 sm:p-5 rounded-xl border border-slate-700/80 space-y-3.5"
                    >
                      <h4 className="text-sm font-bold text-[#D4AF37] font-cairo flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                        <span>{axis.axisTitle}</span>
                      </h4>

                      {/* Cause and Effect Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#162C5B]/60 p-3.5 rounded-xl border border-sky-500/25 space-y-1">
                          <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 font-cairo">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            السبب والمقدمات التاريخية (Cause):
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-tajawal">
                            {axis.cause}
                          </p>
                        </div>

                        <div className="bg-[#0B4F3C]/40 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
                          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-cairo">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            النتيجة والمنجز الحضاري (Effect):
                          </span>
                          <p className="text-xs text-emerald-100 leading-relaxed font-tajawal">
                            {axis.effect}
                          </p>
                        </div>
                      </div>

                      {/* Egyptian Pedagogy Callout */}
                      <div className="bg-gradient-to-r from-amber-950/40 via-[#162C5B]/50 to-transparent p-3.5 rounded-xl border border-amber-500/30 flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">💡</span>
                        <div className="space-y-1">
                          <strong className="text-xs font-bold text-[#F5E6AB] block font-cairo">
                            عشان تفهمها ببساطة..
                          </strong>
                          <p className="text-xs text-amber-100/90 leading-relaxed font-tajawal">
                            {axis.simpleExplanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SECTION 4: SPECIALIZED CORNER (الزاوية المتخصصة: إضاءة ملاحية ⚓ أو عين على الأثر 🏛️) */}
            {activeLesson?.studentSummary.specializedCorner && (
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  activeLesson.studentSummary.specializedCorner.type === 'maritime'
                    ? 'bg-gradient-to-br from-[#072448]/90 via-[#0B1B3D] to-[#051329] border-sky-500/40 shadow-lg shadow-sky-950/30'
                    : 'bg-gradient-to-br from-[#3b2d13]/90 via-[#0B1B3D] to-[#1a1409] border-[#D4AF37]/50 shadow-lg shadow-amber-950/30'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <span className="text-sm font-bold text-white flex items-center gap-2 font-cairo">
                    {activeLesson.studentSummary.specializedCorner.type === 'maritime' ? (
                      <>
                        <Anchor className="w-5 h-5 text-sky-400" />
                        <span className="text-sky-300">4. الزاوية المتخصصة: إضاءة ملاحية ⚓</span>
                      </>
                    ) : (
                      <>
                        <Landmark className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-[#F5E6AB]">4. الزاوية المتخصصة: عين على الأثر 🏛️</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15">
                    إثراء وتوثيق منهجي
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white font-cairo">
                    {activeLesson.studentSummary.specializedCorner.title}
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-tajawal">
                    {activeLesson.studentSummary.specializedCorner.content}
                  </p>
                </div>
              </div>
            )}

            {/* 5. SECTION 5: VISUAL EQUATION (المعادلة البصرية والخريطة الذهنية للربط) */}
            {activeLesson?.studentSummary.visualEquation && (
              <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/35 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
                  <span className="text-sm font-bold text-white flex items-center gap-2 font-cairo">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>5. المعادلة البصرية والخريطة الذهنية للربط السريع</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    سبب ⬅️ نتيجة
                  </span>
                </div>

                {/* Display as connected sequential steps */}
                <div className="bg-[#060E21]/90 p-4 rounded-xl border border-slate-700/80">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 text-xs font-tajawal">
                    {activeLesson.studentSummary.visualEquation.split('⬅️').map((step: string, sIdx: number, arr: string[]) => (
                      <React.Fragment key={sIdx}>
                        <div className="bg-[#162C5B] px-3.5 py-2 rounded-xl border border-[#D4AF37]/30 text-slate-100 font-bold text-center shadow-md">
                          {step.trim()}
                        </div>
                        {sIdx < arr.length - 1 && (
                          <span className="text-[#D4AF37] font-black text-lg animate-pulse">
                            ⬅️
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE 3D FLIP FLASHCARDS DECK (كروت الفلاش كاردز التفاعلية — دليل الإنجاز السريع) */}
            {activeLesson && (
              <div className="no-print">
                <FlashcardDeck lesson={activeLesson} />
              </div>
            )}

            {/* 6. SECTION 6: BRAIN TEASER (زاوية «شغّل مخك» وتركة امتحانات! «الزتونة») */}
            {activeLesson?.studentSummary.brainTeaser && (
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-[#0B1B3D] to-[#060E21] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/25">
                  <span className="text-sm font-bold text-amber-300 flex items-center gap-2 font-cairo">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <span>6. زاوية «شغّل مخك» وتركة امتحانات! («الزتونة» 💡)</span>
                  </span>
                  <span className="text-xs text-amber-200/80 font-bold font-cairo">
                    تفكير استنتاجي عالي
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#162C5B]/70 p-4 rounded-xl border border-amber-500/30">
                    <span className="text-xs font-bold text-[#F5E6AB] block mb-1.5 font-cairo">
                      سؤال التحدي الاستنتاجي:
                    </span>
                    <p className="text-xs sm:text-sm text-white font-semibold leading-relaxed font-tajawal">
                      {activeLesson.studentSummary.brainTeaser.question}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => toggleTeaser(activeLesson.id)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B1B3D] font-black text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-900/30"
                    >
                      <Eye className="w-4 h-4 text-[#0B1B3D]" />
                      <span>
                        {revealedTeasers[activeLesson.id]
                          ? 'إخفاء فكرة الحل'
                          : '💡 كشف فكرة الحل (الزتونة)'}
                      </span>
                    </button>
                  </div>

                  {revealedTeasers[activeLesson.id] && (
                    <div className="bg-[#0B4F3C]/50 p-4 rounded-xl border border-emerald-500/50 text-xs text-emerald-100 space-y-1.5 transition-all">
                      <strong className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-cairo">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>مفتاح الحل والتحليل الأكاديمي:</span>
                      </strong>
                      <p className="leading-relaxed font-tajawal text-xs sm:text-sm">
                        {activeLesson.studentSummary.brainTeaser.hintOrSolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Backward Compatibility Bar (Core Concept, Quick Capsule, Exam Trick) */}
            {(activeLesson?.studentSummary.coreConcept || activeLesson?.studentSummary.quickCapsule || activeLesson?.studentSummary.directExamTrick) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {activeLesson.studentSummary.coreConcept && (
                  <div className="bg-[#060E21]/70 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-xs font-bold text-sky-400 block mb-1 font-cairo">
                      📌 المفهوم الجوهري:
                    </span>
                    <p className="text-xs text-slate-300 font-tajawal leading-relaxed">
                      {activeLesson.studentSummary.coreConcept}
                    </p>
                  </div>
                )}
                {activeLesson.studentSummary.quickCapsule && (
                  <div className="bg-[#162C5B]/70 p-3.5 rounded-xl border border-[#D4AF37]/30">
                    <span className="text-xs font-bold text-[#F5E6AB] block mb-1 font-cairo">
                      💊 كبسولة الفهم:
                    </span>
                    <p className="text-xs text-slate-300 font-tajawal leading-relaxed">
                      {activeLesson.studentSummary.quickCapsule}
                    </p>
                  </div>
                )}
                {activeLesson.studentSummary.directExamTrick && (
                  <div className="bg-[#0B4F3C]/40 p-3.5 rounded-xl border border-emerald-500/40">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 mb-1 font-cairo">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      ⚡ تريكة الامتحان:
                    </span>
                    <p className="text-xs text-emerald-100 font-semibold font-tajawal leading-relaxed">
                      {activeLesson.studentSummary.directExamTrick}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Dedicated Closing Footer for Print Only */}
            <PrintEndFooter currentTrack={currentTrack} />
          </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COMPARISON MATRICES */}
      {/* ========================================================= */}
      {activeTab === 'comparisons' && (
        <div className="space-y-6">
          {trackComparisons.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border border-dashed border-[#D4AF37]/30">
              <Scale className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
              <h4 className="text-base font-bold text-white font-cairo">
                لا توجد جداول مقارنة منهجية مخصصة لهذا المسار
              </h4>
              <p className="text-xs text-slate-300 font-tajawal max-w-md mx-auto">
                يتم إدراج جداول المقارنة ونواتج التحليل المركبة آلياً أو يدوياً عبر ساحة المعلم.
              </p>
            </div>
          ) : (
            trackComparisons.map((matrix) => (
              <div
                key={matrix.id}
                className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/35 space-y-4 overflow-hidden"
              >
              <div className="flex items-center gap-2 pb-2 border-b border-[#D4AF37]/20">
                <Scale className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="text-base font-bold text-white font-cairo">
                  {matrix.title}
                </h4>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#060E21] border-b border-[#D4AF37]/30 text-[#F5E6AB]">
                      <th className="p-3 font-bold font-cairo w-1/4">وجه المقارنة</th>
                      {matrix.columns.map((col, cIdx) => (
                        <th key={cIdx} className="p-3 font-bold font-cairo">
                          {col.entityName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15">
                    {matrix.criteria.map((criterion, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#162C5B]/40 transition-colors">
                        <td className="p-3 font-bold text-amber-200 bg-[#0B1B3D]/70 font-cairo">
                          {criterion}
                        </td>
                        {matrix.columns.map((col, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-200 font-tajawal leading-relaxed">
                            {col.values[rIdx] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Critical Analysis Trick */}
              <div className="bg-[#0B4F3C]/40 p-3.5 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2 font-tajawal">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{matrix.criticalAnalysis}</span>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: QUIZ BANK (بنك التقييمات التفاعلي) */}
      {/* ========================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-white font-cairo">
                بنك أسئلة نواتج التعلم والمستويات العليا
              </h4>
              <p className="text-xs text-slate-300">
                أسئلة اختيار من متعدد مصممة وفق المعايير الوزارية مع تصحيح وتحليل فوري
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.print()}
                className="no-print px-3.5 py-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-white hover:text-[#0B1B3D] font-bold text-xs transition-colors flex items-center gap-1.5 border border-[#D4AF37]/40 shadow-sm cursor-pointer font-cairo"
                title="طباعة بنك التقييمات كملزمة PDF"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" />
                <span>🖨️ طباعة بنك الأسئلة (PDF)</span>
              </button>

              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] disabled:opacity-50 disabled:pointer-events-none text-[#0B1B3D] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer font-cairo"
                >
                  <Award className="w-4 h-4" />
                  <span>تصحيح الإجابات وعرض النتيجة</span>
                </button>
              ) : (
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-white hover:text-[#0B1B3D] font-bold text-xs transition-colors flex items-center gap-1.5 border border-[#D4AF37]/30 cursor-pointer font-cairo"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة الاختبار</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Smart Elimination Filter Guide Banner */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#0B1B3D] via-[#162C5B]/40 to-[#0B1B3D] shadow-lg space-y-3">
            <button
              onClick={() => setIsCompassOpen(!isCompassOpen)}
              className="w-full flex items-center justify-between text-right text-xs sm:text-sm font-bold text-[#F5E6AB] font-cairo hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  <Compass className="w-4 h-4" />
                </span>
                <span>🎯 بوصلة المنارة: خطوات الحل بمصفاة الاستبعاد الذكي (تشريح جذر السؤال ⬅️ استبعاد البدائل الخاطئة زمنياً وموضوعياً ⬅️ مطابقة ناتج التعلم)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#D4AF37]">
                <span>{isCompassOpen ? 'طي الإرشادات' : 'عرض خطوات الاستبعاد'}</span>
                {isCompassOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isCompassOpen && (
              <div className="pt-3 border-t border-[#D4AF37]/20 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#060E21]/80 p-3.5 rounded-xl border border-sky-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 font-cairo">
                    <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-[11px]">1</span>
                    تشريح جذر السؤال
                  </span>
                  <p className="text-[11px] text-slate-300 font-tajawal leading-relaxed">
                    اقرأ رأس السؤال بدقة متناهية: استخرج الكلمات المفتاحية، الحقبة الزمنية بدقة، وحدد الشرط الحاكم (مثل: يستحيل، يرتبط، سبب مباشر، دلالة اجتماعية).
                  </p>
                </div>

                <div className="bg-[#060E21]/80 p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-cairo">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[11px]">2</span>
                    مصفاة الاستبعاد الذكي
                  </span>
                  <p className="text-[11px] text-slate-300 font-tajawal leading-relaxed">
                    احذف فوراً أي بديل يقع خارج الحقبة الزمنية، أو يخلط بين السبب والنتيجة، أو يناقض نصوص الوثائق المنهجية المعتمدة حتى تحصر الاختيار في الأقرب.
                  </p>
                </div>

                <div className="bg-[#060E21]/80 p-3.5 rounded-xl border border-emerald-500/30 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-cairo">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[11px]">3</span>
                    مطابقة ناتج التعلم
                  </span>
                  <p className="text-[11px] text-slate-300 font-tajawal leading-relaxed">
                    طابق البديل المتبقي مع كود ناتج التعلم المستهدف، وتحقق من كونه يُجيب مباشرة عن علة وجوهر السؤال وليس مجرد معلومة عامة صحيحة.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary Box */}
          {showResults && (
            <div className="glass-panel-gold p-5 rounded-xl border border-[#D4AF37] text-center space-y-2">
              <span className="text-xs text-slate-300">نتيجتك الأكاديمية:</span>
              <div className="text-3xl font-black text-[#F5E6AB] font-cairo">
                {calculateScore()} من {trackQuestions.length}
              </div>
              <p className="text-xs text-emerald-300 font-bold">
                {calculateScore() === trackQuestions.length
                  ? '🌟 ممتاز! إتقان تام لنواتج التعلم والتفكير التاريخي.'
                  : calculateScore() >= trackQuestions.length / 2
                  ? '👍 جيد جداً! راجع التفسيرات والتعليلات المنهجية بالأسفل لضبط المفاهيم.'
                  : '💡 استمر في المراجعة وراجع كبسولات الدروس وتريكات الامتحان الموضحة.'}
              </p>
            </div>
          )}

          {/* Dedicated First Page Header for Print Only */}
          <PrintFirstPageHeader
            currentTrack={currentTrack}
            documentTitle="بنك التقييمات والأسئلة الوزارية المعتمد"
            documentSubtext={trackMeta.shortTitle}
          />

          {/* Question Cards */}
          <div className="space-y-4 print-page-watermark">
            {trackQuestions.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center space-y-3 border border-dashed border-[#D4AF37]/30">
                <Target className="w-10 h-10 text-[#D4AF37] mx-auto opacity-70" />
                <h4 className="text-base font-bold text-white font-cairo">
                  لا توجد أسئلة مسجلة في بنك التقييم لهذا المسار حالياً
                </h4>
                <p className="text-xs text-slate-300 font-tajawal max-w-md mx-auto">
                  يمكن للمعلم إضافة وتعديل الأسئلة يدوياً أو تحويلها ذكياً عبر ساحة المعلم.
                </p>
              </div>
            ) : (
              trackQuestions.map((q, qIdx) => {
                const selectedOpt = selectedAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                <div
                  key={q.id}
                  className="glass-panel print-avoid-break p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#D4AF37] text-[#0B1B3D] font-black flex items-center justify-center font-cairo">
                        {qIdx + 1}
                      </span>
                      <span className="text-[#F5E6AB] font-bold">{q.unit}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        [{q.learningOutcomeCode}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleElimination(q.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        title="عرض استراتيجية تفكيك السؤال واستبعاد البدائل"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>💡 مفتاح الحل (استراتيجيات الاستبعاد)</span>
                      </button>

                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#162C5B] text-sky-300 border border-slate-700">
                        مستوى: {q.cognitiveLevel}
                      </span>
                    </div>
                  </div>

                  {/* Smart Elimination Strategy Drawer */}
                  {revealedEliminations[q.id] && (
                    <div className="bg-gradient-to-r from-amber-950/40 via-[#162C5B]/70 to-[#0B1B3D] p-3.5 sm:p-4 rounded-xl border border-amber-500/40 text-xs space-y-1.5 transition-all">
                      <div className="flex items-center justify-between text-amber-300 font-bold font-cairo">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-[#D4AF37]" />
                          <span>بوصلة الاستبعاد الذكي وتشريح السؤال:</span>
                        </span>
                        <button
                          onClick={() => toggleElimination(q.id)}
                          className="text-[11px] text-slate-400 hover:text-white"
                        >
                          إغلاق ✕
                        </button>
                      </div>
                      <p className="text-amber-100 font-tajawal leading-relaxed">
                        {q.eliminationStrategy || `1) تشريح جذر السؤال: السؤال يستهدف ناتج التعلم [${q.learningOutcomeCode}]. 2) مصفاة الاستبعاد: استبعد البدائل التي لا تتطابق مع التحليل التاريخي المباشر. 3) مطابقة الناتج: البديل (${['أ', 'ب', 'ج', 'د'][q.correctIndex]}) هو الإجابة الدقيقة المحققة للناتج.`}
                      </p>
                    </div>
                  )}

                  <p className="text-sm font-semibold text-white leading-relaxed font-tajawal">
                    {q.questionText}
                  </p>

                  {/* Options with Instant Formative Feedback */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-[#162C5B]/80 text-slate-200 border-slate-700 hover:bg-[#162C5B] hover:border-[#D4AF37]/40';

                      if (isAnswered || showResults) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400';
                        } else if (selectedOpt === optIdx) {
                          btnStyle = 'bg-red-950 border-red-500 text-red-200 font-bold shadow-md shadow-red-950/40 ring-1 ring-red-400';
                        } else {
                          btnStyle = 'bg-[#0B1B3D]/50 text-slate-400 border-slate-800 opacity-60';
                        }
                      } else if (selectedOpt === optIdx) {
                        btnStyle = 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F5E6AB] font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-right text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                            isAnswered && optIdx === q.correctIndex
                              ? 'bg-emerald-500 text-[#0B1B3D] border-emerald-400'
                              : isAnswered && selectedOpt === optIdx
                              ? 'bg-red-500 text-white border-red-400'
                              : 'border-slate-600'
                          }`}>
                            {['أ', 'ب', 'ج', 'د'][optIdx]}
                          </span>
                          <span className="leading-relaxed font-tajawal">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation on Answer Selection or Submit */}
                  {(isAnswered || showResults) && (
                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed font-tajawal animate-fade-in ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                          : 'bg-red-950/30 border-red-500/40 text-red-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-bold mb-1.5 font-cairo">
                        <div className="flex items-center gap-1.5">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-300">إجابة صحيحة ومطابقة لناتج التعلم الوزاري! 🎯</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-300">
                                إجابة غير دقيقة! البديل المعتمد هو: ({['أ', 'ب', 'ج', 'د'][q.correctIndex]})
                              </span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleElimination(q.id)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>{revealedEliminations[q.id] ? 'إخفاء مصفاة الاستبعاد' : '🎯 مصفاة الاستبعاد الذكي ومفتاح الحل'}</span>
                        </button>
                      </div>

                      <p className="text-slate-100">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Dedicated Closing Footer for Print Only */}
        <PrintEndFooter currentTrack={currentTrack} />
      </div>
    )}

      {/* ========================================================= */}
      {/* TAB 5: CHRONOLOGICAL ORDERING ACTIVITY */}
      {/* ========================================================= */}
      {activeTab === 'ordering' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-white font-cairo">
                نشاط التفكير والترتيب الكرونولوجي للأحداث
              </h4>
              <p className="text-xs text-slate-300">
                استخدم أزرار التقديم والتأخير لترتيب الأحداث التاريخية من الأقدم إلى الأحدث
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={checkOrdering}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تحقق من صحة الترتيب</span>
              </button>

              <button
                onClick={resetOrdering}
                className="p-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-slate-200 hover:text-[#0B1B3D] text-xs transition-colors border border-slate-700"
                title="إعادة الترتيب العشوائي"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Verification Status Banner */}
          {orderingChecked && (
            <div
              className={`p-4 rounded-xl border text-xs font-bold text-center ${
                isOrderingCorrect
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                  : 'bg-red-950/60 border-red-500 text-red-200'
              }`}
            >
              {isOrderingCorrect
                ? '🎉 أحسنت! الترتيب الزمني للأحداث دقيق ومطابق للمنهج التاريخي المعتمد.'
                : '❌ الترتيب الحالي غير دقيق. انتبه للحقبة الزمنية والأسرات الحاكمة ثم حاول مجدداً.'}
            </div>
          )}

          {/* Sortable Items List */}
          <div className="space-y-2.5">
            {orderedItems.map((item, idx) => (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-xl border border-[#D4AF37]/25 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#162C5B] border border-[#D4AF37]/40 text-[#F5E6AB] font-black flex items-center justify-center text-sm font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white font-cairo">
                      {item.title}
                    </h5>
                    <span className="text-xs text-amber-300 font-mono">
                      {item.dateOrEra} • {item.context}
                    </span>
                  </div>
                </div>

                {/* Move Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37] text-slate-200 hover:text-[#0B1B3D] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="تحريك لأعلى (أقدم)"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === orderedItems.length - 1}
                    className="p-2 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37] text-slate-200 hover:text-[#0B1B3D] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="تحريك لأسفل (أحدث)"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: REFERENCES & ACADEMIC DOCUMENTATION */}
      {/* ========================================================= */}
      {activeTab === 'references' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-[#D4AF37]/35 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/20">
              <FileCheck className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base font-bold text-white font-cairo">
                دستور المنارة والتوثيق الأكاديمي
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-tajawal space-y-3">
              <p>
                <strong>1. المرجعية المعتمدة:</strong> يلتزم محتوى منصة «أكاديمية المنارة التعليمية» بنصوص وأدلة كتاب وزارة التربية والتعليم والتعليم الفني المصرية، ونواتج التعلم الرسمية المعتمدة للمرحلة الثانوية والبكالوريا.
              </p>
              <p>
                <strong>2. قاعدة الأمانة في التواريخ:</strong> كل تاريخ لم يرد صراحة بالرقم في نصوص كتاب الوزارة يُشار إليه صراحة بـ <span className="text-amber-300 font-bold">«غير محدد في الوحدة»</span>، منعاً للبس والخلط في أسئلة الامتحان النهائي.
              </p>
              <p>
                <strong>3. فلسفة التحليل ونواتج التعلم:</strong> نركز على الربط المنهجي، استخلاص العلاقات السببية بين الجغرافيا والأحداث، وفهم نصوص المعاهدات والنقوش الأثرية لتحقيق أعلى الدرجات في امتحانات الثانوية العامة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen Live Control Modal */}
      <ScreenControlModal
        isOpen={isScreenControlOpen}
        onClose={() => setIsScreenControlOpen(false)}
        currentTrack={currentTrack}
        currentLesson={activeLesson}
        initialTab={screenControlTab}
        onLessonUpdated={(id) => {
          setSelectedLessonId(id);
          setIsScreenControlOpen(false);
        }}
      />
    </div>
  );
};
