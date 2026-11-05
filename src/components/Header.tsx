import React from 'react';
import { TrackId, AppMode, TrackMeta } from '../types';
import { TRACKS } from '../data/historyData';
import { Clock, Share2, Lightbulb, UserCheck, Mic2, Compass } from 'lucide-react';

interface HeaderProps {
  currentTrack: TrackId;
  onSelectTrack: (track: TrackId) => void;
  appMode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  isStudentLocked?: boolean;
  onOpenCalc: () => void;
  onOpenShare: () => void;
  onOpenIdeas: () => void;
  allTracks?: Record<string, TrackMeta>;
  onOpenAddTrack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrack,
  onSelectTrack,
  appMode,
  onToggleMode,
  isStudentLocked = false,
  onOpenCalc,
  onOpenShare,
  onOpenIdeas,
  allTracks,
  onOpenAddTrack
}) => {
  const tracksToUse = allTracks || TRACKS;
  const activeTrackMeta = tracksToUse[currentTrack] || TRACKS[currentTrack] || TRACKS['track1'];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1B3D]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract (1 Row, 3 Zones) */}
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Zone 1: Brand Wordmark & Seal */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Authentic Royal Squircle Seal «تاريخ المنارة» */}
            <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-[#D4AF37] via-amber-400 to-[#0B4F3C] flex items-center justify-center shadow-md shadow-[#D4AF37]/25 shrink-0 overflow-hidden">
              <img
                src="/icon.svg"
                alt="تاريخ المنارة"
                className="w-full h-full rounded-[14px] object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6AB] via-[#D4AF37] to-amber-400 font-cairo whitespace-nowrap">
                  المنارة في {activeTrackMeta.targetSubject}
                </span>
                <span className="text-[11px] text-[#F5E6AB] bg-[#162C5B] px-2 py-0.5 rounded border border-[#D4AF37]/30 font-bold hidden sm:inline-block">
                  «هنذاكر {activeTrackMeta.targetSubject} سوا» 🎯
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-tajawal hidden md:block">
                أكاديمية المنارة التعليمية • {activeTrackMeta.academicSubtitle}
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Tracks (Dynamic Tracks) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#060E21]/80 p-1.5 rounded-xl border border-[#D4AF37]/25 overflow-x-auto no-scrollbar max-w-xl">
            {(Object.keys(tracksToUse) as TrackId[]).map((tId) => {
              const meta = tracksToUse[tId];
              if (!meta) return null;
              const isActive = currentTrack === tId;
              return (
                <button
                  key={tId}
                  onClick={() => onSelectTrack(tId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-md shadow-[#D4AF37]/20 font-cairo'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 font-tajawal'
                  }`}
                >
                  {meta.shortTitle}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Mode Switch & Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* If student locked, display clean locked badge, otherwise display interactive segmented switch */}
            {isStudentLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold shadow-sm">
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">واجهة الطالب المعتمدة</span>
                <span className="sm:hidden">طالب</span>
              </div>
            ) : (
              <div className="flex items-center p-1 bg-[#162C5B] rounded-xl border border-[#D4AF37]/30">
                <button
                  onClick={() => onToggleMode('student')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    appMode === 'student'
                      ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">واجهة الطالب</span>
                  <span className="sm:hidden">طالب</span>
                </button>
                <button
                  onClick={() => onToggleMode('studio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    appMode === 'studio'
                      ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ساحة المعلم (Studio)</span>
                  <span className="sm:hidden">المعلم</span>
                </button>
              </div>
            )}

            {/* Quick Tools */}
            <button
              onClick={onOpenCalc}
              title="حاسبة القرون والعقود التاريخية"
              className="p-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B1B3D] border border-[#D4AF37]/30 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden xl:inline">حاسبة الزمن</span>
            </button>

            <button
              onClick={onOpenShare}
              title="مشاركة رابط الطالب وتثبيت التطبيق"
              className="p-2 rounded-xl bg-[#162C5B] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B1B3D] border border-[#D4AF37]/30 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden xl:inline">مشاركة</span>
            </button>

            {/* Hide Ideas button when in Student Locked Mode */}
            {!isStudentLocked && (
              <button
                onClick={onOpenIdeas}
                title="مقترحات وأفكار التطوير"
                className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all text-xs shrink-0"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Sub-Navigation Bar for Dynamic Tracks (Touch Optimized) */}
        <div className="lg:hidden flex items-center overflow-x-auto gap-2 py-2.5 border-t border-[#D4AF37]/20 no-scrollbar touch-pan-x overscroll-x-contain">
          {(Object.keys(tracksToUse) as TrackId[]).map((tId) => {
            const meta = tracksToUse[tId];
            if (!meta) return null;
            const isActive = currentTrack === tId;
            return (
              <button
                key={tId}
                onClick={() => onSelectTrack(tId)}
                className={`min-h-[42px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-md shadow-[#D4AF37]/20 font-cairo'
                    : 'bg-[#162C5B] text-slate-300 hover:text-white border border-[#D4AF37]/20 font-tajawal'
                }`}
              >
                {meta.shortTitle}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
