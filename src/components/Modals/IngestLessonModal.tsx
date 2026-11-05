import React, { useState } from 'react';
import { X, Sparkles, DownloadCloud, Loader2, Check, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { TrackId, TrackMeta, LessonScript, TimelineEvent, QuizQuestion } from '../../types';

interface IngestLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackId;
  allTracks: Record<string, TrackMeta>;
  onLessonIngested: (data: {
    lesson: LessonScript;
    timelineEvents?: TimelineEvent[];
    quizQuestions?: QuizQuestion[];
  }) => void;
}

export const IngestLessonModal: React.FC<IngestLessonModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  allTracks,
  onLessonIngested
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>(currentTrack);
  const [lessonTitle, setLessonTitle] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    lesson: LessonScript;
    timelineCount: number;
    quizCount: number;
  } | null>(null);

  if (!isOpen) return null;

  const targetTrackMeta = allTracks[selectedTrackId] || allTracks['track2'] || allTracks['track1'];

  // Sample prompt for National History Track (Track 2)
  const handleLoadSample = () => {
    setSelectedTrackId('track2');
    setLessonTitle('شرح الدرس: ملحمة الصمود وعبقرية الشخصية المصرية');
    setUnitTitle('الوحدة الأولى: أركان الدولة المصرية وعبقرية الصمود');
    setRawContent(`مذكرة درس التاريخ الوطني:
المحور الأول: الشخصية المصرية عبر التاريخ وأثر الموقع الجغرافي والبيئة النهرية في صياغة جينات الصمود.
المحور الثاني: ملحمة الصمود الوطني أمام الغزوات؛ من مقاومة الهكسوس، مروراً بصد الغزوات الصليبية والمغولية في معركتي حطين وعين جالوت، وصولاً إلى ثورة القاهرة ومقاومة أهالي الصعيد ورشيد 1807 ضد حملة فريزر الإنجليزية.
المحور الثالث: عقيدة الجيش الوطني؛ الجيش المصري جيش الشعب يحمي السيادة ولا يعتدي، وهو صمام أمان الدولة واستقرار أركانها الأربعة (الأرض، الشعب، السلطة، السيادة).
نواتج التعلم المطلوبة:
1. استنتاج العلاقة بين عقيدة الدفاع عن الأرض واستمرار الدولة المصرية كأقدم دولة مركزية موحدة.
2. تحليل موقف أهالي رشيد والإسكندرية كدليل على عبقرية المقاومة الشعبية المساندة للقوات المسلحة.
3. التمييز بين مفهوم الدولة القانونية وسلطة فرض النظام وفق معايير البكالوريا المصرية.
ملاحظة امتحانية: لم يرد تاريخ محدد ليوم تأسيس مجلس المشورة الشعبي في رشيد، فيجب التنويه بـ "غير محدد في الوحدة".`);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) {
      setError('يرجى لصق النص المنهجي أو مذكرة الدرس أولاً.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessData(null);

    try {
      const response = await fetch('/api/ingest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: selectedTrackId,
          lessonTitle: lessonTitle.trim(),
          unitTitle: unitTitle.trim(),
          academicSubtitle: targetTrackMeta.academicSubtitle,
          targetSubject: targetTrackMeta.targetSubject,
          rawContent: rawContent.trim(),
          modelType: 'flash'
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشلت معالجة النص وتحويله ذكياً.');
      }

      const { lesson, timelineEvents = [], quizQuestions = [] } = result.data;

      // 1. Save lesson to custom lessons
      try {
        const storedLessons = localStorage.getItem(`manara_custom_lessons_${selectedTrackId}`);
        const currentLessons: LessonScript[] = storedLessons ? JSON.parse(storedLessons) : [];
        const updatedLessons = [lesson, ...currentLessons.filter((l) => l.id !== lesson.id)];
        localStorage.setItem(`manara_custom_lessons_${selectedTrackId}`, JSON.stringify(updatedLessons));
      } catch (err) {
        console.error('Storage error for lessons', err);
      }

      // 2. Save timeline events if any
      if (timelineEvents.length > 0) {
        try {
          const storedTimeline = localStorage.getItem(`manara_custom_timeline_${selectedTrackId}`);
          const currentTimeline: TimelineEvent[] = storedTimeline ? JSON.parse(storedTimeline) : [];
          const updatedTimeline = [...timelineEvents, ...currentTimeline];
          localStorage.setItem(`manara_custom_timeline_${selectedTrackId}`, JSON.stringify(updatedTimeline));
        } catch (err) {
          console.error('Storage error for timeline', err);
        }
      }

      // 3. Save quiz questions if any
      if (quizQuestions.length > 0) {
        try {
          const storedQuiz = localStorage.getItem(`manara_custom_quiz_${selectedTrackId}`);
          const currentQuiz: QuizQuestion[] = storedQuiz ? JSON.parse(storedQuiz) : [];
          const updatedQuiz = [...quizQuestions, ...currentQuiz];
          localStorage.setItem(`manara_custom_quiz_${selectedTrackId}`, JSON.stringify(updatedQuiz));
        } catch (err) {
          console.error('Storage error for quiz', err);
        }
      }

      // Dispatch global data update event so StudentWorkspace & StudioWorkspace reload instantly
      window.dispatchEvent(new Event('manara_data_updated'));

      onLessonIngested({ lesson, timelineEvents, quizQuestions });

      setSuccessData({
        lesson,
        timelineCount: timelineEvents.length,
        quizCount: quizQuestions.length
      });
    } catch (err: any) {
      console.error('Ingestion failure:', err);
      setError(err?.message || 'حدث خطأ أثناء معالجة النص. يرجى التأكد من تشغيل الخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0B1B3D] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#0E2046]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-600 flex items-center justify-center text-[#0B1B3D] shadow-md">
              <DownloadCloud className="w-5 h-5 text-[#0B1B3D]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                📥 تغذية المسار بدرس أو بنك أسئلة جديد (من نص أو مذكرة)
              </h3>
              <p className="text-xs text-slate-300">
                تحويل المذكرات والنصوص الخام تلقائياً إلى اسكريبت وثائقي، 4 كروت تزامنية، أحداث، وكويز تفاعلي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 no-scrollbar">
          {successData ? (
            /* Success Feedback Card */
            <div className="glass-panel-gold p-5 rounded-2xl border border-emerald-400/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white font-cairo">
                  تمت المعالجة وتغذية المسار بنجاح!
                </h4>
                <p className="text-xs text-emerald-300 font-bold mt-1 font-tajawal">
                  تم إدراج الدرس رسمياً في مسار: [{targetTrackMeta.shortTitle} — {targetTrackMeta.targetSubject}]
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-2">
                <div className="bg-[#0B1B3D]/80 p-2.5 rounded-xl border border-[#D4AF37]/30">
                  <span className="block text-slate-400 text-[11px]">الاسكريبت الوثائقي</span>
                  <span className="font-bold text-[#F5E6AB]">جاهز بعلامات TTS</span>
                </div>
                <div className="bg-[#0B1B3D]/80 p-2.5 rounded-xl border border-[#D4AF37]/30">
                  <span className="block text-slate-400 text-[11px]">أحداث الخط الزمني</span>
                  <span className="font-bold text-sky-300">{successData.timelineCount} أحداث</span>
                </div>
                <div className="bg-[#0B1B3D]/80 p-2.5 rounded-xl border border-[#D4AF37]/30">
                  <span className="block text-slate-400 text-[11px]">أسئلة التقييم</span>
                  <span className="font-bold text-amber-300">{successData.quizCount} أسئلة بمصفاة الاستبعاد</span>
                </div>
              </div>

              <div className="bg-[#060E21]/80 p-3 rounded-xl border border-slate-700 text-right text-xs space-y-1">
                <div className="font-bold text-[#D4AF37] font-cairo">
                  عنوان الدرس المعتمد: {successData.lesson.lessonTitle}
                </div>
                <div className="text-slate-300 font-tajawal">
                  {successData.lesson.unitTitle} • نواتج التعلم: {successData.lesson.studentSummary.learningOutcomes.length} نواتج
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] text-xs font-bold transition-all shadow-md font-cairo cursor-pointer"
                >
                  معاينة الدرس فوراً في الاستوديو
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleIngest} className="space-y-4">
              {/* Target Track Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#F5E6AB] font-cairo">
                    اختر المسار الدراسي المستهدف بالتغذية: *
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 font-tajawal"
                  >
                    <span>📋 تجربة نص منهجي جاهز (تاريخ وطني)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(allTracks).map((tId) => {
                    const meta = allTracks[tId];
                    const isSelected = selectedTrackId === tId;
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setSelectedTrackId(tId)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37] shadow-sm font-cairo'
                            : 'bg-[#162C5B] text-slate-300 hover:text-white border-slate-700 font-tajawal'
                        }`}
                      >
                        <span className="block truncate">{meta.shortTitle}</span>
                        <span className="block text-[10px] opacity-80 mt-0.5 truncate">{meta.targetSubject}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lesson Title & Unit Title (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                    عنوان الدرس (اختياري - يستنبط تلقائياً إن ترك فارغاً):
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="مثال: شرح الدرس الثالث: عبقرية الصمود"
                    className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                    عنوان الوحدة المنهجية:
                  </label>
                  <input
                    type="text"
                    value={unitTitle}
                    onChange={(e) => setUnitTitle(e.target.value)}
                    placeholder="مثال: الوحدة الثانية: صمود الأمة المصرية"
                    className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Raw Curriculum Content / Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                  النص المنهجي الخام، مذكرة الحصة، أو عناصر الشرح: *
                </label>
                <textarea
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="انسخ والصق هنا النص المنهجي من كتاب الوزارة، ملخص المذكرة، أو نقاط المحاضرة المراد تحويلها ذكياً إلى درس متكامل..."
                  rows={8}
                  className="w-full bg-[#060E21]/90 border border-[#D4AF37]/40 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] resize-y font-tajawal leading-relaxed"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#D4AF37]/20">
                <span className="text-[11px] text-slate-400 font-tajawal">
                  المعالج: Gemini 2.5 Flash الأكاديمي مع استخراج الهيكل السداسي المعتمد
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !rawContent.trim()}
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] disabled:opacity-50 text-[#0B1B3D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-cairo"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جارٍ التحويل الذكي وتغذية المسار...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ تحويل ذكي وتغذية المسار</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
