import React, { useState } from 'react';
import { TrackId, LessonScript, ConceptItem, AxisExplanation, FlashcardItem, QuizQuestion } from '../../types';
import { TRACKS } from '../../data/historyData';
import { DataStore } from '../../utils/dataStore';
import {
  X,
  Save,
  Download,
  Upload,
  BookOpen,
  FileCode,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Crown,
  MapPin,
  Clock,
  Radio
} from 'lucide-react';

interface ManualTrackFeederModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackId;
  onLessonSaved?: (lessonId: string) => void;
}

export const ManualTrackFeederModal: React.FC<ManualTrackFeederModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  onLessonSaved
}) => {
  const [activeMode, setActiveMode] = useState<'form' | 'json'>('form');
  const [targetTrack, setTargetTrack] = useState<TrackId>(currentTrack);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form Fields State
  const [lessonTitle, setLessonTitle] = useState('');
  const [unitTitle, setUnitTitle] = useState('الوحدة الأولى');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');

  // 4 Cards State
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardDefinition, setCardDefinition] = useState('');
  const [cardTrick, setCardTrick] = useState('');
  const [cardAnswer, setCardAnswer] = useState('');

  // Documentary Script State
  const [documentaryScript, setDocumentaryScript] = useState('');

  // Specialized Corner State
  const [cornerType, setCornerType] = useState<'archaeological' | 'maritime'>('archaeological');
  const [cornerTitle, setCornerTitle] = useState('');
  const [cornerContent, setCornerContent] = useState('');

  // Visual Equation State
  const [visualEquation, setVisualEquation] = useState('');

  // Flashcards Items State
  const [flashcardsList, setFlashcardsList] = useState<
    Array<{ category: 'character' | 'place' | 'event'; title: string; era: string; significance: string; examLearningOutcome: string }>
  >([
    {
      category: 'character',
      title: '',
      era: '',
      significance: '',
      examLearningOutcome: ''
    }
  ]);

  // JSON Quick Mode State
  const [jsonText, setJsonText] = useState('');

  React.useEffect(() => {
    setTargetTrack(currentTrack);
  }, [currentTrack, isOpen]);

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    setSavedNotice(msg);
    setErrorNotice(null);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const triggerError = (msg: string) => {
    setErrorNotice(msg);
    setSavedNotice(null);
  };

  const handleAddFlashcardRow = () => {
    setFlashcardsList((prev) => [
      ...prev,
      {
        category: 'event',
        title: '',
        era: '',
        significance: '',
        examLearningOutcome: ''
      }
    ]);
  };

  const handleRemoveFlashcardRow = (idx: number) => {
    setFlashcardsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // 1. SAVE LESSON FROM STRUCTURED FORM
  const handleSaveForm = () => {
    if (!lessonTitle.trim()) {
      triggerError('يرجى إدخال عنوان الدرس على الأقل.');
      return;
    }

    const lessonId = `manual-l-${Date.now()}`;
    const outcomesArray = learningOutcomes
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const validFlashcards: FlashcardItem[] = flashcardsList
      .filter((f) => f.title.trim().length > 0)
      .map((f, i) => ({
        id: `fc-manual-${lessonId}-${i}`,
        category: f.category,
        title: f.title.trim(),
        era: f.era.trim() || unitTitle,
        significance: f.significance.trim() || 'الأهمية التاريخية والدور المحوري للحدث.',
        examLearningOutcome: f.examLearningOutcome.trim() || 'ربط الحدث بناتج التعلم المعتمد.'
      }));

    const trackMeta = TRACKS[targetTrack] || TRACKS['track1'];

    const newLessonObj: LessonScript = {
      id: lessonId,
      trackId: targetTrack,
      lessonTitle: lessonTitle.trim(),
      unitTitle: unitTitle.trim() || 'الوحدة المنهجية',
      academicSubtitle: trackMeta.academicSubtitle,
      documentaryScript:
        documentaryScript.trim() ||
        `[نبرة وقورة]\nشرح الدرس: ${lessonTitle}\n[توقف قصير]\nأكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710`,
      cards: {
        question: cardQuestion.trim() || 'ما السؤال الجوهري المرتبط بناتج التعلم؟',
        definition: cardDefinition.trim() || 'المفهوم المنهجي الأساسي للدرس.',
        trick: cardTrick.trim() || 'تريكة الامتحان: التركيز على العلاقات السببية غير المباشرة.',
        answer: cardAnswer.trim() || 'الإجابة المنهجية الحاسمة وفق نواتج التعلم.'
      },
      spotifyUrl: spotifyUrl.trim() || undefined,
      flashcards: validFlashcards.length > 0 ? validFlashcards : undefined,
      studentSummary: {
        coreConcept: cardDefinition.trim() || lessonTitle.trim(),
        quickCapsule: 'كبسولة سريعة ومكثفة لنواتج التعلم.',
        directExamTrick: cardTrick.trim() || undefined,
        learningOutcomes: outcomesArray.length > 0 ? outcomesArray : ['استيعاب وتحليل المفاهيم التاريخية للدرس.'],
        specializedCorner: cornerTitle.trim()
          ? {
              type: cornerType,
              title: cornerTitle.trim(),
              content: cornerContent.trim() || 'توثيق أثري وملاحي منهجي.'
            }
          : undefined,
        visualEquation: visualEquation.trim() || undefined,
        flashcards: validFlashcards.length > 0 ? validFlashcards : undefined
      }
    };

    DataStore.saveLesson(newLessonObj);
    triggerSuccess(`تم حفظ ونشر الدرس «${lessonTitle}» في مسار [${targetTrack}] بنجاح وحفظه الدائم!`);
    if (onLessonSaved) onLessonSaved(lessonId);

    // Reset fields
    setLessonTitle('');
    setLearningOutcomes('');
    setCardQuestion('');
    setCardDefinition('');
    setCardTrick('');
    setCardAnswer('');
    setDocumentaryScript('');
    setCornerTitle('');
    setCornerContent('');
    setVisualEquation('');
    setSpotifyUrl('');
  };

  // 2. SAVE LESSON FROM JSON PASTE (WITH VALIDATION GUARD)
  const handleSaveJson = () => {
    if (!jsonText.trim()) {
      triggerError('يرجى لصق كود JSON الخاص بالدرس أولاً.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const rawList = Array.isArray(parsed) ? parsed : [parsed];

      if (rawList.length === 0) {
        triggerError('الكود الملصق لا يحتوي على أي دروس صالحة.');
        return;
      }

      // Safe normalization & validation guard
      const safeLessons: LessonScript[] = rawList.map((item: any, idx: number) => ({
        id: item.id ? String(item.id) : `imported-l-${Date.now()}-${idx}`,
        trackId: item.trackId || targetTrack,
        lessonTitle: item.lessonTitle ? String(item.lessonTitle).trim() : 'درس جديد',
        unitTitle: item.unitTitle ? String(item.unitTitle).trim() : 'الوحدة الثانية: حضارة مصر القديمة (الفرعونية)',
        academicSubtitle: item.academicSubtitle || 'التاريخ — المرحلة الثانوية',
        documentaryScript: item.documentaryScript
          ? String(item.documentaryScript).trim()
          : `[نبرة وقورة]\nشرح الدرس\nأكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710`,
        cards: {
          question: item.cards?.question || 'ما السؤال الجوهري المرتبط بناتج التعلم؟',
          definition: item.cards?.definition || 'المفهوم المنهجي الأساسي للدرس.',
          trick: item.cards?.trick || 'تريكة الامتحان: التركيز على العلاقات السببية المباشرة وغير المباشرة.',
          answer: item.cards?.answer || 'الإجابة المنهجية الحاسمة وفق نواتج التعلم المعتمدة.'
        },
        spotifyUrl: item.spotifyUrl || undefined,
        flashcards: Array.isArray(item.flashcards) ? item.flashcards : Array.isArray(item.studentSummary?.flashcards) ? item.studentSummary.flashcards : [],
        studentSummary: {
          coreConcept: item.studentSummary?.coreConcept || item.cards?.definition || item.lessonTitle || 'المفهوم الجوهري',
          quickCapsule: item.studentSummary?.quickCapsule || 'كبسولة سريعة ومكثفة لنواتج التعلم.',
          directExamTrick: item.studentSummary?.directExamTrick || item.cards?.trick,
          learningOutcomes: Array.isArray(item.studentSummary?.learningOutcomes) && item.studentSummary.learningOutcomes.length > 0
            ? item.studentSummary.learningOutcomes
            : ['استيعاب وتحليل نواتج التعلم المعتمدة.'],
          conceptsGlossary: Array.isArray(item.studentSummary?.conceptsGlossary) ? item.studentSummary.conceptsGlossary : [],
          axesExplanations: Array.isArray(item.studentSummary?.axesExplanations) ? item.studentSummary.axesExplanations : [],
          specializedCorner: item.studentSummary?.specializedCorner,
          visualEquation: item.studentSummary?.visualEquation,
          brainTeaser: item.studentSummary?.brainTeaser,
          flashcards: Array.isArray(item.studentSummary?.flashcards) ? item.studentSummary.flashcards : Array.isArray(item.flashcards) ? item.flashcards : []
        }
      }));

      // Batch save with single event dispatch
      DataStore.saveLessonsBatch(safeLessons);

      triggerSuccess(`تم استيراد وحفظ ${safeLessons.length} درس بنجاح في التخزين الدائم!`);
      if (onLessonSaved && safeLessons[0]?.id) onLessonSaved(safeLessons[0].id);
      setJsonText('');
    } catch (e: any) {
      triggerError(`خطأ في صيغة الـ JSON: ${e?.message || 'تأكد من صحة الأقواس والفواصل'}`);
    }
  };

  // 3. EXPORT JSON BACKUP
  const handleExportBackup = () => {
    try {
      const lessons = DataStore.getLessons(targetTrack);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lessons, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Manara_Lessons_${targetTrack}_Backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerSuccess(`تم تصدير ملف النسخة الاحتياطية لمسار [${targetTrack}] بنجاح!`);
    } catch (e: any) {
      triggerError(`فشل تصدير النسخة الاحتياطية: ${e?.message}`);
    }
  };

  // 4. IMPORT JSON FILE (WITH VALIDATION GUARD & BATCH SAVING)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : [parsed];

        const safeLessons: LessonScript[] = list.map((item: any, idx: number) => ({
          id: item.id ? String(item.id) : `file-l-${Date.now()}-${idx}`,
          trackId: item.trackId || targetTrack,
          lessonTitle: item.lessonTitle ? String(item.lessonTitle).trim() : 'درس مستورد',
          unitTitle: item.unitTitle ? String(item.unitTitle).trim() : 'الوحدة الثانية: حضارة مصر القديمة (الفرعونية)',
          academicSubtitle: item.academicSubtitle || 'التاريخ — المرحلة الثانوية',
          documentaryScript: item.documentaryScript
            ? String(item.documentaryScript).trim()
            : `[نبرة وقورة]\nشرح الدرس\nأكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710`,
          cards: {
            question: item.cards?.question || 'ما السؤال الجوهري المرتبط بناتج التعلم؟',
            definition: item.cards?.definition || 'المفهوم المنهجي الأساسي للدرس.',
            trick: item.cards?.trick || 'تريكة الامتحان: التركيز على العلاقات السببية المباشرة وغير المباشرة.',
            answer: item.cards?.answer || 'الإجابة المنهجية الحاسمة وفق نواتج التعلم المعتمدة.'
          },
          spotifyUrl: item.spotifyUrl || undefined,
          flashcards: Array.isArray(item.flashcards) ? item.flashcards : Array.isArray(item.studentSummary?.flashcards) ? item.studentSummary.flashcards : [],
          studentSummary: {
            coreConcept: item.studentSummary?.coreConcept || item.cards?.definition || item.lessonTitle || 'المفهوم الجوهري',
            quickCapsule: item.studentSummary?.quickCapsule || 'كبسولة سريعة ومكثفة لنواتج التعلم.',
            directExamTrick: item.studentSummary?.directExamTrick || item.cards?.trick,
            learningOutcomes: Array.isArray(item.studentSummary?.learningOutcomes) && item.studentSummary.learningOutcomes.length > 0
              ? item.studentSummary.learningOutcomes
              : ['استيعاب وتحليل نواتج التعلم المعتمدة.'],
            conceptsGlossary: Array.isArray(item.studentSummary?.conceptsGlossary) ? item.studentSummary.conceptsGlossary : [],
            axesExplanations: Array.isArray(item.studentSummary?.axesExplanations) ? item.studentSummary.axesExplanations : [],
            specializedCorner: item.studentSummary?.specializedCorner,
            visualEquation: item.studentSummary?.visualEquation,
            brainTeaser: item.studentSummary?.brainTeaser,
            flashcards: Array.isArray(item.studentSummary?.flashcards) ? item.studentSummary.flashcards : Array.isArray(item.flashcards) ? item.flashcards : []
          }
        }));

        DataStore.saveLessonsBatch(safeLessons);
        triggerSuccess(`تم استيراد ${safeLessons.length} درس من الملف وتحديث المسار بنجاح!`);
        if (onLessonSaved && safeLessons[0]?.id) onLessonSaved(safeLessons[0].id);
      } catch (err: any) {
        triggerError(`فشل قراءة الملف: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1B3D] border-2 border-[#D4AF37] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/30 flex items-center justify-between bg-gradient-to-r from-[#0E2046] via-[#0B1B3D] to-[#071024]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-[#0B1B3D] flex items-center justify-center font-black shadow-md text-lg">
              📥
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg font-cairo">
                التغذية اليدوية للدروس والمسارات (إضافة وحفظ مباشر)
              </h3>
              <p className="text-xs text-[#F5E6AB] font-tajawal">
                أكاديمية المنارة التعليمية — حفظ تلقائي دائم في localStorage ومقاوم للتحديث (F5)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="p-3 bg-[#060E21] border-b border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3">
          {/* Target Track Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 font-cairo">المسار المستهدف:</span>
            <select
              value={targetTrack}
              onChange={(e) => setTargetTrack(e.target.value as TrackId)}
              className="bg-[#0B1B3D] border border-[#D4AF37]/40 rounded-lg px-3 py-1.5 text-xs text-[#F5E6AB] font-bold font-cairo outline-none"
            >
              <option value="track1">🏛️ 1 ثانوي: حضارة مصر والعالم القديم</option>
              <option value="track2">🇪🇬 2 ثانوي: التاريخ الوطني (بكالوريا)</option>
              <option value="track3">📜 3 ثانوي: تاريخ مصر والعرب الحديث</option>
              <option value="podcast">🎙️ بودكاست المنارة: حواديت منسية</option>
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0B1B3D] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveMode('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'form'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>نموذج الحقول المنظمة</span>
            </button>
            <button
              onClick={() => setActiveMode('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'json'
                  ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>لصق واستيراد JSON سريع</span>
            </button>
          </div>

          {/* Export / Import Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="px-3 py-1.5 rounded-lg bg-[#162C5B] hover:bg-[#1E3B7A] border border-[#D4AF37]/40 text-[#F5E6AB] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="تصدير نسخة احتياطية من دروس هذا المسار"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير JSON</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>استيراد ملف</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Alert Notifications */}
        {savedNotice && (
          <div className="mx-4 mt-3 p-3 bg-emerald-950/80 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedNotice}</span>
          </div>
        )}
        {errorNotice && (
          <div className="mx-4 mt-3 p-3 bg-red-950/80 border border-red-400 text-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-grow text-right">
          {activeMode === 'form' ? (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الدرس الجديد *:</label>
                  <input
                    type="text"
                    placeholder="مثال: شرح الدرس: بناء الدولة المصرية واستمرارها"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الوحدة المقررة:</label>
                  <input
                    type="text"
                    placeholder="مثال: الوحدة الأولى: أركان الدولة المصرية"
                    value={unitTitle}
                    onChange={(e) => setUnitTitle(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  بطاقة نواتج التعلم المعتمدة (اكتب كل ناتج في سطر منفصل):
                </label>
                <textarea
                  rows={3}
                  placeholder={`استنتاج العلاقة بين عبقرية الموقع وصمود الكيان الوطني.\nتحليل مفهوم أركان الدولة الأربعة وفق الدستور المصري.\nالربط بين قوة الإدارة المركزية وحماية السيادة.`}
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                  className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-[#D4AF37] outline-none font-tajawal"
                />
              </div>

              {/* 4 Synchronous Cards */}
              <div className="p-4 bg-[#071024] rounded-xl border border-[#D4AF37]/30 space-y-3">
                <span className="text-xs font-black text-[#D4AF37] font-cairo block">
                  كروت الشاشة التزامنية الأربعة للـ TTS:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1">[QUESTION] السؤال الفكري:</label>
                    <input
                      type="text"
                      placeholder="كيف ارتبطت عبقرية المكان ببناء أقدم دولة مركزية؟"
                      value={cardQuestion}
                      onChange={(e) => setCardQuestion(e.target.value)}
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-sky-300 mb-1">[DEFINITION] المفهوم المنهجي:</label>
                    <input
                      type="text"
                      placeholder="الدولة المصرية: كيان سياسي وجغرافي متصل اكتملت أركانه الأربعة."
                      value={cardDefinition}
                      onChange={(e) => setCardDefinition(e.target.value)}
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">[TRICK] تريكة الامتحان:</label>
                    <input
                      type="text"
                      placeholder="تريكة الامتحان: ضعف السلطة المركزية يهدد ركن السيادة مباشرة."
                      value={cardTrick}
                      onChange={(e) => setCardTrick(e.target.value)}
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-300 mb-1">[ANSWER] الإجابة الحاسمة:</label>
                    <input
                      type="text"
                      placeholder="الإجابة المنهجية النموذجية المستخلصة."
                      value={cardAnswer}
                      onChange={(e) => setCardAnswer(e.target.value)}
                      className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Documentary Script */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الاسكريبت الوثائقي للدرس (مع علامات الإلقاء: [نبرة هادئة]، [توقف قصير]، [نبرة حماسية]):
                </label>
                <textarea
                  rows={4}
                  placeholder={`[نبرة هادئة]\nحينما استقر الإنسان على ضفاف النيل... [توقف قصير]...\n[نبرة حماسية]\nأكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710`}
                  value={documentaryScript}
                  onChange={(e) => setDocumentaryScript(e.target.value)}
                  className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-[#D4AF37] outline-none font-tajawal"
                />
              </div>

              {/* Flashcards Section (كروت المراجعة السريعة) */}
              <div className="p-4 bg-[#071024] rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 font-cairo flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ كروت المراجعة السريعة (دليل الإنجاز السريع / Flip Flashcards):</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFlashcardRow}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B1B3D] font-black text-[11px] font-cairo flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ إضافة كارت</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {flashcardsList.map((fc, idx) => (
                    <div key={idx} className="p-3 bg-[#0B1B3D] rounded-xl border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#F5E6AB]">كارت #{idx + 1}:</span>
                          <select
                            value={fc.category}
                            onChange={(e) => {
                              const updated = [...flashcardsList];
                              updated[idx].category = e.target.value as any;
                              setFlashcardsList(updated);
                            }}
                            className="bg-[#060E21] border border-slate-600 rounded px-2 py-0.5 text-xs text-white"
                          >
                            <option value="character">👑 شخصية تاريخية</option>
                            <option value="place">📍 موقع استراتيجي</option>
                            <option value="event">⏳ حدث وتاريخ محوري</option>
                          </select>
                        </div>
                        {flashcardsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFlashcardRow(idx)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="الاسم / العنوان (الوجه الأمامي)"
                          value={fc.title}
                          onChange={(e) => {
                            const updated = [...flashcardsList];
                            updated[idx].title = e.target.value;
                            setFlashcardsList(updated);
                          }}
                          className="bg-[#060E21] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="العصر التاريخي"
                          value={fc.era}
                          onChange={(e) => {
                            const updated = [...flashcardsList];
                            updated[idx].era = e.target.value;
                            setFlashcardsList(updated);
                          }}
                          className="bg-[#060E21] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="الأهمية والدور المحوري (الوجه الخلفي)"
                          value={fc.significance}
                          onChange={(e) => {
                            const updated = [...flashcardsList];
                            updated[idx].significance = e.target.value;
                            setFlashcardsList(updated);
                          }}
                          className="bg-[#060E21] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="ناتج التعلم الامتحاني المرتبط به"
                          value={fc.examLearningOutcome}
                          onChange={(e) => {
                            const updated = [...flashcardsList];
                            updated[idx].examLearningOutcome = e.target.value;
                            setFlashcardsList(updated);
                          }}
                          className="bg-[#060E21] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialized Corner & Visual Equation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#071024] rounded-xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-sky-300 block">الزاوية المتخصصة:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={cornerType}
                      onChange={(e) => setCornerType(e.target.value as any)}
                      className="bg-[#0B1B3D] border border-slate-600 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="archaeological">🏛️ عين على الأثر</option>
                      <option value="maritime">⚓ إضاءة ملاحية</option>
                    </select>
                    <input
                      type="text"
                      placeholder="عنوان الزاوية"
                      value={cornerTitle}
                      onChange={(e) => setCornerTitle(e.target.value)}
                      className="bg-[#0B1B3D] border border-slate-600 rounded p-1 text-xs text-white flex-grow"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="محتوى التوثيق الأثري أو الملاحي"
                    value={cornerContent}
                    onChange={(e) => setCornerContent(e.target.value)}
                    className="w-full bg-[#0B1B3D] border border-slate-600 rounded p-1.5 text-xs text-white"
                  />
                </div>

                <div className="p-3 bg-[#071024] rounded-xl border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-amber-300 block">المعادلة البصرية للربط:</span>
                  <input
                    type="text"
                    placeholder="مثال: استقرار سياسي + نهر النيل ⬅️ زوال الخوف ⬅️ انطلاق الحضارة"
                    value={visualEquation}
                    onChange={(e) => setVisualEquation(e.target.value)}
                    className="w-full bg-[#0B1B3D] border border-slate-600 rounded p-2 text-xs text-white"
                  />
                  <span className="text-xs font-bold text-emerald-300 block pt-1">رابط Spotify للدرس:</span>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/episode/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="w-full bg-[#0B1B3D] border border-slate-600 rounded p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveForm}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:brightness-110 text-[#0B1B3D] font-black text-xs font-cairo flex items-center gap-2 shadow-xl cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 حفظ ونشر الدرس في المسار (تثبيت دائم)</span>
                </button>
              </div>
            </div>
          ) : (
            /* JSON Mode */
            <div className="space-y-4">
              <div className="bg-[#071024] p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-[#D4AF37] block">تعليمات لصق كائن JSON:</span>
                <p>
                  يمكنك لصق كائن درس مفرد مطابق لـ <code className="text-[#F5E6AB]">LessonScript</code> أو مصفوفة من الدروس <code className="text-[#F5E6AB]">[LessonScript, ...]</code> ليتم استيرادها وحفظها فورياً في التخزين المحلي.
                </p>
              </div>

              <textarea
                rows={14}
                placeholder={`{\n  "lessonTitle": "شرح الدرس: عنوان جديد",\n  "unitTitle": "الوحدة المقررة",\n  "documentaryScript": "[نبرة وقورة] النص...",\n  "cards": {\n    "question": "...",\n    "definition": "...",\n    "trick": "...",\n    "answer": "..."\n  },\n  "studentSummary": {\n    "learningOutcomes": ["..."]\n  }\n}`}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full bg-[#060E21] border border-slate-700 rounded-xl p-3 text-xs text-emerald-300 font-mono focus:border-[#D4AF37] outline-none leading-relaxed"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveJson}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs font-cairo flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>استيراد وحفظ كود الـ JSON الآن</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
