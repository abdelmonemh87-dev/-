import React from 'react';
import { TrackId, LessonScript } from '../../types';
import { PlusCircle, Edit3, Trash2, RotateCcw, Sliders, ShieldCheck } from 'lucide-react';

interface ScreenLiveControlBarProps {
  currentTrack: TrackId;
  currentLesson: LessonScript | null;
  onOpenControlModal: (tab: 'editLesson' | 'addLesson' | 'addTimeline' | 'addQuiz' | 'deleteCurrent' | 'resetTrack') => void;
  onOpenManagerModal?: () => void;
}

export const ScreenLiveControlBar: React.FC<ScreenLiveControlBarProps> = ({
  currentTrack,
  currentLesson,
  onOpenControlModal,
  onOpenManagerModal
}) => {
  return (
    <div className="bg-[#0B1B3D]/95 border border-[#D4AF37]/40 rounded-xl p-2.5 sm:p-3 mb-6 shadow-md flex flex-wrap items-center justify-between gap-3">
      {/* Title & Active Target Info */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-sm font-bold text-[#D4AF37]">
          🎛️
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white font-cairo">
              لوحة التحكم السريع بالشاشة
            </span>
            <span className="text-[10px] bg-[#162C5B] text-sky-200 px-2 py-0.5 rounded font-mono font-bold">
              {currentTrack}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-tajawal truncate max-w-xs sm:max-w-md">
            {currentLesson ? currentLesson.lessonTitle : 'اختر درساً للتحكم فيه'}
          </p>
        </div>
      </div>

      {/* Action Buttons: Add, Edit, Delete, Reset */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onOpenControlModal('addLesson')}
          className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-400 text-[#0B1B3D] text-xs font-black font-cairo flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="إضافة درس أو محتوى جديد للمسار"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>➕ إضافة</span>
        </button>

        <button
          onClick={() => onOpenControlModal('editLesson')}
          disabled={!currentLesson}
          className="px-3 py-1.5 rounded-lg bg-[#162C5B] hover:bg-[#1E3B7A] border border-[#D4AF37]/40 text-[#F5E6AB] text-xs font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          title="تعديل مباشر على نص وكروت الدرس المعروض"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-300" />
          <span>✏️ تعديل المعروض</span>
        </button>

        <button
          onClick={() => onOpenControlModal('deleteCurrent')}
          disabled={!currentLesson}
          className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-bold font-cairo flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
          title="حذف هذا الدرس من المسار"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>🗑️ حذف</span>
        </button>

        <button
          onClick={() => onOpenControlModal('resetTrack')}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-cairo flex items-center gap-1 transition-all cursor-pointer"
          title="استعادة المنهج الوزاري الأصلي للمسار"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>🔄 استعادة الأصلي</span>
        </button>

        {onOpenManagerModal && (
          <button
            onClick={onOpenManagerModal}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-400/40 text-indigo-200 text-xs font-bold font-cairo flex items-center gap-1.5 transition-all cursor-pointer"
            title="فتح الإدارة الشاملة للمسارات والنسخ الاحتياطي"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">إدارة شاملة</span>
          </button>
        )}
      </div>
    </div>
  );
};
