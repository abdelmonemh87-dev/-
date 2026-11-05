import React, { useState, useEffect, useRef } from 'react';
import { TrackId, LessonScript } from '../../types';
import { TRACKS, LESSON_SCRIPTS } from '../../data/historyData';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Sliders,
  FileText,
  HelpCircle,
  BookOpen,
  Zap,
  CheckCircle2,
  Share2,
  VolumeX,
  Send,
  MessageSquare,
  ClipboardList,
  GraduationCap,
  Save,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Loader2,
  AlertCircle,
  Printer,
  DownloadCloud,
  FileCode
} from 'lucide-react';
import { PrintFirstPageHeader, PrintEndFooter } from '../Common/PrintHeaderFooter';
import { CurriculumSwitcher } from '../Common/CurriculumSwitcher';
import { ScreenLiveControlBar } from '../Common/ScreenLiveControlBar';
import { ScreenControlModal } from '../Modals/ScreenControlModal';
import { IngestLessonModal } from '../Modals/IngestLessonModal';
import { AddTrackModal } from '../Modals/AddTrackModal';
import { ExportImportModal } from '../Modals/ExportImportModal';
import { ManualTrackManagerModal } from '../Modals/ManualTrackManagerModal';
import { ManualTrackFeederModal } from '../Modals/ManualTrackFeederModal';
import { DataStore } from '../../utils/dataStore';
import { TrackMeta } from '../../types';

interface StudioWorkspaceProps {
  currentTrack: TrackId;
  allTracks?: Record<string, TrackMeta>;
  onSelectTrack?: (track: TrackId) => void;
  onAddCustomTrack?: (track: TrackMeta) => void;
  onOpenAddTrack?: () => void;
}

// Pre-packaged operational curriculum content per lesson
const LESSON_OPERATIONAL_DATA: Record<
  string,
  {
    quiz: Array<{ qText: string; options: string[]; answer: number; code: string }>;
    essay: string[];
    activity: string;
  }
> = {
  't1-l1': {
    quiz: [
      {
        qText: 'وفقاً لنظرية ويل ديورانت، ما الشرط الحاكم المسبق لانطلاق النهضة الفكرية والمعمارية في أي حضارة؟',
        options: ['وفرة المعادن والأخشاب', 'تحقيق الاستقرار النفسي وزوال الخوف', 'الموقع البحري الساحلي', 'وفرة الأيدي العاملة الرخيصة'],
        answer: 1,
        code: 'ن.ت: 1-1'
      },
      {
        qText: 'الغاية العظمى والهدف الأسمى المشترك لجميع الحضارات الإنسانية هو:',
        options: ['السيطرة العسكرية على الجوار', 'تعمير الكون وتحسين ظروف الحياة', 'تراكم الذهب والفضة في الخزائن', 'تخليد أسماء الملوك الفاتحين'],
        answer: 1,
        code: 'ن.ت: 1-1'
      },
      {
        qText: 'عند دراسة تاريخ الأمم الأخرى والتعرف على إنجازاتها، يكتسب الدارس فضيلة منهجية كبرى هي:',
        options: ['التعصب للتراث المحلي فقط', 'الابتعاد عن التعصب وإدراك تواصل الحضارات', 'استنساخ القوانين الأجنبية بحذافيرها', 'إهمال القدوات الوطنية'],
        answer: 1,
        code: 'ن.ت: 1-2'
      },
      {
        qText: 'بدأت شرارة الحضارات الإنسانية الأولى تاريخياً في بلاد:',
        options: ['الغرب الأوروبي (اليونان والرومان)', 'الشرق القديم (مصر والعراق وفارس)', 'أمريكا الشمالية والجنوبية', 'حوض نهر الدانوب في وسط أوروبا'],
        answer: 1,
        code: 'ن.ت: 1-3'
      },
      {
        qText: 'أهم ما يميز علم التاريخ عن مجرد سرد الروايات والأساطير هو قدرته على:',
        options: ['تسلية القراء بالقصص القديمة', 'فهم الحاضر واستشراف آفاق المستقبل واستخلاص العبر', 'حفظ أسماء المعارك دون تحليل أسبابها', 'إلغاء أثر الجغرافيا في التطور البشري'],
        answer: 1,
        code: 'ن.ت: 1-2'
      }
    ],
    essay: [
      'بم تفسر: العلاقة الطردية بين الأمن النفسي وزوال الاضطراب الداخلي عند ويل ديورانت وبين ازدهار العمارة والفنون؟',
      'دلل تاريخياً: الحضارات سلسلة متصلة تتبادل الأخذ والعطاء وليست ملكاً حصرياً لشعب بعينه.'
    ],
    activity: 'تحليل نص: اقرأ مقولة ويل ديورانت حول الحضارة، واستخرج أثر مرحلة الاطمئنان النفسي على ظهور أول مقبرة حجرية في سقارة.'
  },
  't1-l2': {
    quiz: [
      {
        qText: 'أي من المصادر التاريخية الآتية يمتلك أعلى درجة من الدقة والموضوعية العلمية؟',
        options: ['كتابات الفلاسفة بعد قرون من الحدث', 'النقوش والبرديات المعاصرة لوقوع الحدث', 'الأساطير والقصائد الشعرية الحماسية', 'المراجع والكتب الدراسية الحديثة'],
        answer: 1,
        code: 'ن.ت: 1-2'
      },
      {
        qText: 'لجوء الطبقات الفقيرة والمتوسطة في مصر القديمة إلى استخدام "الاستراكا" يعبر عن:',
        options: ['انعدام معرفة المجتمع بالقراءة', 'التفاوت الطبقي ورغبة المجتمع في التدوين والتعليم', 'حظر الكهنة لورق البردي في المعابد', 'رخص تكلفة الأواني الفخارية وتلفها'],
        answer: 1,
        code: 'ن.ت: 1-3'
      },
      {
        qText: 'يستحيل الاستعانة بـ "حجر باليرمو" عند دراسة إنجازات:',
        options: ['الملك سنفرو والأسرة الرابعة', 'الملك رمسيس الثاني في عصر الدولة الحديثة', 'الملك مينا موحد القطرين', 'ملوك عصر ما قبل الأسرات'],
        answer: 1,
        code: 'ن.ت: 1-2'
      },
      {
        qText: 'صلاية الملك نعرمر المصنوعة من حجر الشيست الأخضر تعد وثيقة هامة لدراسة:',
        options: ['الطب والصيدلة القديمة', 'الأسلحة والوحدة السياسية وتتويج الملوك', 'المعاملات المالية والضرائب بالعملة', 'الفلك ومواعيد كسوف الشمس'],
        answer: 1,
        code: 'ن.ت: 1-3'
      },
      {
        qText: 'النقود والمسكوكات تمثل مصدراً دقيقاً لدراسة الأوضاع الاقتصادية عبر:',
        options: ['حجم العملة فقط', 'درجة نقاء المعدن والوزن وصورة الحاكم المنقوشة', 'لون الحبر المستخدم في الطباعة', 'اسم التاجر المشتري'],
        answer: 1,
        code: 'ن.ت: 1-2'
      }
    ],
    essay: [
      'ما العلاقة بين: الوضع الاقتصادي للطبقات الشعبية في مصر القديمة واستخدام الاستراكا في المعاملات اليومية؟',
      'قارن بين: صلاية نعرمر وحجر باليرمو من حيث نوع النقش (بارز/غائر) والحدود الزمنية التي يغطيها كل منهما.'
    ],
    activity: 'فحص أثر: تأمل صورة صلاية نعرمر، وحدد ملامح التاج الأبيض والتاج الأحمر وشارة الملك المنتصر ودلالتها السياسية.'
  },
  't1-l3': {
    quiz: [
      {
        qText: 'أي القيم الآتية اكتسبها المصريون القدماء مباشرة من تحدي مواجهة فيضان نهر النيل؟',
        options: ['العزلة والرهبنة الجبلية', 'الوحدة والتضامن والتكافل الاجتماعي', 'التنافس على غلق الترع والقنوات', 'استيراد الحبوب من بلاد النوبة'],
        answer: 1,
        code: 'ن.ت: 1-4'
      },
      {
        qText: 'مقولة هيرودوت الشهيرة «مصر هبة النيل» غير مكتملة أكاديمياً لأنها أهملت:',
        options: ['موقع مصر الجغرافي', 'جهاد وكفاح الإنسان المصري في ترويض النهر', 'وجود الصحاري الشرقية والغربية', 'اعتدال المناخ في فصل الشتاء'],
        answer: 1,
        code: 'ن.ت: 1-4'
      },
      {
        qText: 'السبب المباشر في بقاء الآثار والبرديات والمومياوات المصرية القديمة سليمة حتى اليوم هو:',
        options: ['الأمطار الاستوائية الغزيرة', 'المناخ الجاف المعتدل غير الرطب', 'كثرة الزلازل والفيضانات', 'دفن الآثار تحت مياه البحر'],
        answer: 1,
        code: 'ن.ت: 1-5'
      },
      {
        qText: 'ساعد انحدار مجرى نهر النيل من الجنوب إلى الشمال مع هبوب الرياح الشمالية السائدة على:',
        options: ['توقف الملاحة النهرية نهائياً', 'سهولة حركة التجارة والملاحة النهرية بين الشمال والجنوب', 'جفاف الدلتا وتحولها لصحراء', 'انفصال الصعيد عن الوجه البحري'],
        answer: 1,
        code: 'ن.ت: 1-5'
      },
      {
        qText: 'مثلت الحدود الطبيعية الآمنة لمصر (الصحاري والجنادل والبحار) دوراً حاسماً في:',
        options: ['عزل مصر تماماً عن العالم الخارجي', 'توفير الأمن والاستقرار وحماية البلاد من الطامعين', 'منع المصريين من ركوب البحر للتجارة', 'تجميد النشاط الزراعي في الوادي'],
        answer: 1,
        code: 'ن.ت: 1-4'
      }
    ],
    essay: [
      'انقد منهجياً مقولة المؤرخ الإغريقي هيرودوت «مصر هبة النيل»، موضحاً دور العامل البشري في صناعة المجد الحضاري.',
      'بم تفسر: كيف ساعد نهر النيل في بناء جسور التواصل الإنساني والتجاري بين مصر وإفريقيا؟'
    ],
    activity: 'قراءة خريطة: حدد على خريطة مصر القديمة مواقع الجنادل في جنوب النهر ودورها كدروع طبيعية حامية للحدود الجنوبية.'
  }
};

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  currentTrack,
  allTracks,
  onSelectTrack,
  onAddCustomTrack,
  onOpenAddTrack
}) => {
  const trackMeta = (allTracks && allTracks[currentTrack]) || TRACKS[currentTrack] || TRACKS['track1'];

  // Global data update listener
  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setDataVersion((v) => v + 1);
    window.addEventListener('manara_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('manara_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Modals state
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isLocalAddTrackOpen, setIsLocalAddTrackOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isManualManagerOpen, setIsManualManagerOpen] = useState(false);
  const [isFeederOpen, setIsFeederOpen] = useState(false);
  const [exportImportInitialTab, setExportImportInitialTab] = useState<'export' | 'import'>('export');

  // Screen Control Modal state
  const [isScreenControlOpen, setIsScreenControlOpen] = useState(false);
  const [screenControlTab, setScreenControlTab] = useState<'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack'>('editLesson');

  const openScreenControl = (tab: 'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack') => {
    setScreenControlTab(tab);
    setIsScreenControlOpen(true);
  };

  // Combine custom lessons with built-in track lessons using DataStore
  const allTrackLessons = React.useMemo(() => {
    return DataStore.getLessons(currentTrack);
  }, [currentTrack, dataVersion]);

  // Lesson counts per track for CurriculumSwitcher
  const lessonCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const keys = Object.keys(allTracks || TRACKS);
    keys.forEach((k) => {
      counts[k] = DataStore.getLessons(k as TrackId).length;
    });
    return counts;
  }, [allTracks, dataVersion]);

  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  useEffect(() => {
    if (allTrackLessons.length > 0) {
      setSelectedLessonId(allTrackLessons[0].id);
    }
  }, [currentTrack, allTrackLessons.length]);

  const currentLesson = React.useMemo(() => {
    if (allTrackLessons.length === 0) return null;
    return allTrackLessons.find((l) => l.id === selectedLessonId) || allTrackLessons[0];
  }, [allTrackLessons, selectedLessonId]);

  // Editable script and cards state
  const [editableScript, setEditableScript] = useState<string>('');
  const [editableQuestion, setEditableQuestion] = useState<string>('');
  const [editableDefinition, setEditableDefinition] = useState<string>('');
  const [editableTrick, setEditableTrick] = useState<string>('');
  const [editableAnswer, setEditableAnswer] = useState<string>('');

  useEffect(() => {
    if (currentLesson) {
      setEditableScript(currentLesson.documentaryScript);
      setEditableQuestion(currentLesson.cards.question);
      setEditableDefinition(currentLesson.cards.definition);
      setEditableTrick(currentLesson.cards.trick);
      setEditableAnswer(currentLesson.cards.answer);
    } else {
      setEditableScript('');
      setEditableQuestion('');
      setEditableDefinition('');
      setEditableTrick('');
      setEditableAnswer('');
    }
    stopAudio();
  }, [currentLesson?.id]);

  // Audio / Speech Synthesis state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92); // Recommended 0.92x
  const [speechPitch, setSpeechPitch] = useState<number>(0.95); // Recommended 0.95 for documentary gravitas
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCards, setCopiedCards] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI Settings Drawer & Generator state
  const [showSettings, setShowSettings] = useState(false);
  const [modelType, setModelType] = useState<'pro' | 'flash'>('flash');
  const [temperature, setTemperature] = useState<number>(0.65);
  const [topP, setTopP] = useState<number>(0.95);

  // AI Assistant generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);

  // Operational Deck Tab state
  const [activeDeckTab, setActiveDeckTab] = useState<'quiz' | 'assignment' | 'parent'>('quiz');
  const [copiedQuiz, setCopiedQuiz] = useState(false);
  const [copiedAssignment, setCopiedAssignment] = useState(false);
  const [copiedParentReport, setCopiedParentReport] = useState(false);

  // Parent report live input fields
  const [studentName, setStudentName] = useState('أحمد محمد');
  const [attendanceStatus, setAttendanceStatus] = useState('حاضر ومشارك بامتياز 🌟');
  const [quizScore, setQuizScore] = useState('9');
  const [academicNote, setAcademicNote] = useState('إتقان متميز لنواتج التعلم وتريكات الامتحان المركبة');
  const [parentPhone, setParentPhone] = useState('');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const cleanScriptForTTS = (script: string) => {
    return script
      .replace(/\[توقف قصير\]/g, ' ... ')
      .replace(/\[وقفة تأملية\]/g, ' .... ')
      .replace(/\[نبرة هادئة\]/g, '')
      .replace(/\[نبرة حماسية\]/g, '')
      .trim();
  };

  const playAudio = () => {
    if (!synthRef.current) return;

    if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
      return;
    }

    synthRef.current.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);

    const cleanText = cleanScriptForTTS(editableScript);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-EG';
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Pick best Arabic voice if available
    const voices = synthRef.current.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setActiveCardIndex(0);
    };

    // Calculate reading duration dynamically for smooth card synchronization
    const textLength = cleanText.length;
    const estimatedTotalMs = Math.max(12000, ((textLength / 12) / speechRate) * 1000);
    const cardStepMs = Math.round(estimatedTotalMs / 4);

    let currentStep = 0;
    intervalRef.current = setInterval(() => {
      if (!synthRef.current || !synthRef.current.speaking) {
        clearInterval(intervalRef.current);
        return;
      }
      currentStep = (currentStep + 1) % 4;
      setActiveCardIndex(currentStep);
    }, cardStepMs);

    utterance.onend = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const pauseAudio = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setActiveCardIndex(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const copyScriptText = () => {
    const fullText = `${currentLesson?.lessonTitle}\n${trackMeta.academicSubtitle}\n«هنذاكر ${trackMeta.targetSubject} سوا» 🎯\n\n${editableScript}\n\nأكاديمية المنارة التعليمية | «هنذاكر ${trackMeta.targetSubject} سوا» 🎯 | واتساب: 01097083710`;
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyCardsText = () => {
    const cardsFormatted = `[كروت الشاشة التزامنية — ${currentLesson?.lessonTitle}]\n${trackMeta.academicSubtitle}\n\n[QUESTION]: ${editableQuestion}\n\n[DEFINITION]: ${editableDefinition}\n\n[TRICK]: ${editableTrick}\n\n[ANSWER]: ${editableAnswer}\n\nأكاديمية المنارة التعليمية | «هنذاكر ${trackMeta.targetSubject} سوا» 🎯 | واتساب: 01097083710`;
    navigator.clipboard.writeText(cardsFormatted);
    setCopiedCards(true);
    setTimeout(() => setCopiedCards(false), 2000);
  };

  // AI Generator Function
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `المطلوب إنتاج اسكريبت سردي وثائقي وقور ومضبوط بعلامات الإلقاء الصوتية لمحركات الـ TTS: [توقف قصير]، [نبرة هادئة]، [نبرة حماسية]، [وقفة تأملية] للموضوع التالي:\n${aiPrompt}\n\nواستخراج كروت الشاشة التزامنية الأربعة صراحة داخل كتل مستقلة:\n[QUESTION]: السؤال الفكري أو التطبيقي\n[DEFINITION]: المفهوم أو المصطلح المنهجي\n[TRICK]: تريكة الامتحان وناتج التعلم المركب\n[ANSWER]: الإجابة المنهجية الحاسمة.`,
          mode: 'studio',
          track: currentTrack,
          modelType,
          temperature,
          topP
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'فشل الاتصال بمحرك الذكاء الاصطناعي');
      }

      const data = await response.json();
      const reply = data.reply || '';

      // Extract cards using Regex
      const qMatch = reply.match(/\[QUESTION\]:?\s*([^\n\r]+(?:\n(?!\s*\[)[^\n\r]+)*)/i);
      const dMatch = reply.match(/\[DEFINITION\]:?\s*([^\n\r]+(?:\n(?!\s*\[)[^\n\r]+)*)/i);
      const tMatch = reply.match(/\[TRICK\]:?\s*([^\n\r]+(?:\n(?!\s*\[)[^\n\r]+)*)/i);
      const aMatch = reply.match(/\[ANSWER\]:?\s*([^\n\r]+(?:\n(?!\s*\[)[^\n\r]+)*)/i);

      if (qMatch && qMatch[1]) setEditableQuestion(qMatch[1].trim());
      if (dMatch && dMatch[1]) setEditableDefinition(dMatch[1].trim());
      if (tMatch && tMatch[1]) setEditableTrick(tMatch[1].trim());
      if (aMatch && aMatch[1]) setEditableAnswer(aMatch[1].trim());

      // Extract script portion: everything up to [QUESTION] or the main body
      let scriptPortion = reply;
      const firstCardIndex = reply.search(/\[QUESTION\]/i);
      if (firstCardIndex > 0) {
        scriptPortion = reply.substring(0, firstCardIndex).trim();
      }
      setEditableScript(scriptPortion);

      setGenerationSuccess('✨ تم توليد الاسكريبت وكروت الشاشة التزامنية بنجاح!');
      stopAudio();
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.message || 'حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current/edited lesson to LocalStorage
  const handleSaveToLocalStorage = () => {
    const lessonTitle = currentLesson?.lessonTitle || `درس مخصص — ${new Date().toLocaleDateString('ar-EG')}`;
    const lessonId = currentLesson?.id.startsWith('custom-')
      ? currentLesson.id
      : `custom-${Date.now()}`;

    const newLessonObj: LessonScript = {
      id: lessonId,
      trackId: currentTrack,
      lessonTitle,
      unitTitle: currentLesson?.unitTitle || 'الوحدة المخصصة للمعلم',
      academicSubtitle: trackMeta.academicSubtitle,
      documentaryScript: editableScript,
      cards: {
        question: editableQuestion,
        definition: editableDefinition,
        trick: editableTrick,
        answer: editableAnswer
      },
      studentSummary: {
        coreConcept: editableDefinition,
        quickCapsule: editableScript.slice(0, 150) + '...',
        directExamTrick: editableTrick,
        learningOutcomes: [
          'استيعاب المفهوم الجوهري للدرس وتطبيقاته.',
          'الربط الدقيق بين الشواهد التاريخية ونواتج التعلم.',
          'القدرة على استبعاد البدائل الخاطئة في امتحانات التقييم الحديث.'
        ]
      }
    };

    DataStore.saveLesson(newLessonObj);

    setSelectedLessonId(lessonId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Operational Deck Generator for active lesson
  const activeOperational =
    LESSON_OPERATIONAL_DATA[currentLesson?.id || 't1-l1'] || {
      quiz: [
        {
          qText: `ما هو ناتج التعلم الرئيسي المستخلص من: "${currentLesson?.lessonTitle}"؟`,
          options: ['الحفظ التلقائي للتواريخ', editableDefinition || 'الربط المنهجي واستخلاص العبر', 'إهمال العامل البشري', 'الانعزال الحضاري'],
          answer: 1,
          code: 'ن.ت: 1-1'
        },
        {
          qText: editableQuestion || 'كيف يؤثر الاستقرار والأمن الداخلي على إنتاج المظاهر الحضارية؟',
          options: ['يؤدي لتوقف البناء', 'يعد الشرط الأساسي لإطلاق طاقات الإبداع', 'لا يؤثر في الفنون والعمارة', 'يقتصر أثره على التجارة فقط'],
          answer: 1,
          code: 'ن.ت: 1-2'
        },
        {
          qText: 'تريكة الامتحان وناتج التعلم المركب في هذا الدرس تركز على:',
          options: ['ذكر أرقام الصفحات', editableTrick || 'علاقة السبب بالنتيجة وتجنب التعصب', 'إلغاء أثر البيئة الجغرافية', 'تجاهل المصادر الأولية'],
          answer: 1,
          code: 'ن.ت: 1-3'
        },
        {
          qText: 'أي مما يلي يعبر عن المفهوم العلمي الدقيق المتضمن في الشرح؟',
          options: ['روايات غير موثقة', editableAnswer || 'الوثائق التاريخية والشواهد المادية المعاصرة', 'الأساطير الشفوية المنفصلة', 'الآراء الشخصية غير المدعمة بأدلة'],
          answer: 1,
          code: 'ن.ت: 1-4'
        },
        {
          qText: 'الغاية الكبرى من دراسة هذا الدرس وفق معايير التقييم الحديثة هي:',
          options: ['حفظ النصوص نصياً', 'بناء الوعي الوطني واستشراف المستقبل', 'تكرار الأخطاء السابقة', 'الاقتصار على اجتياز الاختبار فقط'],
          answer: 1,
          code: 'ن.ت: 1-5'
        }
      ],
      essay: [
        `بم تفسر: الأهمية المنهجية لمحاور الشرح في درس (${currentLesson?.lessonTitle})؟`,
        'دلل تاريخياً: بالاعتماد على الشواهد المنهجية، وضح كيف يرتبط هذا الحدث بالأمن القومي أو البناء الحضاري.'
      ],
      activity: `تحليل وثيقة: استخرج من اسكريبت الدرس (${currentLesson?.lessonTitle}) الدلالة المباشرة التي تثبت أثر العامل البشري في صناعة الحدث.`
    };

  // Format Quiz Text for Copy
  const getFormattedQuizText = () => {
    let text = `🎯 الكويز الإلكتروني السريع (Instant Quiz)\nأكاديمية المنارة التعليمية — «هنذاكر ${trackMeta.targetSubject} سوا» 🎯\nالدرس: ${currentLesson?.lessonTitle}\nالصف: ${trackMeta.shortTitle}\n\n`;
    activeOperational.quiz.forEach((q, idx) => {
      text += `س${idx + 1}: ${q.qText} [${q.code}]\n`;
      q.options.forEach((opt, oIdx) => {
        text += `  (${['أ', 'ب', 'ج', 'د'][oIdx]}) ${opt}\n`;
      });
      text += `  * الإجابة الصحيحة: (${['أ', 'ب', 'ج', 'د'][q.answer]})\n\n`;
    });
    text += `أكاديمية المنارة التعليمية | «هنذاكر ${trackMeta.targetSubject} سوا» 🎯 | واتساب: 01097083710`;
    return text;
  };

  // Format Assignment Text for Copy
  const getFormattedAssignmentText = () => {
    let text = `📚 الواجب التحليلي الأسبوعي (Google Classroom Assignment)\nأكاديمية المنارة التعليمية — ${trackMeta.academicSubtitle}\n«هنذاكر ${trackMeta.targetSubject} سوا» 🎯\n\n📌 موضوع التكليف: نواتج تعلم ${currentLesson?.lessonTitle}\n\nأولاً: الأسئلة المقالية التحليلية:\n`;
    activeOperational.essay.forEach((eQ, idx) => {
      text += `${idx + 1}. ${eQ}\n`;
    });
    text += `\nثانياً: نشاط تحليل النص التاريخي:\n${activeOperational.activity}\n\n`;
    text += `⏰ موعد التسليم: قبل بداية الحصة القادمة عبر منصة Google Classroom.\nمعايير التقييم: الدقة العلمية، الربط بين السبب والنتيجة، والتحليل المستقل دون نسخ.\n\nأكاديمية المنارة التعليمية | «هنذاكر ${trackMeta.targetSubject} سوا» 🎯 | واتساب: 01097083710`;
    return text;
  };

  // Format WhatsApp Parent Report
  const getFormattedParentReport = () => {
    return `السلام عليكم ورحمة الله وبركاته 🌹
ولي أمر الطالب العزيز: ${studentName.trim() || 'الطالب'}
تقرير المتابعة الأكاديمية لحصة: المنارة في ${trackMeta.targetSubject}
الدرس: ${currentLesson?.lessonTitle} (${trackMeta.shortTitle})

📊 حالة الحضور والتفاعل: ${attendanceStatus}
🎯 نتيجة الكويز السريع اليوم: ${quizScore} من 10
💡 ملاحظة الدعم الأكاديمي: ${academicNote}

أكاديمية المنارة التعليمية | «هنذاكر ${trackMeta.targetSubject} سوا» 🎯 | واتساب: 01097083710`;
  };

  const handleCopyQuiz = () => {
    navigator.clipboard.writeText(getFormattedQuizText());
    setCopiedQuiz(true);
    setTimeout(() => setCopiedQuiz(false), 2000);
  };

  const handleCopyAssignment = () => {
    navigator.clipboard.writeText(getFormattedAssignmentText());
    setCopiedAssignment(true);
    setTimeout(() => setCopiedAssignment(false), 2000);
  };

  const handleCopyParentReport = () => {
    navigator.clipboard.writeText(getFormattedParentReport());
    setCopiedParentReport(true);
    setTimeout(() => setCopiedParentReport(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(getFormattedParentReport());
    const phone = parentPhone.replace(/[^0-9]/g, '');
    const url = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
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

      {/* Screen Live Control Bar */}
      <ScreenLiveControlBar
        currentTrack={currentTrack}
        currentLesson={currentLesson}
        onOpenControlModal={openScreenControl}
        onOpenManagerModal={() => setIsManualManagerOpen(true)}
      />

      {/* Top Banner & Control Deck */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            {/* Output Naming and Academic Subtitle */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6AB] to-[#D4AF37] font-cairo">
                المنارة في {trackMeta.targetSubject}
              </span>
              <span className="text-xs bg-[#0B4F3C] text-emerald-200 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                ساحة عمل المعلم والراوي الوثائقي
              </span>
            </div>
            {/* Strict Academic Descriptive Line */}
            <p className="text-sm font-bold text-[#F5E6AB] font-tajawal">
              [{trackMeta.academicSubtitle}]
            </p>
            <p className="text-xs text-slate-300 mt-1">
              إنتاج الاسكريبتات السردية الوقورة المضبوطة بمحركات الإلقاء، هندسة الكروت التزامنية، وتوليد المخرجات التشغيلية الثلاثية.
            </p>
          </div>

          {/* Studio Actions Bar (Simplified to 3 Primary Buttons) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* 1. Ingest Lesson with AI */}
            <button
              onClick={() => setIsIngestOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer font-cairo"
              title="تغذية المسار بدرس أو بنك أسئلة جديد من نص خام أو مذكرة عبر المعالجة الذكية"
            >
              <DownloadCloud className="w-4 h-4 text-emerald-200" />
              <span>📥 تغذية بالذكاء الاصطناعي</span>
            </button>

            {/* 2. Manual Track Feeder (Structured form + JSON paste + Safe LocalStorage) */}
            <button
              onClick={() => setIsFeederOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer font-cairo"
              title="التغذية اليدوية للدروس والمسارات بنموذج الحقول المنظمة أو لصق JSON والتصدير والاستيراد"
            >
              <DownloadCloud className="w-4 h-4 text-amber-200" />
              <span>📥 التغذية اليدوية للدروس والمسارات</span>
            </button>

            {/* 2. Unified Content & Tracks Manager */}
            <button
              onClick={() => setIsManualManagerOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#162C5B] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#2563EB] text-amber-200 hover:text-white border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer font-cairo"
              title="إدارة شاملة وموحدة: تعديل وإضافة الدروس والأحداث وبنك الأسئلة، وإنشاء مسارات جديدة، والتصدير والاستيراد"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              <span>🗂️ إدارة المحتوى والمسارات</span>
            </button>

            {/* 3. Model Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer font-cairo ${
                showSettings
                  ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37] shadow-sm'
                  : 'bg-[#162C5B] hover:bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F5E6AB]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>⚙️ إعدادات النموذج</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300 font-mono">
                {modelType.toUpperCase()} | {temperature}
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible Model Settings Drawer */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-[#D4AF37]/20 bg-[#060E21]/60 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#F5E6AB]">
              <span className="flex items-center gap-1.5 font-cairo">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                مواصفات ضبط النموذج داخل القائمة الجانبية في Google AI Studio:
              </span>
              <span className="text-[11px] text-slate-400">
                منضبطة وفق معايير رصانة الطرح الأكاديمي
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#0B1B3D] p-3 rounded-lg border border-[#D4AF37]/25">
                <span className="text-slate-400 block mb-1">النموذج (Model):</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModelType('pro')}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                      modelType === 'pro'
                        ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37] shadow-sm'
                        : 'bg-[#162C5B] text-slate-300 border-slate-700'
                    }`}
                  >
                    Gemini 2.5 Pro (للتحليل المتعمق)
                  </button>
                  <button
                    onClick={() => setModelType('flash')}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                      modelType === 'flash'
                        ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37] shadow-sm'
                        : 'bg-[#162C5B] text-slate-300 border-slate-700'
                    }`}
                  >
                    Gemini 2.5 Flash (للسرعة الفورية)
                  </button>
                </div>
              </div>

              <div className="bg-[#0B1B3D] p-3 rounded-lg border border-[#D4AF37]/25">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">درجة الحرارة (Temperature):</span>
                  <span className="font-mono text-[#D4AF37] font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  المعيار المعتمد: 0.65 بدقة لمنع الاستطراد وضمان الرصانة.
                </span>
              </div>

              <div className="bg-[#0B1B3D] p-3 rounded-lg border border-[#D4AF37]/25">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">التوزيع الاحتمالي (Top P):</span>
                  <span className="font-mono text-[#D4AF37] font-bold">{topP}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.01"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  المعيار المعتمد: 0.95 لإثراء الصياغة اللغوية والتأملية.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Selector Bar (Clean without duplicates) */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-[#D4AF37]/20">
          <span className="text-xs font-bold text-[#F5E6AB] ml-2 font-cairo">
            اختر المحتوى الدراسي:
          </span>
          {allTrackLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLessonId(lesson.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentLesson?.id === lesson.id
                  ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-md shadow-[#D4AF37]/20 font-cairo'
                  : 'bg-[#162C5B] text-slate-300 hover:text-white border border-[#D4AF37]/20 font-tajawal'
              }`}
            >
              {lesson.id.startsWith('custom-') && <span className="text-[10px] text-emerald-400 font-bold">★</span>}
              <span>{lesson.lessonTitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. SECTION 1: AI ASSISTANT FOR GENERATING LESSONS & PODCASTS (المساعد الذكي لإنتاج الاسكريبتات) */}
      <div className="no-print glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/45 bg-gradient-to-br from-[#0B1B3D] via-[#0E2046] to-[#071126] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/25">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-600 flex items-center justify-center text-[#0B1B3D] shadow-md shadow-[#D4AF37]/20">
              <Sparkles className="w-5 h-5 fill-[#0B1B3D]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                ✨ المساعد الذكي لإنتاج الاسكريبتات وكروت الشاشة التزامنية
              </h3>
              <p className="text-xs text-slate-300 font-tajawal">
                اكتب عنوان الدرس أو موضوع حلقة البودكاست لإنتاج اسكريبت وثائقي متكامل وتوليد الكروت الأربعة تلقائياً
              </p>
            </div>
          </div>

          <span className="text-xs text-[#D4AF37] bg-[#162C5B] px-3 py-1 rounded-xl border border-[#D4AF37]/30 font-bold font-cairo">
            المسار: {trackMeta.shortTitle}
          </span>
        </div>

        {/* Input & Quick Presets */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="اكتب هنا عنوان الدرس الجديد، ناتج التعلم المستهدف، أو فكرة حلقة بودكاست (مثال: شرح درس حضارة بلاد العراق القديم ومقارنتها بالحضارة المصرية..)"
              rows={3}
              className="w-full bg-[#060E21]/90 border border-[#D4AF37]/40 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-all resize-none font-tajawal"
            />
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#F5E6AB] ml-1 font-cairo">
              أفكار مقترحة سريعة:
            </span>
            {[
              'شرح نواتج تعلم حضارة بلاد العراق القديم وتريكة الامتحان',
              'الحضارة الفينيقية والتجارة البحرية الدولية',
              'بودكاست حواديت منسية: ملحمة أبطال رشيد 1807 وعبقرية الصمود',
              'معركة مجدو والعبقرية العسكرية لتحتمس الثالث'
            ].map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setAiPrompt(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37]/20 border border-slate-700 hover:border-[#D4AF37]/40 text-[11px] text-slate-300 hover:text-white transition-all font-tajawal"
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Action Trigger Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 font-tajawal">
              يتم استخلاص الاسكريبت وتعبئة كروت الشاشة التزامنية الأربعة تلقائياً داخل مساحة التعديل بالأسفل.
            </div>

            <button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPrompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-[#e6b847] hover:to-amber-400 disabled:opacity-50 text-[#0B1B3D] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B1B3D]" />
                  <span>جارٍ التوليد الأكاديمي بواسطة راوي المنارة...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-[#0B1B3D]" />
                  <span>توليد الاسكريبت والكروت التزامنية الأربعة 🚀</span>
                </>
              )}
            </button>
          </div>

          {/* Status feedback alerts */}
          {generationSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between font-tajawal">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{generationSuccess}</span>
              </span>
              <button
                onClick={handleSaveToLocalStorage}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ في قائمة دروس المسار</span>
              </button>
            </div>
          )}

          {generationError && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-xs text-red-200 flex items-center gap-2 font-tajawal">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{generationError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated First Page Header for Print Only */}
      <PrintFirstPageHeader
        currentTrack={currentTrack}
        documentTitle={currentLesson?.lessonTitle}
        documentSubtext={currentLesson?.unitTitle}
      />

      {/* 2. MAIN TWO-ZONE STUDIO LAYOUT: (Script Editor & Audio TTS) & (Synchronized Screen Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-page-watermark">
        {/* Left Column (7 cols): Documentary Script & Audio TTS Narration */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel manara-watermark p-5 rounded-2xl border border-[#D4AF37]/35 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
              <div>
                <h3 className="text-base font-bold text-white font-cairo">
                  {currentLesson?.lessonTitle}
                </h3>
                <span className="text-xs text-[#F5E6AB] block">
                  {currentLesson?.unitTitle}
                </span>
              </div>

              {/* Action Buttons: Copy Script & Save Changes & Print */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="no-print px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm font-cairo cursor-pointer"
                  title="طباعة اسكريبت الدرس والكروت كملزمة PDF بالتنسيق المعتمد"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>🖨️ طباعة الملزمة بالتنسيق المعتمد</span>
                </button>

                <button
                  onClick={handleSaveToLocalStorage}
                  title="حفظ التعديلات في قائمة المسار بذاكرة المتصفح"
                  className="no-print px-3 py-1.5 rounded-lg bg-[#0B4F3C] hover:bg-emerald-600 text-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>تم الحفظ!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ الدرس محلياً</span>
                    </>
                  )}
                </button>

                <button
                  onClick={copyScriptText}
                  className="no-print px-3 py-1.5 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37] text-slate-200 hover:text-[#0B1B3D] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#D4AF37]/30 cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الاسكريبت للمونتاج</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Interactive TTS Audio Deck Bar */}
            <div className="bg-[#060E21] p-3.5 rounded-xl border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {!isPlaying ? (
                  <button
                    onClick={playAudio}
                    className="w-10 h-10 rounded-full bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/30 transition-all cursor-pointer"
                    title="تشغيل الإلقاء الصوتي للراوي الوثائقي"
                  >
                    <Play className="w-5 h-5 ml-0.5 fill-[#0B1B3D]" />
                  </button>
                ) : (
                  <button
                    onClick={pauseAudio}
                    className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-[#0B1B3D] flex items-center justify-center font-bold shadow-lg transition-all cursor-pointer"
                    title="إيقاف مؤقت"
                  >
                    <Pause className="w-5 h-5 fill-[#0B1B3D]" />
                  </button>
                )}

                <button
                  onClick={stopAudio}
                  className="w-9 h-9 rounded-lg bg-[#162C5B] hover:bg-red-900/40 text-slate-300 hover:text-red-300 flex items-center justify-center border border-slate-700 transition-colors"
                  title="إيقاف وإعادة التشغيل من البداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-slate-300 font-cairo">
                    {isPlaying ? 'الراوي الوثائقي يتلو الاسكريبت...' : 'محاكي الإلقاء الصوتي جاهز'}
                  </span>
                </div>
              </div>

              {/* Speed & Pitch Controls */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Speed Controller with exact requested values */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">السرعة:</span>
                  {[0.8, 0.92, 1.0, 1.2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        speechRate === rate
                          ? 'bg-[#D4AF37] text-[#0B1B3D]'
                          : 'bg-[#162C5B] text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Pitch Controller */}
                <div className="flex items-center gap-1.5 pl-1 border-r border-slate-700">
                  <span className="text-slate-400 text-[11px]">النبرة:</span>
                  {[
                    { val: 0.85, label: 'عميق' },
                    { val: 0.95, label: 'وقور وثائقي 🎯' },
                    { val: 1.0, label: 'طبيعي' }
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setSpeechPitch(p.val)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        speechPitch === p.val
                          ? 'bg-amber-400 text-[#0B1B3D]'
                          : 'bg-[#162C5B] text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Script Editor with Audio Tags Highlight Explanation */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-[#F5E6AB] font-cairo">
                  نص الاسكريبت السردي المضبوط بعلامات الإلقاء الصوتي للـ TTS:
                </span>
                <span className="text-[11px] text-amber-300">
                  (علامات الإلقاء تدرب المعلم أو محرك الـ TTS على وقار السرد)
                </span>
              </div>
              <textarea
                value={editableScript}
                onChange={(e) => setEditableScript(e.target.value)}
                rows={12}
                className="w-full bg-[#0B1B3D]/90 border border-[#D4AF37]/35 rounded-xl p-4 text-slate-100 font-tajawal text-sm leading-relaxed focus:outline-none focus:border-[#D4AF37] transition-all resize-y"
              />
            </div>

            {/* Legend for TTS Audio Tags */}
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <span className="px-2.5 py-1 rounded bg-[#060E21] border border-sky-500/40 text-sky-300 font-mono text-[11px]">
                [توقف قصير] = سكتة إدراكية
              </span>
              <span className="px-2.5 py-1 rounded bg-[#060E21] border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
                [نبرة هادئة] = سرد تأملي وقور
              </span>
              <span className="px-2.5 py-1 rounded bg-[#060E21] border border-amber-500/40 text-amber-300 font-mono text-[11px]">
                [نبرة حماسية] = ذروة الملحمة
              </span>
              <span className="px-2.5 py-1 rounded bg-[#060E21] border border-purple-500/40 text-purple-300 font-mono text-[11px]">
                [وقفة تأملية] = استخلاص الحكمة
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Synchronized 4 Screen Cards with Manual Zoom Trigger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel manara-watermark p-5 rounded-2xl border border-[#D4AF37]/35 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white font-cairo">
                  كروت الشاشة التزامنية الأربعة
                </h3>
              </div>

              <button
                onClick={copyCardsText}
                className="px-3 py-1.5 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37] text-slate-200 hover:text-[#0B1B3D] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#D4AF37]/30"
              >
                {copiedCards ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكروت</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-tajawal">
              تنتقل الإضاءة آلياً بين الكروت أثناء القراءة الصوتية، ويمكنك النقر يدوياً على أي كارت لتنشيطه فوراً أثناء البث المباشر (Zoom / Meet).
            </p>

            {/* Card 0: [QUESTION] */}
            <div
              onClick={() => setActiveCardIndex(0)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeCardIndex === 0
                  ? 'bg-[#162C5B] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 ring-2 ring-[#D4AF37]/60'
                  : 'bg-[#060E21]/80 border-slate-700/80 hover:border-[#D4AF37]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#D4AF37] flex items-center gap-1.5 font-cairo">
                  <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                  [QUESTION] — السؤال الفكري أو التطبيقي
                </span>
                {activeCardIndex === 0 && (
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    نشط في العرض التفاعلي 🎯
                  </span>
                )}
              </div>
              <textarea
                value={editableQuestion}
                onChange={(e) => setEditableQuestion(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                rows={2}
                className="w-full bg-black/40 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-tajawal focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Card 1: [DEFINITION] */}
            <div
              onClick={() => setActiveCardIndex(1)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeCardIndex === 1
                  ? 'bg-[#162C5B] border-sky-400 shadow-lg shadow-sky-400/20 ring-2 ring-sky-400/60'
                  : 'bg-[#060E21]/80 border-slate-700/80 hover:border-sky-400/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5 font-cairo">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  [DEFINITION] — المفهوم أو المصطلح المنهجي
                </span>
                {activeCardIndex === 1 && (
                  <span className="text-[10px] text-sky-300 font-bold bg-sky-950 px-2 py-0.5 rounded border border-sky-500/30">
                    نشط في العرض التفاعلي 🎯
                  </span>
                )}
              </div>
              <textarea
                value={editableDefinition}
                onChange={(e) => setEditableDefinition(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                rows={2}
                className="w-full bg-black/40 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-tajawal focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Card 2: [TRICK] */}
            <div
              onClick={() => setActiveCardIndex(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeCardIndex === 2
                  ? 'bg-[#162C5B] border-amber-400 shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/60'
                  : 'bg-[#060E21]/80 border-slate-700/80 hover:border-amber-400/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 font-cairo">
                  <Zap className="w-4 h-4 text-amber-400" />
                  [TRICK] — تريكة الامتحان وناتج التعلم المركب
                </span>
                {activeCardIndex === 2 && (
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                    نشط في العرض التفاعلي 🎯
                  </span>
                )}
              </div>
              <textarea
                value={editableTrick}
                onChange={(e) => setEditableTrick(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                rows={2}
                className="w-full bg-black/40 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-tajawal focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Card 3: [ANSWER] */}
            <div
              onClick={() => setActiveCardIndex(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeCardIndex === 3
                  ? 'bg-[#162C5B] border-emerald-400 shadow-lg shadow-emerald-400/20 ring-2 ring-emerald-400/60'
                  : 'bg-[#060E21]/80 border-slate-700/80 hover:border-emerald-400/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 font-cairo">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  [ANSWER] — الإجابة المنهجية الحاسمة
                </span>
                {activeCardIndex === 3 && (
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    نشط في العرض التفاعلي 🎯
                  </span>
                )}
              </div>
              <textarea
                value={editableAnswer}
                onChange={(e) => setEditableAnswer(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                rows={2}
                className="w-full bg-black/40 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-tajawal focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Closing Footer for Print Only */}
      <PrintEndFooter currentTrack={currentTrack} />

      {/* 3. SECTION 3: OPERATIONAL OUTPUTS DECK (المخرجات التشغيلية الثلاثية المرافقة للدرس) */}
      <div className="no-print glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/45 bg-gradient-to-b from-[#0A1838] to-[#060E21] shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/25">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                📋 المخرجات التشغيلية الثلاثية للدرس (جاهزة للنسخ والنشر الفوري)
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-tajawal mt-0.5">
              3 قوالب تشغيلية مصاغة تلقائياً لحصة: <strong>{currentLesson?.lessonTitle}</strong>
            </p>
          </div>

          {/* Sub Tabs Segmented Control */}
          <div className="flex items-center p-1 bg-[#162C5B] rounded-xl border border-[#D4AF37]/30 text-xs font-bold">
            <button
              onClick={() => setActiveDeckTab('quiz')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeDeckTab === 'quiz'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>الكويز السريع (5 أسئلة)</span>
            </button>

            <button
              onClick={() => setActiveDeckTab('assignment')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeDeckTab === 'assignment'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>واجب Google Classroom</span>
            </button>

            <button
              onClick={() => setActiveDeckTab('parent')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeDeckTab === 'parent'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>تقرير واتساب لولي الأمر</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Instant Quiz */}
        {activeDeckTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5E6AB] flex items-center gap-1.5 font-cairo">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>أ) الكويز الإلكتروني السريع (قياس فوري لنواتج التعلم عقب الحصة مباشرة):</span>
              </span>

              <button
                onClick={handleCopyQuiz}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#D4AF37]/20"
              >
                {copiedQuiz ? (
                  <>
                    <Check className="w-4 h-4 text-[#0B1B3D]" />
                    <span>تم نسخ الكويز بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الكويز السريع (للطباعة أو Google Forms)</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeOperational.quiz.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-[#060E21]/80 p-4 rounded-xl border border-slate-700/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#D4AF37] font-cairo">
                      سؤال {idx + 1}:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      [{q.code}]
                    </span>
                  </div>

                  <p className="text-xs text-white font-semibold font-tajawal leading-relaxed">
                    {q.qText}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-tajawal pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border text-slate-200 ${
                          oIdx === q.answer
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 font-bold'
                            : 'bg-[#162C5B]/40 border-slate-800'
                        }`}
                      >
                        <span className="font-bold ml-1">({['أ', 'ب', 'ج', 'د'][oIdx]})</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Google Classroom Assignment */}
        {activeDeckTab === 'assignment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5E6AB] flex items-center gap-1.5 font-cairo">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>ب) الواجب التحليلي الأسبوعي (جاهز للنشر على Google Classroom أو منصات المدارس):</span>
              </span>

              <button
                onClick={handleCopyAssignment}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0B1B3D] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-sky-500/20"
              >
                {copiedAssignment ? (
                  <>
                    <Check className="w-4 h-4 text-[#0B1B3D]" />
                    <span>تم نسخ تكليف Google Classroom!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ التكليف كاملاً لـ Google Classroom</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#060E21]/80 p-5 rounded-xl border border-sky-500/30 space-y-4 font-tajawal">
              <div className="pb-3 border-b border-slate-700">
                <h4 className="text-sm font-bold text-sky-300 font-cairo mb-1">
                  أولاً: الأسئلة المقالية التحليلية المركبة:
                </h4>
                <ul className="space-y-2 text-xs text-slate-200 pr-2">
                  {activeOperational.essay.map((eQ, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-[#162C5B]/40 p-2.5 rounded-lg border border-slate-800">
                      <span className="w-5 h-5 rounded bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{eQ}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#F5E6AB] font-cairo mb-1">
                  ثانياً: نشاط تحليل النصوص والشواهد التاريخية:
                </h4>
                <div className="bg-[#0B1B3D] p-3 rounded-lg border border-slate-700 text-xs text-slate-200 leading-relaxed">
                  {activeOperational.activity}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <span>⏰ موعد التسليم: قبل موعد الحصة القادمة بـ 24 ساعة.</span>
                <span>معايير التقييم: دقة التعليل التاريخي وربط السبب بالنتيجة.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Parent Report */}
        {activeDeckTab === 'parent' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-cairo">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>ج) تقرير المتابعة لولي الأمر عبر واتساب (WhatsApp Parent Report):</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyParentReport}
                  className="px-3.5 py-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-slate-100 hover:text-[#0B1B3D] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#D4AF37]/30"
                >
                  {copiedParentReport ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>تم نسخ التقرير!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ الرسالة</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-900/30"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال مباشر عبر واتساب 📲</span>
                </button>
              </div>
            </div>

            {/* Interactive Parent Report Builder Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Form Controls (5 cols) */}
              <div className="lg:col-span-5 bg-[#060E21]/80 p-4 rounded-xl border border-slate-700/80 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-cairo">
                    اسم الطالب:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="مثال: أحمد محمد"
                    className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg p-2 text-white font-tajawal focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-cairo">
                    حالة الحضور والتفاعل:
                  </label>
                  <select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value)}
                    className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg p-2 text-white font-tajawal focus:outline-none focus:border-emerald-500"
                  >
                    <option value="حاضر ومشارك بامتياز 🌟">حاضر ومشارك بامتياز 🌟</option>
                    <option value="حاضر وتفاعل جيد 👍">حاضر وتفاعل جيد 👍</option>
                    <option value="حاضر ويحتاج لمزيد من التركيز 💡">حاضر ويحتاج لمزيد من التركيز 💡</option>
                    <option value="غائب بعذر مقبول">غائب بعذر مقبول</option>
                    <option value="غائب بدون عذر">غائب بدون عذر</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-cairo">
                      درجة الكويز (من 10):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={quizScore}
                      onChange={(e) => setQuizScore(e.target.value)}
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 font-cairo">
                      هاتف ولي الأمر (اختياري):
                    </label>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="010xxxxxxxx"
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 font-cairo">
                    ملاحظة الدعم الأكاديمي:
                  </label>
                  <input
                    type="text"
                    value={academicNote}
                    onChange={(e) => setAcademicNote(e.target.value)}
                    placeholder="اكتب التوجيه التربوي..."
                    className="w-full bg-[#0B1B3D] border border-slate-700 rounded-lg p-2 text-white font-tajawal focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Preview Box (7 cols) */}
              <div className="lg:col-span-7 bg-[#0B1B3D] p-4 sm:p-5 rounded-xl border border-emerald-500/35 relative">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 inline-block mb-3 font-cairo">
                  معاينة رسالة واتساب المباشرة
                </span>

                <pre className="text-xs text-slate-200 font-tajawal whitespace-pre-wrap leading-relaxed bg-[#060E21] p-4 rounded-xl border border-slate-800 select-all">
                  {getFormattedParentReport()}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📥 Ingestion & Feed Modal */}
      <IngestLessonModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        currentTrack={currentTrack}
        allTracks={allTracks || TRACKS}
        onLessonIngested={(data) => {
          setSelectedLessonId(data.lesson.id);
          setEditableScript(data.lesson.documentaryScript);
          setEditableQuestion(data.lesson.cards.question);
          setEditableDefinition(data.lesson.cards.definition);
          setEditableTrick(data.lesson.cards.trick);
          setEditableAnswer(data.lesson.cards.answer);
          if (onSelectTrack && data.lesson.trackId !== currentTrack) {
            onSelectTrack(data.lesson.trackId);
          }
        }}
      />

      {/* ➕ Add Track Modal */}
      <AddTrackModal
        isOpen={isLocalAddTrackOpen}
        onClose={() => setIsLocalAddTrackOpen(false)}
        onAddTrack={(newTrack) => {
          if (onAddCustomTrack) {
            onAddCustomTrack(newTrack);
          }
        }}
      />

      {/* 📋 Export / Import Data Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        currentTrack={currentTrack}
        allTracks={allTracks || TRACKS}
        onDataRestored={() => {
          window.dispatchEvent(new Event('manara_data_updated'));
        }}
      />

      {/* 🎛️ Manual Track Manager Modal (Direct CRUD) */}
      <ManualTrackManagerModal
        isOpen={isManualManagerOpen}
        onClose={() => setIsManualManagerOpen(false)}
        currentTrack={currentTrack}
        allTracks={allTracks || TRACKS}
        onTrackDataUpdated={() => {
          window.dispatchEvent(new Event('manara_data_updated'));
        }}
      />

      {/* Screen Live Control Modal */}
      <ScreenControlModal
        isOpen={isScreenControlOpen}
        onClose={() => setIsScreenControlOpen(false)}
        currentTrack={currentTrack}
        currentLesson={currentLesson}
        initialTab={screenControlTab}
        onLessonUpdated={(id) => {
          setSelectedLessonId(id);
          setIsScreenControlOpen(false);
        }}
      />

      {/* 📥 Manual Track Feeder Modal */}
      <ManualTrackFeederModal
        isOpen={isFeederOpen}
        onClose={() => setIsFeederOpen(false)}
        currentTrack={currentTrack}
        onLessonSaved={(id) => {
          setSelectedLessonId(id);
          setIsFeederOpen(false);
          window.dispatchEvent(new Event('manara_data_updated'));
        }}
      />
    </div>
  );
};
