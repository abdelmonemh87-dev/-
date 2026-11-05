import React, { useState, useMemo, useEffect } from 'react';
import { FlashcardItem, LessonScript } from '../../types';
import {
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Crown,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FlashcardDeckProps {
  lesson?: LessonScript | null;
}

interface NormalizedCard {
  id: string;
  category: 'character' | 'place' | 'event';
  title: string;
  subtitle?: string;
  era: string;
  significance: string;
  examLearningOutcome: string;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ lesson }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'character' | 'place' | 'event'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Safe Guard: Dynamic derivation & strict validation
  const flashcards: NormalizedCard[] = useMemo(() => {
    if (!lesson) return [];

    try {
      // 1. Check explicit flashcards in lesson root or in studentSummary
      const rawCandidates = Array.isArray(lesson.flashcards) && lesson.flashcards.length > 0
        ? lesson.flashcards
        : Array.isArray(lesson.studentSummary?.flashcards) && lesson.studentSummary.flashcards.length > 0
        ? lesson.studentSummary.flashcards
        : [];

      // Safe filtering of valid cards: supports (front && back) OR (title && significance)
      const safeCustomCards = Array.isArray(rawCandidates)
        ? rawCandidates.filter((c: any) => c && ((c.front && c.back) || (c.title && c.significance)))
        : [];

      if (safeCustomCards.length > 0) {
        return safeCustomCards.map((c: any, idx: number) => {
          let cat: 'character' | 'place' | 'event' = 'event';
          if (c.category === 'character' || c.category === 'personality') {
            cat = 'character';
          } else if (c.category === 'place') {
            cat = 'place';
          } else {
            cat = 'event';
          }

          const title = (c.front || c.title || '').trim();
          const significance = (c.back || c.significance || '').trim();
          const era = (c.era || lesson.unitTitle || 'العصر الفرعوني').trim();
          const examLearningOutcome = (c.examLearningOutcome || 'استيعاب وتحليل ناتج التعلم المعتمد للامتحان.').trim();

          return {
            id: c.id || `card-${lesson.id}-${idx}`,
            category: cat,
            title,
            subtitle: c.subtitle || (cat === 'character' ? 'شخصية قيادية محورية' : cat === 'place' ? 'موقع استراتيجي' : 'حدث ومفصل تاريخي'),
            era,
            significance,
            examLearningOutcome
          };
        });
      }

      // 2. Dynamic generation fallback from lesson concepts and axes
      const derived: NormalizedCard[] = [];

      if (Array.isArray(lesson.studentSummary?.conceptsGlossary)) {
        lesson.studentSummary.conceptsGlossary.forEach((c, idx) => {
          if (c && c.term && c.definition) {
            derived.push({
              id: `fc-concept-${idx}`,
              category: idx % 3 === 0 ? 'character' : idx % 3 === 1 ? 'place' : 'event',
              title: c.term,
              subtitle: 'مفهوم ودلالة منهجية',
              era: lesson.unitTitle || 'الوحدة المقررة',
              significance: c.definition,
              examLearningOutcome: c.modernSystemSignificance || 'دلالته بنظام التقييم الحديث'
            });
          }
        });
      }

      if (Array.isArray(lesson.studentSummary?.axesExplanations)) {
        lesson.studentSummary.axesExplanations.forEach((axis, idx) => {
          if (axis && axis.axisTitle) {
            derived.push({
              id: `fc-axis-${idx}`,
              category: idx % 2 === 0 ? 'event' : 'place',
              title: axis.axisTitle,
              subtitle: 'علاقة (سبب ⬅️ نتيجة)',
              era: lesson.academicSubtitle || 'المنهج المقرر',
              significance: `السبب: ${axis.cause || ''} | النتيجة: ${axis.effect || ''}`,
              examLearningOutcome: axis.simpleExplanation || 'تحليل وفهم العلاقات التاريخية'
            });
          }
        });
      }

      if (lesson.studentSummary?.specializedCorner?.title) {
        derived.push({
          id: `fc-specialized-${lesson.id}`,
          category: lesson.studentSummary.specializedCorner.type === 'maritime' ? 'place' : 'character',
          title: lesson.studentSummary.specializedCorner.title,
          subtitle: 'شاهد أثري وملاحي استثنائي',
          era: lesson.unitTitle || 'العصر الفرعوني',
          significance: lesson.studentSummary.specializedCorner.content ? lesson.studentSummary.specializedCorner.content.slice(0, 160) + '...' : '',
          examLearningOutcome: 'الربط بين الجغرافيا الطبيعية والشواهد الحضارية المادية.'
        });
      }

      return derived;
    } catch (e) {
      console.error('Error generating flashcards', e);
      return [];
    }
  }, [lesson]);

  // Safe filtered list by category
  const filteredCards = useMemo(() => {
    if (!Array.isArray(flashcards) || flashcards.length === 0) return [];
    if (selectedCategory === 'all') return flashcards;
    return flashcards.filter((c) => c && c.category === selectedCategory);
  }, [flashcards, selectedCategory]);

  // Reset index safely on category or lesson change (zero infinite re-renders)
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, lesson?.id]);

  // Safe Guard: If no lesson or no cards, display polite message instead of crashing
  if (!lesson) {
    return null;
  }

  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-dashed border-[#D4AF37]/30 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-[#D4AF37] mx-auto opacity-70" />
        <p className="text-sm font-bold text-slate-300 font-cairo">
          لا توجد كروت فلاش مخصصة لهذا الدرس حالياً
        </p>
        <p className="text-xs text-slate-400 font-tajawal">
          يمكن إضافة كروت الفلاش عبر ساحة المعلم أو التغذية اليدوية.
        </p>
      </div>
    );
  }

  // Clamped index for safety
  const safeIndex = filteredCards.length > 0 ? Math.max(0, Math.min(currentIndex, filteredCards.length - 1)) : 0;
  const currentCard = filteredCards[safeIndex] || flashcards[0];

  const handleNext = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const getCategoryDetails = (cat: 'character' | 'place' | 'event') => {
    switch (cat) {
      case 'character':
        return {
          label: 'شخصية تاريخية',
          icon: <Crown className="w-3.5 h-3.5" />,
          badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
          gradient: 'from-[#2c1d06] via-[#0B1B3D] to-[#122856]',
          border: 'border-amber-500/50'
        };
      case 'place':
        return {
          label: 'موقع استراتيجي',
          icon: <MapPin className="w-3.5 h-3.5" />,
          badgeBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
          gradient: 'from-[#06241a] via-[#0B1B3D] to-[#0d2a45]',
          border: 'border-emerald-500/50'
        };
      case 'event':
      default:
        return {
          label: 'حدث وتاريخ محوري',
          icon: <Clock className="w-3.5 h-3.5" />,
          badgeBg: 'bg-sky-950/80 border-sky-500/50 text-sky-300',
          gradient: 'from-[#071d36] via-[#0B1B3D] to-[#1a1c4a]',
          border: 'border-sky-500/50'
        };
    }
  };

  const currentStyle = getCategoryDetails(currentCard.category);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/35 space-y-4 shadow-xl">
      {/* Header of Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white font-cairo flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
              ⚡
            </span>
            <span>كروت المنارة للمراجعة السريعة (Flip Flashcards)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162C5B] text-sky-200 border border-sky-400/30 font-bold font-mono">
              {filteredCards.length} كروت
            </span>
          </h3>
          <p className="text-xs text-[#F5E6AB] font-tajawal mt-0.5">
            دليل الإنجاز السريع بنظام البطاقات المقلوبة لتثبيت الشخصيات، المواقع، والأحداث ونواتج تعلمها.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#060E21] p-1 rounded-xl border border-slate-700/80 overflow-x-auto no-scrollbar max-w-full text-xs font-bold font-cairo">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#D4AF37] text-[#0B1B3D] shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل ({flashcards.length})
          </button>
          <button
            onClick={() => setSelectedCategory('character')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'character'
                ? 'bg-amber-500 text-[#0B1B3D] shadow-sm'
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <Crown className="w-3 h-3" />
            <span>شخصيات</span>
          </button>
          <button
            onClick={() => setSelectedCategory('place')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'place'
                ? 'bg-emerald-500 text-[#0B1B3D] shadow-sm'
                : 'text-emerald-300 hover:text-emerald-200'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>مواقع</span>
          </button>
          <button
            onClick={() => setSelectedCategory('event')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedCategory === 'event'
                ? 'bg-sky-500 text-[#0B1B3D] shadow-sm'
                : 'text-sky-300 hover:text-sky-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>أحداث</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="relative w-full max-w-2xl mx-auto min-h-[260px] sm:min-h-[280px] select-none perspective-[1200px]">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[260px] sm:min-h-[280px] rounded-2xl cursor-pointer transition-all duration-500 transform-style-3d relative ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* FRONT SIDE */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between border-2 ${currentStyle.border} bg-gradient-to-br ${currentStyle.gradient} shadow-2xl backface-hidden`}
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 font-cairo ${currentStyle.badgeBg}`}
              >
                {currentStyle.icon}
                <span>{currentStyle.label}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono font-bold">
                  {safeIndex + 1} / {filteredCards.length}
                </span>
                <span className="p-1 rounded-full bg-white/10 text-[#D4AF37]">
                  <RotateCw className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="text-center my-auto py-4">
              <h4 className="text-xl sm:text-2xl font-black text-white font-cairo leading-relaxed drop-shadow-md">
                {currentCard.title}
              </h4>
              {currentCard.subtitle && (
                <p className="text-xs sm:text-sm text-[#F5E6AB] font-tajawal mt-1 font-semibold">
                  {currentCard.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <span className="text-slate-400 font-tajawal text-[11px]">
                العصر: {currentCard.era}
              </span>
              <span className="text-[#D4AF37] font-bold font-cairo flex items-center gap-1 text-[11px] animate-pulse">
                <span>👆 اضغط لقلب الكارت وكشف الأهمية</span>
                <RotateCw className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between border-2 border-[#D4AF37] bg-gradient-to-br from-[#0B1B3D] via-[#122856] to-[#0A1838] shadow-2xl backface-hidden`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-bold text-white font-cairo truncate">
                  {currentCard.title}
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0B1B3D] font-black font-cairo">
                الوجه الخلفي: الدلالة والناتج
              </span>
            </div>

            <div className="space-y-3 my-auto py-2">
              <div className="bg-[#060E21]/80 p-3 rounded-xl border border-slate-700/80">
                <span className="text-[11px] font-bold text-[#F5E6AB] block mb-1 font-cairo flex items-center gap-1">
                  <span>📜 الأهمية التاريخية والدور المحوري:</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-100 font-tajawal leading-relaxed">
                  {currentCard.significance}
                </p>
              </div>

              <div className="bg-[#0B4F3C]/50 p-3 rounded-xl border border-emerald-500/40">
                <span className="text-[11px] font-bold text-emerald-300 block mb-1 font-cairo flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🎯 ناتج التعلم الامتحاني المعتمد:</span>
                </span>
                <p className="text-xs sm:text-sm text-emerald-100 font-tajawal leading-relaxed">
                  {currentCard.examLearningOutcome}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400 font-mono text-[10px]">
                {safeIndex + 1} من {filteredCards.length}
              </span>
              <span className="text-[#D4AF37] font-bold font-cairo flex items-center gap-1 text-[11px]">
                <span>👆 اضغط للعودة للوجه الأمامي</span>
                <RotateCw className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto pt-2">
        <button
          onClick={handlePrev}
          disabled={filteredCards.length <= 1}
          className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-[#1E3B7A] border border-[#D4AF37]/30 text-[#F5E6AB] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الكارت السابق</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-black text-xs font-cairo flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>{isFlipped ? 'عرض السؤال' : 'قلب الكارت'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={filteredCards.length <= 1}
          className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-[#1E3B7A] border border-[#D4AF37]/30 text-[#F5E6AB] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
        >
          <span>الكارت التالي</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full bg-[#060E21] h-1.5 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-[#D4AF37] via-amber-400 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${((safeIndex + 1) / Math.max(filteredCards.length, 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};
