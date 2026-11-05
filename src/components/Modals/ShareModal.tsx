import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Tablet, ShieldCheck, Sparkles, Lock, Settings } from 'lucide-react';
import { TrackId, TrackMeta } from '../../types';
import { TRACKS } from '../../data/historyData';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack?: TrackId;
  allTracks?: Record<string, TrackMeta>;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  currentTrack = 'track1',
  allTracks
}) => {
  const [copiedStudent, setCopiedStudent] = useState(false);
  const [copiedTeacher, setCopiedTeacher] = useState(false);

  if (!isOpen) return null;

  const activeTrackMeta = (allTracks && allTracks[currentTrack]) || TRACKS[currentTrack] || TRACKS['track1'];

  // Base domain without query strings
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://ais-pre-huc2ad54rcigqfu2ydyrsc-535496717346.europe-west2.run.app';

  const studentUrl = `${baseUrl}?mode=student&studentLock=1&track=${currentTrack}`;
  const teacherUrl = `${baseUrl}?mode=studio&track=${currentTrack}`;

  const handleCopyStudent = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopiedStudent(true);
    setTimeout(() => setCopiedStudent(false), 2500);
  };

  const handleCopyTeacher = () => {
    navigator.clipboard.writeText(teacherUrl);
    setCopiedTeacher(true);
    setTimeout(() => setCopiedTeacher(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0B1B3D] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#0E2046]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cairo">
                مشاركة روابط المنصة وتثبيت التطبيق
              </h3>
              <p className="text-xs text-slate-300">
                أكاديمية المنارة التعليمية — روابط مخصصة للطلاب والمعلمين وتثبيت التابلت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Option 1: Student Locked Link */}
          <div className="glass-panel p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 to-[#0B1B3D] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-cairo">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>🔗 رابط الطالب المخصص (مقفول على واجهة الطالب لمسار: {activeTrackMeta.shortTitle}):</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                موصى به للطلاب
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-tajawal">
              يفتح التطبيق للطلاب مباشرة في وضع الطالب ويخفي تلقائياً زر التحويل لساحة المعلم وزر مقترحات التطوير.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={studentUrl}
                className="w-full bg-[#060E21] border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-200 select-all font-mono"
              />
              <button
                onClick={handleCopyStudent}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-emerald-900/30"
              >
                {copiedStudent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-100" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>🔗 نسخ رابط الطالب المخصص لهذا الدرس (مقفول)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Teacher Full Link */}
          <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/35 bg-gradient-to-r from-[#162C5B]/40 to-[#0B1B3D] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F5E6AB] flex items-center gap-1.5 font-cairo">
                <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>⚙️ رابط المعلم الكامل (لوحة الإدارة والاستوديو):</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/30">
                خاص بالمعلم
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-tajawal">
              يفتح الرابط بجميع الصلاحيات، متضمناً ساحة المعلم (Studio Mode) وأدوات التعديل والتغذية اليدوية.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={teacherUrl}
                className="w-full bg-[#060E21] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F5E6AB] select-all font-mono"
              />
              <button
                onClick={handleCopyTeacher}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-[#D4AF37]/20"
              >
                {copiedTeacher ? (
                  <>
                    <Check className="w-4 h-4 text-[#0B1B3D]" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>⚙️ نسخ رابط المعلم الكامل</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Official AI Studio Sharing Steps */}
          <div className="space-y-4">
            <div className="bg-[#162C5B]/70 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm mb-2 font-cairo">
                <ShieldCheck className="w-4 h-4" />
                <span>1. إنشاء رابط ثابت للطلاب (View only - للقراءة فقط):</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed font-tajawal list-disc list-inside">
                <li>
                  من مساحة العمل في <strong>Google AI Studio</strong>، اضغط على زر <strong>Share</strong> أو <strong>Get Link</strong> في الزاوية العلوية.
                </li>
                <li>
                  اختر مشاركة الرابط كـ <strong className="text-emerald-300">View only (للقراءة فقط)</strong>.
                </li>
                <li>
                  هذا يمنح الطلاب واجهة نظيفة ومستقلة تماماً تمكنهم من الاستماع للشروحات ومطالعة الكروت التزامنية وحل بنك التقييمات دون إمكانية التعديل على إعداداتك أو رؤية خانة التعليمات البرمجية.
                </li>
              </ul>
            </div>

            <div className="bg-[#162C5B]/70 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm mb-2 font-cairo">
                <Tablet className="w-4 h-4" />
                <span>2. تثبيت التطبيق على الكمبيوتر أو تابلت الثانوية (لينوفو):</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed font-tajawal list-disc list-inside">
                <li>
                  افتح رابط التطبيق عبر متصفح <strong>Google Chrome</strong> على جهاز الكمبيوتر أو تابلت الطالب.
                </li>
                <li>
                  اضغط على قائمة الخيارات الثلاثية في المتصفح (<code className="text-[#F5E6AB] bg-black/40 px-1 py-0.5 rounded">⋮</code>).
                </li>
                <li>
                  اختر <strong className="text-sky-300">Install app</strong> أو <strong className="text-sky-300">إضافة إلى الشاشة الرئيسية (Add to Home screen)</strong>.
                </li>
                <li>
                  سيتم إنشاء أيقونة تشغيل مستقلة مباشرة للتطبيق تعمل كبرنامج مخصص دون الحاجة للبحث عن الرابط في كل مرة.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D4AF37]/30 bg-[#0E2046] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-bold text-xs transition-colors"
          >
            تم وفهمت الخطوات
          </button>
        </div>
      </div>
    </div>
  );
};
