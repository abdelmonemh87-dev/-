import React from 'react';
import { TrackId, TrackMeta } from '../../types';
import { TRACKS } from '../../data/historyData';
import { Landmark, Shield, BookOpen, Mic, Sparkles, ChevronLeft } from 'lucide-react';

interface CurriculumSwitcherProps {
  currentTrack: TrackId;
  onSelectTrack: (trackId: TrackId) => void;
  allTracks?: Record<string, TrackMeta>;
  lessonCounts?: Record<string, number>;
}

export const CurriculumSwitcher: React.FC<CurriculumSwitcherProps> = ({
  currentTrack,
  onSelectTrack,
  allTracks = TRACKS,
  lessonCounts = {}
}) => {
  const defaultTrackIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    track1: {
      icon: <Landmark className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-400/50 text-amber-300',
      bg: 'bg-amber-950/20'
    },
    track2: {
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-400/50 text-emerald-300',
      bg: 'bg-emerald-950/20'
    },
    track3: {
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-400/50 text-sky-300',
      bg: 'bg-sky-950/20'
    },
    podcast: {
      icon: <Mic className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-400/50 text-purple-300',
      bg: 'bg-purple-950/20'
    }
  };

  const trackKeys = Object.keys(allTracks);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-300 font-cairo">
            مناهج تاريخ المرحلة الثانوية والبكالوريا المصرية (اضغط للتبديل الفوري):
          </h2>
        </div>
        <span className="text-[11px] text-[#D4AF37] font-mono font-bold hidden sm:inline">
          {trackKeys.length} مسارات معتمدة
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {trackKeys.map((key) => {
          const t = allTracks[key] || TRACKS[key as keyof typeof TRACKS];
          if (!t) return null;
          const isSelected = currentTrack === key;
          const style = defaultTrackIcons[key] || {
            icon: <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
            color: 'border-[#D4AF37]/50 text-[#F5E6AB]',
            bg: 'bg-[#0B1B3D]'
          };
          const count = lessonCounts[key] || (key === 'track1' ? 5 : key === 'track2' ? 3 : key === 'track3' ? 4 : key === 'podcast' ? 8 : 0);

          return (
            <button
              key={key}
              onClick={() => onSelectTrack(key as TrackId)}
              className={`relative text-right p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-[#122856] to-[#0A1838] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/15 ring-2 ring-[#D4AF37]/40 translate-y-[-2px]'
                  : 'bg-[#0A1838]/80 hover:bg-[#0E224D] border-slate-700/60 hover:border-slate-500'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse" />
              )}

              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-[#070e1f]/60">{style.icon}</span>
                    <span className="text-xs font-black text-white font-cairo truncate">
                      {t.shortTitle}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#0B1B3D]'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {count} {key === 'podcast' ? 'حلقات' : 'دروس'}
                  </span>
                </div>

                <div className="text-xs font-bold text-[#F5E6AB] truncate font-tajawal">
                  {t.title}
                </div>

                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-tajawal">
                  {t.curriculumBadge}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                <span className={isSelected ? 'text-[#D4AF37] font-bold' : 'text-slate-400'}>
                  {isSelected ? '✓ المنهج النشط حالياً' : 'اضغط للعرض'}
                </span>
                <ChevronLeft className={`w-3 h-3 transition-transform ${isSelected ? 'text-[#D4AF37] -translate-x-1' : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
