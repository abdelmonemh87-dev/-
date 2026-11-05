import React, { useState, useEffect } from 'react';
import { TrackId, LessonScript, SynchronizedCards, TimelineEvent, QuizQuestion } from '../../types';
import { DataStore } from '../../utils/dataStore';
import {
  X,
  PlusCircle,
  Edit3,
  Trash2,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  BookOpen,
  Calendar,
  Target,
  Sparkles
} from 'lucide-react';

interface ScreenControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackId;
  currentLesson: LessonScript | null;
  onLessonUpdated?: (lessonId: string) => void;
  initialTab?: 'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack';
}

export const ScreenControlModal: React.FC<ScreenControlModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  currentLesson,
  onLessonUpdated,
  initialTab = 'editLesson'
}) => {
  const [activeTab, setActiveTab] = useState<'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack'>(initialTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Edit Lesson State (Pre-filled from current lesson)
  const [editTitle, setEditTitle] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editScript, setEditScript] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [editTrick, setEditTrick] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editOutcomes, setEditOutcomes] = useState('');

  // Add Lesson State
  const [newTitle, setNewTitle] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newScript, setNewScript] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newTrick, setNewTrick] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newOutcomes, setNewOutcomes] = useState('');

  // Add Timeline Event State
  const [tlTitle, setTlTitle] = useState('');
  const [tlDate, setTlDate] = useState('');
  const [tlEra, setTlEra] = useState('');
  const [tlDesc, setTlDesc] = useState('');
  const [tlOutcome, setTlOutcome] = useState('');
  const [tlTrick, setTlTrick] = useState('');

  // Add Quiz Question State
  const [quizText, setQuizText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [quizExplanation, setQuizExplanation] = useState('');
  const [elimination, setElimination] = useState('');

  // Populate edit fields when currentLesson changes or tab switches
  useEffect(() => {
    if (currentLesson) {
      setEditTitle(currentLesson.lessonTitle);
      setEditUnit(currentLesson.unitTitle);
      setEditScript(currentLesson.documentaryScript);
      setEditQuestion(currentLesson.cards.question);
      setEditDefinition(currentLesson.cards.definition);
      setEditTrick(currentLesson.cards.trick);
      setEditAnswer(currentLesson.cards.answer);
      setEditOutcomes(currentLesson.studentSummary.learningOutcomes.join('\n'));
    }
  }, [currentLesson, isOpen]);

  if (!isOpen) return null;

  const showSavedBadge = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  // 1. Handle Save Edited Lesson
  const handleSaveEditedLesson = () => {
    if (!currentLesson) return;
    const updated: LessonScript = {
      ...currentLesson,
      lessonTitle: editTitle.trim() || currentLesson.lessonTitle,
      unitTitle: editUnit.trim() || currentLesson.unitTitle,
      documentaryScript: editScript.trim() || currentLesson.documentaryScript,
      cards: {
        question: editQuestion.trim() || currentLesson.cards.question,
        definition: editDefinition.trim() || currentLesson.cards.definition,
        trick: editTrick.trim() || currentLesson.cards.trick,
        answer: editAnswer.trim() || currentLesson.cards.answer
      },
      studentSummary: {
        ...currentLesson.studentSummary,
        learningOutcomes: editOutcomes.trim()
          ? editOutcomes.split('\n').filter((l) => l.trim().length > 0)
          : currentLesson.studentSummary.learningOutcomes
      }
    };
    DataStore.saveLesson(updated);
    if (onLessonUpdated) onLessonUpdated(updated.id);
    showSavedBadge();
  };

  // 2. Handle Create New Lesson
  const handleCreateNewLesson = () => {
    if (!newTitle.trim()) return;
    const lessonId = `custom-l-${Date.now()}`;
    const newL: LessonScript = {
      id: lessonId,
      trackId: currentTrack,
      lessonTitle: newTitle.trim(),
      unitTitle: newUnit.trim() || 'الوحدة الدراسية',
      academicSubtitle: 'محتوى مخصص — أكاديمية المنارة التعليمية',
      documentaryScript: newScript.trim() || `[نبرة وقورة]\nمحتوى الدرس: ${newTitle}\n[توقف قصير]\nأكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710`,
      cards: {
        question: newQuestion.trim() || 'ما السؤال الجوهري المرتبط بهذا الموضوع؟',
        definition: newDefinition.trim() || 'المفهوم المنهجي الأساسي لهذا الدرس.',
        trick: newTrick.trim() || 'تريكة الامتحان: التركيز على العلاقات السببية غير المباشرة.',
        answer: newAnswer.trim() || 'الإجابة المنهجية النموذجية المستخلصة.'
      },
      studentSummary: {
        coreConcept: newTitle.trim(),
        quickCapsule: 'كبسولة سريعة لنواتج التعلم المستهدفة.',
        learningOutcomes: newOutcomes.trim()
          ? newOutcomes.split('\n').filter((l) => l.trim().length > 0)
          : ['استيعاب وتحليل المفاهيم التاريخية للدرس.']
      }
    };
    DataStore.saveLesson(newL);
    if (onLessonUpdated) onLessonUpdated(lessonId);
    showSavedBadge();
    setNewTitle('');
    setNewScript('');
  };

  // 3. Handle Add Timeline Event
  const handleAddTimelineEvent = () => {
    if (!tlTitle.trim()) return;
    const newEvent: TimelineEvent = {
      id: `custom-tl-${Date.now()}`,
      trackId: currentTrack,
      unit: 'general',
      title: tlTitle.trim(),
      dateDisplay: tlDate.trim() || 'غير محدد في الوحدة',
      isExactDate: !!tlDate.trim(),
      era: tlEra.trim() || 'عصر تاريخي',
      description: tlDesc.trim() || tlTitle.trim(),
      learningOutcome: tlOutcome.trim() || 'استخلاص الدلالة التاريخية للحدث.',
      examTrick: tlTrick.trim() || undefined,
      curriculumAxis: 'المحور المنهجي المخصص'
    };
    DataStore.saveTimelineEvent(newEvent);
    showSavedBadge();
    setTlTitle('');
    setTlDesc('');
  };

  // 4. Handle Add Quiz Question
  const handleAddQuizQuestion = () => {
    if (!quizText.trim() || !opt0.trim() || !opt1.trim()) return;
    const newQ: QuizQuestion = {
      id: `custom-q-${Date.now()}`,
      trackId: currentTrack,
      unit: 'الوحدة المقررة',
      questionText: quizText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim() || 'اختيار 3', opt3.trim() || 'اختيار 4'],
      correctIndex: correctIdx,
      explanation: quizExplanation.trim() || 'شرح الإجابة الصحيحة بالاستناد إلى كتاب الوزارة ونواتج التعلم.',
      learningOutcomeCode: 'ن.ت: مخصص',
      cognitiveLevel: 'استنتاج وربط',
      eliminationStrategy: elimination.trim() || 'تشريح جذر السؤال واستبعاد المشتتات غير المنطقية.'
    };
    DataStore.saveQuizQuestion(newQ);
    showSavedBadge();
    setQuizText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
  };

  // 5. Handle Delete Current Lesson
  const handleDeleteCurrentLesson = () => {
    if (!currentLesson) return;
    DataStore.deleteLesson(currentTrack, currentLesson.id);
    showSavedBadge();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // 6. Handle Reset Track
  const handleResetTrack = () => {
    DataStore.resetTrackData(currentTrack);
    showSavedBadge();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1B3D] border-2 border-[#D4AF37] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#D4AF37]/30 flex items-center justify-between bg-gradient-to-r from-[#0E2046] to-[#071024]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B1B3D] flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h3 className="font-black text-white text-base font-cairo">
                لوحة التحكم المباشر بالشاشة (إضافة • تعديل • حذف)
              </h3>
              <p className="text-xs text-[#F5E6AB] font-tajawal">
                تحكم كامل وفوري في نصوص وكروت وامتحانات المسار النشط: [{currentTrack}]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-2.5 bg-[#060E21] border-b border-[#D4AF37]/20 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('editLesson')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'editLesson'
                ? 'bg-[#D4AF37] text-[#0B1B3D] font-cairo shadow-sm'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✏️ تعديل الدرس المعروض</span>
          </button>

          <button
            onClick={() => setActiveTab('addLesson')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'addLesson'
                ? 'bg-[#D4AF37] text-[#0B1B3D] font-cairo shadow-sm'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>➕ إضافة درس جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('addTimeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'addTimeline'
                ? 'bg-[#D4AF37] text-[#0B1B3D] font-cairo shadow-sm'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>📅 إضافة حدث زمني</span>
          </button>

          <button
            onClick={() => setActiveTab('addQuiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'addQuiz'
                ? 'bg-[#D4AF37] text-[#0B1B3D] font-cairo shadow-sm'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>🎯 إضافة سؤال تقييم</span>
          </button>

          <button
            onClick={() => setActiveTab('deleteCurrent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'deleteCurrent'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-cairo'
                : 'text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>🗑️ حذف من الشاشة</span>
          </button>

          <button
            onClick={() => setActiveTab('resetTrack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'resetTrack'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-cairo'
                : 'text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🔄 استعادة المنهج الأصلي</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-grow text-right">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ التعديلات بنجاح وتحديث الشاشة فوراً!</span>
            </div>
          )}

          {/* TAB 1: EDIT CURRENT LESSON */}
          {activeTab === 'editLesson' && (
            <div className="space-y-3.5">
              {!currentLesson ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  لا يوجد درس نشط حالياً لتعديله. اختر درساً من الشاشة أولاً أو أضف درساً جديداً.
                </div>
              ) : (
                <>
                  <div className="bg-[#071024] p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">الدرس المستهدف بالتعديل:</span>
                      <h4 className="text-sm font-bold text-white font-cairo">{currentLesson.lessonTitle}</h4>
                    </div>
                    <span className="text-xs text-[#D4AF37] font-mono font-bold bg-[#0B1B3D] px-2.5 py-1 rounded border border-[#D4AF37]/30">
                      ID: {currentLesson.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الدرس:</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">الوحدة المقررة:</label>
                      <input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الاسكريبت الوثائقي وعلامات الإلقاء ([توقف قصير]، [نبرة هادئة]، [وقفة تأملية]):
                    </label>
                    <textarea
                      rows={6}
                      value={editScript}
                      onChange={(e) => setEditScript(e.target.value)}
                      className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-[#D4AF37] outline-none font-tajawal leading-relaxed"
                    />
                  </div>

                  {/* Synchronous 4 Cards */}
                  <div className="p-3 bg-[#071024] rounded-xl border border-[#D4AF37]/25 space-y-2.5">
                    <span className="text-xs font-bold text-[#D4AF37] font-cairo block">
                      كروت الشاشة التزامنية الأربعة:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <span className="text-[11px] text-amber-300 font-bold block mb-0.5">[QUESTION] السؤال الفكري:</span>
                        <input
                          type="text"
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-sky-300 font-bold block mb-0.5">[DEFINITION] المفهوم المنهجي:</span>
                        <input
                          type="text"
                          value={editDefinition}
                          onChange={(e) => setEditDefinition(e.target.value)}
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-emerald-300 font-bold block mb-0.5">[TRICK] تريكة الامتحان:</span>
                        <input
                          type="text"
                          value={editTrick}
                          onChange={(e) => setEditTrick(e.target.value)}
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-purple-300 font-bold block mb-0.5">[ANSWER] الإجابة الحاسمة:</span>
                        <input
                          type="text"
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="w-full bg-[#0B1B3D] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveEditedLesson}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#0B1B3D] font-black text-xs font-cairo flex items-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>💾 حفظ التعديلات وتحديث الشاشة</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: ADD NEW LESSON */}
          {activeTab === 'addLesson' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الدرس الجديد *:</label>
                  <input
                    type="text"
                    placeholder="مثال: شرح الدرس: الثورة العرابية وبسالة الصمود"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الوحدة:</label>
                  <input
                    type="text"
                    placeholder="مثال: الوحدة الثالثة: تاريخ مصر الحديث"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نص الاسكريبت الوثائقي وعلامات الإلقاء:
                </label>
                <textarea
                  rows={5}
                  placeholder="[نبرة وقورة] حينما وقف عرابي في ساحة عابدين... [توقف قصير]..."
                  value={newScript}
                  onChange={(e) => setNewScript(e.target.value)}
                  className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-[#D4AF37] outline-none font-tajawal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-amber-300 mb-0.5">[QUESTION] السؤال الفكري:</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="السؤال التطبيقي غير المباشر"
                    className="w-full bg-[#071024] border border-slate-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-sky-300 mb-0.5">[DEFINITION] المفهوم:</label>
                  <input
                    type="text"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="التعريف أو المفهوم العلمي"
                    className="w-full bg-[#071024] border border-slate-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 mb-0.5">[TRICK] تريكة الامتحان:</label>
                  <input
                    type="text"
                    value={newTrick}
                    onChange={(e) => setNewTrick(e.target.value)}
                    placeholder="الربط الاستنتاجي وناتج التعلم"
                    className="w-full bg-[#071024] border border-slate-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 mb-0.5">[ANSWER] الإجابة الحاسمة:</label>
                  <input
                    type="text"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="الإجابة المنهجية المباشرة"
                    className="w-full bg-[#071024] border border-slate-700 rounded p-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCreateNewLesson}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#0B1B3D] font-black text-xs font-cairo flex items-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>➕ إضافة الدرس للمسار الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADD TIMELINE EVENT */}
          {activeTab === 'addTimeline' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المحطة التاريخية *:</label>
                  <input
                    type="text"
                    placeholder="مثال: فرمان مايو 1805م واختيار محمد علي"
                    value={tlTitle}
                    onChange={(e) => setTlTitle(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التاريخ المكتوب:</label>
                  <input
                    type="text"
                    placeholder="مثال: مايو 1805م (أو: غير محدد في الوحدة)"
                    value={tlDate}
                    onChange={(e) => setTlDate(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العصر التاريخي:</label>
                  <input
                    type="text"
                    placeholder="مثال: تاريخ مصر الحديث"
                    value={tlEra}
                    onChange={(e) => setTlEra(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">تريكة الامتحان:</label>
                  <input
                    type="text"
                    placeholder="مثال: أول صك اجتماعي في تاريخ الشرق"
                    value={tlTrick}
                    onChange={(e) => setTlTrick(e.target.value)}
                    className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف الحدث والدلالة:</label>
                <textarea
                  rows={3}
                  value={tlDesc}
                  onChange={(e) => setTlDesc(e.target.value)}
                  className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAddTimelineEvent}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-[#0B1B3D] font-black text-xs font-cairo flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110"
                >
                  <Calendar className="w-4 h-4" />
                  <span>➕ إضافة الحدث للخط الزمني</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ADD QUIZ QUESTION */}
          {activeTab === 'addQuiz' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نص السؤال الوزاري *:</label>
                <input
                  type="text"
                  placeholder="مثال: أي الشواهد الآتية تؤكد ريادة الفكر المصري القديم في الجراحة؟"
                  value={quizText}
                  onChange={(e) => setQuizText(e.target.value)}
                  className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { val: opt0, set: setOpt0, idx: 0, label: 'أ' },
                  { val: opt1, set: setOpt1, idx: 1, label: 'ب' },
                  { val: opt2, set: setOpt2, idx: 2, label: 'ج' },
                  { val: opt3, set: setOpt3, idx: 3, label: 'د' }
                ].map((item) => (
                  <div key={item.idx} className="flex items-center gap-2 bg-[#071024] p-2 rounded-lg border border-slate-700">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={correctIdx === item.idx}
                      onChange={() => setCorrectIdx(item.idx)}
                      className="accent-[#D4AF37]"
                    />
                    <span className="font-bold text-[#D4AF37]">{item.label}:</span>
                    <input
                      type="text"
                      placeholder={`الخيار (${item.label})`}
                      value={item.val}
                      onChange={(e) => item.set(e.target.value)}
                      className="bg-transparent border-none text-white text-xs w-full outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تفسير الإجابة الصحيحة:</label>
                <input
                  type="text"
                  placeholder="الشرح المنهجي للأسباب والروابط"
                  value={quizExplanation}
                  onChange={(e) => setQuizExplanation(e.target.value)}
                  className="w-full bg-[#071024] border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAddQuizQuestion}
                  className="px-5 py-2 rounded-xl bg-sky-500 text-[#0B1B3D] font-black text-xs font-cairo flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110"
                >
                  <Target className="w-4 h-4" />
                  <span>➕ إضافة السؤال لبنك التقييمات</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: DELETE CURRENT LESSON */}
          {activeTab === 'deleteCurrent' && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl space-y-3 text-center sm:text-right">
              <div className="flex items-center gap-3 text-red-300">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                <h4 className="text-sm font-black font-cairo">تحذير حذف الدرس من الشاشة</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-tajawal">
                هل أنت متأكد من رغبتك في حذف الدرس الحالي:{' '}
                <span className="text-red-300 font-bold underline font-cairo">
                  {currentLesson?.lessonTitle || 'لا يوجد درس محدد'}
                </span>{' '}
                من قائمة دروس المسار؟ سيتم إخفاؤه وحذفه من واجهة الطالب والمعلم فوراً.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteCurrentLesson}
                  disabled={!currentLesson}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black font-cairo flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد حذف هذا الدرس</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: RESET TRACK */}
          {activeTab === 'resetTrack' && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-3 text-center sm:text-right">
              <div className="flex items-center gap-3 text-amber-300">
                <RotateCcw className="w-6 h-6 text-amber-400 shrink-0" />
                <h4 className="text-sm font-black font-cairo">استعادة المنهج الوزاري الأصلي للمسار</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-tajawal">
                هل ترغب في إعادة ضبط مسار <span className="text-[#D4AF37] font-bold">[{currentTrack}]</span> ومسح أي تعديلات أو دروس محلية تم إنشاؤها والعودة للنسخة الرسمية المعتمدة لأكاديمية المنارة التعليمية؟
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleResetTrack}
                  className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 cursor-pointer shadow-lg hover:brightness-110"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تأكيد استعادة المنهج الأصلي</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
