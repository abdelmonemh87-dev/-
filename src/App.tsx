import React, { useState } from 'react';
import { TrackId, AppMode, TrackMeta } from './types';
import { TRACKS } from './data/historyData';
import { Header } from './components/Header';
import { FooterBanner } from './components/FooterBanner';
import { StudioWorkspace } from './components/StudioMode/StudioWorkspace';
import { StudentWorkspace } from './components/StudentMode/StudentWorkspace';
import { TimeCalculatorModal } from './components/Modals/TimeCalculatorModal';
import { ShareModal } from './components/Modals/ShareModal';
import { IdeasModal } from './components/Modals/IdeasModal';
import { AddTrackModal } from './components/Modals/AddTrackModal';
import { ShieldCheck, BookOpen, Clock, Compass, Sparkles, MessageCircle } from 'lucide-react';

export default function App() {
  // Check URL query parameters and hash on load for smart link routing
  const [isStudentLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hashStr.includes('?') ? hashStr.split('?')[1] : hashStr);
    const mode = urlParams.get('mode') || hashParams.get('mode');
    const lock = urlParams.get('studentLock') || hashParams.get('studentLock');
    return mode === 'student' || lock === '1';
  });

  // Dynamic Tracks state (defaults + custom tracks from localStorage)
  const [allTracks, setAllTracks] = useState<Record<string, TrackMeta>>(() => {
    if (typeof window === 'undefined') return TRACKS;
    try {
      const saved = localStorage.getItem('manara_custom_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...TRACKS, ...parsed };
        }
      }
    } catch (e) {
      console.error('Failed to parse custom tracks', e);
    }
    return TRACKS;
  });

  const [currentTrack, setCurrentTrack] = useState<TrackId>(() => {
    if (typeof window === 'undefined') return 'track1';
    const urlParams = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hashStr.includes('?') ? hashStr.split('?')[1] : hashStr);
    const trackParam = (urlParams.get('track') || hashParams.get('track')) as TrackId;
    if (trackParam) {
      return trackParam;
    }
    return 'track1';
  });

  const [appMode, setAppMode] = useState<AppMode>(() => {
    if (typeof window === 'undefined') return 'student';
    const urlParams = new URLSearchParams(window.location.search);
    const hashStr = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const hashParams = new URLSearchParams(hashStr.includes('?') ? hashStr.split('?')[1] : hashStr);
    const mode = urlParams.get('mode') || hashParams.get('mode');
    const lock = urlParams.get('studentLock') || hashParams.get('studentLock');
    if (mode === 'student' || lock === '1') return 'student';
    return (urlParams.get('mode') as AppMode) || 'student';
  });

  // Modals state
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isIdeasOpen, setIsIdeasOpen] = useState(false);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);

  const handleAddCustomTrack = (newTrack: TrackMeta) => {
    setAllTracks((prev) => {
      const updated = { ...prev, [newTrack.id]: newTrack };
      try {
        const customOnly: Record<string, TrackMeta> = {};
        Object.keys(updated).forEach((k) => {
          if (!TRACKS[k as keyof typeof TRACKS]) {
            customOnly[k] = updated[k];
          }
        });
        localStorage.setItem('manara_custom_tracks', JSON.stringify(customOnly));
      } catch (e) {
        console.error('Failed to save custom tracks', e);
      }
      return updated;
    });
    setCurrentTrack(newTrack.id);
  };

  const activeTrackMeta = allTracks[currentTrack] || TRACKS[currentTrack] || TRACKS['track1'];

  return (
    <div className="min-h-screen bg-[#070e1f] text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-[#0B1B3D]">
      {/* Official Academy Header */}
      <Header
        currentTrack={currentTrack}
        onSelectTrack={setCurrentTrack}
        appMode={appMode}
        onToggleMode={(newMode) => {
          if (isStudentLocked && newMode === 'studio') return;
          setAppMode(newMode);
        }}
        isStudentLocked={isStudentLocked}
        onOpenCalc={() => setIsCalcOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenIdeas={() => setIsIdeasOpen(true)}
        allTracks={allTracks}
        onOpenAddTrack={() => setIsAddTrackOpen(true)}
      />

      {/* Hero Official Banner */}
      <section className="relative overflow-hidden border-b border-[#D4AF37]/30 bg-gradient-to-b from-[#0A1838] via-[#0E2046] to-[#071024] py-8 sm:py-10">
        {/* Subtle Decorative Lighthouse & Compass SVG */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <svg className="w-[600px] h-[600px]" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" fill="none" />
            <polygon points="95,150 105,150 103,50 97,50" />
            <polygon points="92,50 108,50 100,30" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-right max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                <span>أكاديمية المنارة التعليمية • «هنذاكر {activeTrackMeta.targetSubject} سوا» 🎯</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight font-cairo">
                المنارة في {activeTrackMeta.targetSubject}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6AB] via-[#D4AF37] to-amber-300 mt-1">
                  {activeTrackMeta.title}
                </span>
              </h1>

              <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed font-tajawal max-w-2xl">
                {activeTrackMeta.description} نلتزم التزاماً صارماً بمصادر المناهج الرسمية ونواتج التعلم المعتمدة، وعند غياب تاريخ محدد في نصوص الوزارة تم التنويه الصريح بعبارة{' '}
                <span className="text-amber-300 font-bold underline decoration-dotted">«غير محدد في الوحدة»</span>.
              </p>

              {/* Fast Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="glass-panel p-2.5 rounded-xl text-center border-[#D4AF37]/30">
                  <span className="block text-[#D4AF37] font-black text-lg font-cairo">4</span>
                  <span className="text-[11px] text-slate-300">مسارات دراسية وبودكاست</span>
                </div>
                <div className="glass-panel p-2.5 rounded-xl text-center border-[#D4AF37]/30">
                  <span className="block text-emerald-400 font-black text-lg font-cairo">4 كروت</span>
                  <span className="text-[11px] text-slate-300">شاشة تزامنية للـ TTS</span>
                </div>
                <div className="glass-panel p-2.5 rounded-xl text-center border-[#D4AF37]/30">
                  <span className="block text-amber-300 font-black text-lg font-cairo">100%</span>
                  <span className="text-[11px] text-slate-300">مطابقة للأدلة الوزارية</span>
                </div>
                <div className="glass-panel p-2.5 rounded-xl text-center border-[#D4AF37]/30">
                  <span className="block text-sky-400 font-black text-lg font-cairo">تفاعلي</span>
                  <span className="text-[11px] text-slate-300">حاسبة زمن وخط معتمد</span>
                </div>
              </div>
            </div>

            {/* Academic Seal / Track Card */}
            <div className="glass-panel-gold p-6 rounded-2xl w-full max-w-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#0B1B3D] flex items-center justify-center border-2 border-[#D4AF37] shadow-inner mb-3 text-2xl">
                🏛️
              </div>
              <h2 className="font-bold text-white text-base font-cairo">
                دستور المنارة الأكاديمي
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 font-tajawal leading-relaxed">
                «هنذاكر {activeTrackMeta.targetSubject} سوا» 🎯 — منهجية استخلاص النتائج، تدريب مستمر على الفهم والتحليل، والربط الدقيق بين الشواهد التاريخية ونواتج التعلم المركبة.
              </p>
              <div className="mt-4 pt-3 border-t border-[#D4AF37]/25 w-full flex items-center justify-between text-[11px] text-[#F5E6AB] font-mono">
                <span>{activeTrackMeta.shortTitle}</span>
                <span>{activeTrackMeta.curriculumBadge}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {appMode === 'studio' ? (
          <StudioWorkspace
            currentTrack={currentTrack}
            allTracks={allTracks}
            onSelectTrack={setCurrentTrack}
            onAddCustomTrack={handleAddCustomTrack}
            onOpenAddTrack={() => setIsAddTrackOpen(true)}
          />
        ) : (
          <StudentWorkspace
            currentTrack={currentTrack}
            allTracks={allTracks}
            onSelectTrack={setCurrentTrack}
            isStudentLocked={isStudentLocked}
          />
        )}
      </main>

      {/* Mandatory Unified Institutional Footer Banner */}
      <FooterBanner subjectName={activeTrackMeta.targetSubject} />

      {/* Interactive Modals */}
      <TimeCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        currentTrack={currentTrack}
        allTracks={allTracks}
      />

      <IdeasModal
        isOpen={isIdeasOpen}
        onClose={() => setIsIdeasOpen(false)}
      />

      <AddTrackModal
        isOpen={isAddTrackOpen}
        onClose={() => setIsAddTrackOpen(false)}
        onAddTrack={handleAddCustomTrack}
      />
    </div>
  );
}
