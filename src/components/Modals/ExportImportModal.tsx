import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { TrackId, TrackMeta, LessonScript, TimelineEvent, QuizQuestion } from '../../types';
import { sanitizeLesson } from '../../utils/dataStore';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackId;
  allTracks: Record<string, TrackMeta>;
  onDataRestored?: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  allTracks,
  onDataRestored
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  // Gather all custom data across all tracks from localStorage
  const gatherAllCustomData = () => {
    const customTracks = localStorage.getItem('manara_custom_tracks');
    const parsedTracks = customTracks ? JSON.parse(customTracks) : {};

    const customLessonsMap: Record<string, LessonScript[]> = {};
    const customTimelineMap: Record<string, TimelineEvent[]> = {};
    const customQuizMap: Record<string, QuizQuestion[]> = {};

    Object.keys(allTracks).forEach((tId) => {
      const savedLessons = localStorage.getItem(`manara_custom_lessons_${tId}`);
      if (savedLessons) {
        customLessonsMap[tId] = JSON.parse(savedLessons);
      }
      const savedTimeline = localStorage.getItem(`manara_custom_timeline_${tId}`);
      if (savedTimeline) {
        customTimelineMap[tId] = JSON.parse(savedTimeline);
      }
      const savedQuiz = localStorage.getItem(`manara_custom_quiz_${tId}`);
      if (savedQuiz) {
        customQuizMap[tId] = JSON.parse(savedQuiz);
      }
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

  const exportData = gatherAllCustomData();
  const exportJsonString = JSON.stringify(exportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manara_curriculum_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      setImportStatus({ success: false, msg: 'يرجى لصق نص ملف الـ JSON أو تحميله أولاً.' });
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);

      // Restore custom tracks if present
      if (parsed.customTracks && typeof parsed.customTracks === 'object') {
        const existingTracks = localStorage.getItem('manara_custom_tracks');
        const mergedTracks = { ...(existingTracks ? JSON.parse(existingTracks) : {}), ...parsed.customTracks };
        localStorage.setItem('manara_custom_tracks', JSON.stringify(mergedTracks));
      }

      // Restore custom lessons (with validation guard)
      if (parsed.customLessons && typeof parsed.customLessons === 'object') {
        Object.keys(parsed.customLessons).forEach((tId) => {
          const rawLessons = parsed.customLessons[tId];
          if (Array.isArray(rawLessons)) {
            const lessonsToMerge = rawLessons.map((l: any) => sanitizeLesson(l, tId as TrackId));
            const existingLessonsStr = localStorage.getItem(`manara_custom_lessons_${tId}`);
            const existing = existingLessonsStr ? JSON.parse(existingLessonsStr) : [];
            const safeExisting = Array.isArray(existing) ? existing.map((l: any) => sanitizeLesson(l, tId as TrackId)) : [];
            const merged = [...lessonsToMerge, ...safeExisting.filter((ex: any) => !lessonsToMerge.some((n: any) => n.id === ex.id))];
            localStorage.setItem(`manara_custom_lessons_${tId}`, JSON.stringify(merged));
          }
        });
      }

      // Restore custom timeline events
      if (parsed.customTimeline && typeof parsed.customTimeline === 'object') {
        Object.keys(parsed.customTimeline).forEach((tId) => {
          const eventsToMerge = parsed.customTimeline[tId];
          if (Array.isArray(eventsToMerge)) {
            const existingTimelineStr = localStorage.getItem(`manara_custom_timeline_${tId}`);
            const existing = existingTimelineStr ? JSON.parse(existingTimelineStr) : [];
            const merged = [...eventsToMerge, ...existing.filter((ex: any) => !eventsToMerge.some((n: any) => n.id === ex.id))];
            localStorage.setItem(`manara_custom_timeline_${tId}`, JSON.stringify(merged));
          }
        });
      }

      // Restore custom quiz questions
      if (parsed.customQuiz && typeof parsed.customQuiz === 'object') {
        Object.keys(parsed.customQuiz).forEach((tId) => {
          const quizToMerge = parsed.customQuiz[tId];
          if (Array.isArray(quizToMerge)) {
            const existingQuizStr = localStorage.getItem(`manara_custom_quiz_${tId}`);
            const existing = existingQuizStr ? JSON.parse(existingQuizStr) : [];
            const merged = [...quizToMerge, ...existing.filter((ex: any) => !quizToMerge.some((n: any) => n.id === ex.id))];
            localStorage.setItem(`manara_custom_quiz_${tId}`, JSON.stringify(merged));
          }
        });
      }

      // Trigger global update
      window.dispatchEvent(new Event('manara_data_updated'));
      if (onDataRestored) onDataRestored();

      setImportStatus({
        success: true,
        msg: 'تم استيراد ودمج البيانات بنجاح! تم تحديث كافة المسارات والدروس الحالية.'
      });
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setImportStatus({
        success: false,
        msg: 'فشل تحليل ملف الـ JSON. يرجى التأكد من صحة التنسيق.'
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0B1B3D] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#0E2046]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                إدارة وتصدير/استيراد بيانات المنصة (JSON Engine)
              </h3>
              <p className="text-xs text-slate-300">
                نسخ كود البيانات لتثبيته في historyData.ts أو نقل وحفظ النسخ الاحتياطية
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

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#D4AF37]/20 bg-[#0B1B3D]">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'border-[#D4AF37] text-[#D4AF37] font-cairo'
                : 'border-transparent text-slate-400 hover:text-white font-tajawal'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>📋 نسخ وتصدير البيانات (Export)</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'border-[#D4AF37] text-[#D4AF37] font-cairo'
                : 'border-transparent text-slate-400 hover:text-white font-tajawal'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📂 استيراد ملف بيانات (Import JSON)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 no-scrollbar">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="bg-[#162C5B]/60 p-3.5 rounded-xl border border-[#D4AF37]/30 text-xs text-slate-200 space-y-1 font-tajawal">
                <span className="font-bold text-[#F5E6AB] block font-cairo">
                  💡 كيف تثبت الدروس والمسارات الجديدة نهائياً لجميع الطلاب؟
                </span>
                <p>
                  1. اضغط على زر <strong>«نسخ الكود الكامل»</strong> بالأسفل.
                </p>
                <p>
                  2. الصق الكود في ملف <code>src/data/historyData.ts</code> لتثبيته في مستودع المشروع بحيث يراه كل زائر تلقائياً دون الاعتماد على ذاكرة المتصفح.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                  كود البيانات الكامل المحدث (JSON):
                </label>
                <textarea
                  readOnly
                  value={exportJsonString}
                  rows={9}
                  className="w-full bg-[#060E21] border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-[#D4AF37] select-all leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-400">
                  يتضمن كافة المسارات والدروس وأحداث الخط الزمني وبنك الأسئلة المضافة محلياً
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>تحميل كملف .json</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-cairo"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-800" />
                        <span>تم نسخ الكود بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>📋 نسخ كود البيانات المحدث</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="bg-[#162C5B]/60 p-3.5 rounded-xl border border-[#D4AF37]/30 text-xs text-slate-200 font-tajawal">
                قم بلصق محتوى ملف النسخة الاحتياطية أو اختر ملف <code>.json</code> محفوظ مسبقاً لاسترجاع المسارات والدروس.
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5E6AB] mb-1.5 font-cairo">
                  رفع ملف JSON من جهازك:
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-[#0B1B3D] hover:file:bg-[#e6b847] cursor-pointer bg-[#162C5B] p-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                  أو الصق نص الـ JSON مباشرة:
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="الصق هنا كود الـ JSON للنسخة الاحتياطية..."
                  rows={6}
                  className="w-full bg-[#060E21] border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                      : 'bg-red-950/80 border-red-500/60 text-red-200'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{importStatus.msg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!importJsonText.trim()}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] disabled:opacity-50 text-[#0B1B3D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-cairo"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📂 استيراد ودمج البيانات فوراً</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
