import React, { useState } from 'react';
import { X, Clock, HelpCircle, Sparkles, Award } from 'lucide-react';

interface TimeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Convert numbers 1-50 to Arabic ordinal feminine/masculine forms
const getCenturyOrdinalArabic = (num: number): string => {
  const ordinals: Record<number, string> = {
    1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس',
    6: 'السادس', 7: 'السابع', 8: 'الثامن', 9: 'التاسع', 10: 'العاشر',
    11: 'الحادي عشر', 12: 'الثاني عشر', 13: 'الثالث عشر', 14: 'الرابع عشر', 15: 'الخامس عشر',
    16: 'السادس عشر', 17: 'السابع عشر', 18: 'الثامن عشر', 19: 'التاسع عشر', 20: 'العشرين',
    21: 'الحادي والعشرين', 22: 'الثاني والعشرين', 23: 'الثالث والعشرين', 24: 'الرابع والعشرين', 25: 'الخامس والعشرين',
    26: 'السادس والعشرين', 27: 'السابع والعشرين', 28: 'الثامن والعشرين', 29: 'التاسع والعشرين', 30: 'الثلاثين',
    31: 'الحادي والثلاثين', 32: 'الثاني والثلاثين', 33: 'الثالث والثلاثين', 34: 'الرابع والثلاثين', 35: 'الخامس والثلاثين',
    36: 'السادس والثلاثين', 37: 'السابع والثلاثين', 38: 'الثامن والثلاثين', 39: 'التاسع والثلاثين', 40: 'الأربعين'
  };
  return ordinals[num] || `رقم ${num}`;
};

const getMillenniumOrdinalArabic = (num: number): string => {
  const ordinals: Record<number, string> = {
    1: 'الأولى', 2: 'الثانية', 3: 'الثالثة', 4: 'الرابعة', 5: 'الخامسة',
    6: 'السادسة', 7: 'السابعة', 8: 'الثامنة', 9: 'التاسعة', 10: 'العاشرة'
  };
  return ordinals[num] || `رقم ${num}`;
};

export const TimeCalculatorModal: React.FC<TimeCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [yearInput, setYearInput] = useState<number>(3200);
  const [eraType, setEraType] = useState<'bc' | 'ad'>('bc');

  if (!isOpen) return null;

  // Calculation logic
  const y = Math.max(1, Math.abs(yearInput) || 1);

  // Century calculations
  const century = Math.floor((y - 1) / 100) + 1;
  const remYearInCentury = ((y - 1) % 100) + 1; // 1 to 100
  const centuryArabic = getCenturyOrdinalArabic(century);

  // Millennium calculations (الألفية = 1000 سنة)
  const millennium = Math.floor((y - 1) / 1000) + 1;
  const remYearInMillennium = ((y - 1) % 1000) + 1; // 1 to 1000
  const millenniumArabic = getMillenniumOrdinalArabic(millennium);
  const isMillenniumFirstHalf = remYearInMillennium <= 500;
  const millenniumHalfPhrase = isMillenniumFirstHalf ? 'النصف الأول' : 'النصف الثاني';
  const millenniumPhrase = `${millenniumHalfPhrase} من الألفية ${millenniumArabic} ${eraType === 'bc' ? 'قبل الميلاد' : 'الميلادية'}`;

  // Decade calculations (العقد = 10 سنوات)
  const decade = Math.floor((remYearInCentury - 1) / 10) + 1; // 1 to 10
  const isFirstHalfCentury = remYearInCentury <= 50;

  const quarter = remYearInCentury <= 25 ? 'الأول' :
                  remYearInCentury <= 50 ? 'الثاني' :
                  remYearInCentury <= 75 ? 'الثالث' : 'الرابع والأخير';

  const decadeNames = [
    'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
    'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'
  ];

  // Early / Mid / Late Century calculation (أوائل وأواسط وأواخر القرن)
  // In AD: 1-20 = أوائل, 21-79 = أواسط, 80-100 = أواخر
  // In BC (countdown): 81-100 = أوائل ق.م, 21-80 = أواسط ق.م, 1-20 = أواخر ق.م
  let centuryPartPhrase = '';
  if (eraType === 'ad') {
    if (remYearInCentury <= 20) {
      centuryPartPhrase = 'أوائل القرن (مطلع القرن)';
    } else if (remYearInCentury <= 79) {
      centuryPartPhrase = 'أواسط القرن (منتصف القرن)';
    } else {
      centuryPartPhrase = 'أواخر القرن (نهاية القرن)';
    }
  } else {
    if (remYearInCentury >= 81) {
      centuryPartPhrase = 'أوائل القرن ق.م (مطلع القرن ق.م)';
    } else if (remYearInCentury >= 21) {
      centuryPartPhrase = 'أواسط القرن ق.م (منتصف القرن ق.م)';
    } else {
      centuryPartPhrase = 'أواخر القرن ق.م (نهاية القرن ق.م)';
    }
  }

  // Generation calculation (الجيل الزمني = 33 سنة تقريباً / ثلث قرن)
  let generationPhrase = '';
  if (eraType === 'ad') {
    if (remYearInCentury <= 33) {
      generationPhrase = 'الجيل الأول من القرن (الثلث الأول)';
    } else if (remYearInCentury <= 66) {
      generationPhrase = 'الجيل الثاني من القرن (الثلث الأوسط)';
    } else {
      generationPhrase = 'الجيل الثالث من القرن (الثلث الأخير)';
    }
  } else {
    if (remYearInCentury >= 67) {
      generationPhrase = 'الجيل الأول من القرن ق.م (الثلث الأول)';
    } else if (remYearInCentury >= 34) {
      generationPhrase = 'الجيل الثاني من القرن ق.م (الثلث الأوسط)';
    } else {
      generationPhrase = 'الجيل الثالث من القرن ق.م (الثلث الأخير)';
    }
  }

  // Official Composite Exam Verbal Phrase
  const compositeExamPhrase = `${millenniumPhrase} — ${centuryPartPhrase} من القرن ${centuryArabic} ${eraType === 'bc' ? 'ق.م' : 'م'} — العقد ${decadeNames[decade - 1]} — ${generationPhrase.split(' ')[0]} ${generationPhrase.split(' ')[1]}`;

  const presets = [
    { label: '3350 ق.م (اختراع الكتابة وبداية العصور التاريخية)', year: 3350, era: 'bc' as const },
    { label: '3200 ق.م (توحيد القطرين - نعرمر)', year: 3200, era: 'bc' as const },
    { label: '1570 ق.م (طرد الهكسوس والدولة الحديثة)', year: 1570, era: 'bc' as const },
    { label: '525 ق.م (غزو الفرس لمصر - معركة الفرما)', year: 525, era: 'bc' as const },
    { label: '641 م (الفتح الإسلامي لمصر - عمرو بن العاص)', year: 641, era: 'ad' as const },
    { label: '1453 م (فتح القسطنطينية وسقوط البيزنطيين)', year: 1453, era: 'ad' as const },
    { label: '1798 م (الحملة الفرنسية على مصر)', year: 1798, era: 'ad' as const },
    { label: '1805 م (تولية محمد علي - دار المحكمة)', year: 1805, era: 'ad' as const },
    { label: '1919 م (ثورة 1919 القومية)', year: 1919, era: 'ad' as const },
    { label: '1973 م (نصر أكتوبر المجيد)', year: 1973, era: 'ad' as const },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-[#0B1B3D] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#0E2046]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cairo">
                حاسبة الزمن والقرون والألفيات والأجيال التاريخية
              </h3>
              <p className="text-xs text-slate-300">
                أداة أكاديمية لحساب الفترات وتحويل التواريخ الرقمية لصيغ امتحان الثانوية العامة الرسمية
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 no-scrollbar">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F5E6AB] mb-1.5 font-cairo">
                أدخل السنة التاريخية المطلوبة:
              </label>
              <input
                type="number"
                min="1"
                max="9999"
                value={yearInput}
                onChange={(e) => setYearInput(parseInt(e.target.value) || 1)}
                className="w-full bg-[#162C5B] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-white font-bold text-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5E6AB] mb-1.5 font-cairo">
                الحقبة التاريخية:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEraType('bc')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                    eraType === 'bc'
                      ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37] shadow-md font-cairo'
                      : 'bg-[#162C5B] text-slate-300 border-[#D4AF37]/30 hover:bg-[#1a346e]'
                  }`}
                >
                  قبل الميلاد (ق.م)
                </button>
                <button
                  type="button"
                  onClick={() => setEraType('ad')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                    eraType === 'ad'
                      ? 'bg-[#D4AF37] text-[#0B1B3D] border-[#D4AF37] shadow-md font-cairo'
                      : 'bg-[#162C5B] text-slate-300 border-[#D4AF37]/30 hover:bg-[#1a346e]'
                  }`}
                >
                  ميلادياً (م)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Curriculum Presets */}
          <div>
            <span className="text-xs text-slate-400 block mb-2 font-cairo font-semibold">
              محطات منهجية معتمدة للتجربة السريعة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setYearInput(p.year);
                    setEraType(p.era);
                  }}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    yearInput === p.year && eraType === p.era
                      ? 'bg-[#D4AF37] text-[#0B1B3D] font-bold border-[#D4AF37]'
                      : 'bg-[#162C5B]/80 hover:bg-[#D4AF37]/20 border-[#D4AF37]/30 text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* COMPOSITE OFFICIAL EXAM PHRASE BANNER */}
          <div className="bg-gradient-to-r from-[#0B4F3C] via-[#0E2046] to-[#0B1B3D] p-4 rounded-xl border border-emerald-400/40 shadow-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-cairo">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>الصيغة الامتحانية المركبة المعتمدة (كيف يأتي التاريخ في رأس السؤال؟):</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/40 font-mono">
                صيغة وزارة التربية والتعليم
              </span>
            </div>
            <div className="text-sm sm:text-base font-black text-[#F5E6AB] font-tajawal leading-relaxed">
              « {compositeExamPhrase} »
            </div>
          </div>

          {/* Detailed Mathematical Calculation Result */}
          <div className="glass-panel-gold p-5 rounded-xl border border-[#D4AF37]/50 space-y-4">
            <div className="text-center pb-3 border-b border-[#D4AF37]/20">
              <span className="text-xs text-slate-300">النتيجة الأكاديمية المفصلة للسنة:</span>
              <div className="text-2xl font-black text-[#F5E6AB] mt-1 font-cairo">
                عام {y} {eraType === 'bc' ? 'قبل الميلاد (ق.م)' : 'ميلادية (م)'}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* 1. Millennium */}
              <div className="bg-[#0B1B3D]/80 p-3 rounded-lg border border-[#D4AF37]/30">
                <span className="block text-[11px] text-slate-400 font-cairo">الألفية التاريخية</span>
                <span className="text-base font-bold text-[#D4AF37] mt-0.5 block font-cairo">
                  الألفية {millenniumArabic} {eraType === 'bc' ? 'ق.م' : 'م'}
                </span>
                <span className="text-[10px] text-sky-300 block mt-0.5">
                  ({millenniumHalfPhrase})
                </span>
              </div>

              {/* 2. Century & Arabic Ordinal */}
              <div className="bg-[#0B1B3D]/80 p-3 rounded-lg border border-[#D4AF37]/30">
                <span className="block text-[11px] text-slate-400 font-cairo">القرن التاريخي</span>
                <span className="text-base font-bold text-amber-300 mt-0.5 block font-cairo">
                  القرن {centuryArabic}
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5 font-mono">
                  (القرن {century} {eraType === 'bc' ? 'ق.م' : 'م'})
                </span>
              </div>

              {/* 3. Century Period (أوائل / أواسط / أواخر) */}
              <div className="bg-[#0B1B3D]/80 p-3 rounded-lg border border-[#D4AF37]/30">
                <span className="block text-[11px] text-slate-400 font-cairo">موقع السنة في القرن</span>
                <span className="text-xs sm:text-sm font-bold text-sky-300 mt-1 block font-cairo">
                  {centuryPartPhrase.split(' ')[0]} {centuryPartPhrase.split(' ')[1]}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {isFirstHalfCentury ? 'النصف الأول' : 'النصف الثاني'}
                </span>
              </div>

              {/* 4. Generation & Decade */}
              <div className="bg-[#0B1B3D]/80 p-3 rounded-lg border border-[#D4AF37]/30">
                <span className="block text-[11px] text-slate-400 font-cairo">الجيل الزمني (33 سنة)</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-300 mt-1 block font-cairo">
                  {generationPhrase.split('(')[0]}
                </span>
                <span className="text-[10px] text-amber-200 block mt-0.5">
                  العقد {decadeNames[decade - 1]} (الربع {quarter})
                </span>
              </div>
            </div>

            {/* Academic Rules Explanation */}
            <div className="bg-[#060E21]/80 p-4 rounded-lg border border-slate-700/80 text-xs text-slate-300 space-y-2 leading-relaxed font-tajawal">
              <div className="flex items-center gap-1.5 text-[#F5E6AB] font-bold">
                <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>القواعد الحاكمة لحساب الزمن في أسئلة امتحانات الثانوية العامة:</span>
              </div>
              <p>
                • <strong className="text-white">قاعدة الألفية (1000 سنة):</strong> لحساب الألفية، نحذف خانات الآحاد والعشرات والمئات ونضيف 1 للمتبقي (أو نقسم على 1000 مع التقريب للأعلى). فعام {y} يقع في الألفية {millenniumArabic}، وهو في {millenniumPhrase}.
              </p>
              <p>
                • <strong className="text-white">قاعدة أوائل وأواسط وأواخر القرن:</strong>
                {eraType === 'ad' ? (
                  <span> في السنوات الميلادية (م): من 1 إلى 20 = أوائل القرن، ومن 21 إلى 79 = أواسط القرن، ومن 80 إلى 100 = أواخر القرن.</span>
                ) : (
                  <span> في سنوات قبل الميلاد (ق.م): العد تنازلي باتجاه الصفر؛ فمن 100 إلى 81 = أوائل القرن ق.م، ومن 80 إلى 21 = أواسط القرن ق.م، ومن 20 إلى 1 = أواخر القرن ق.م.</span>
                )}
              </p>
              <p>
                • <strong className="text-white">قاعدة الجيل الزمني (33 سنة تقريباً):</strong> يُقاس الجيل بثلث القرن؛ كل قرن يضم 3 أجيال متعاقبة.
              </p>
              <p>
                • <strong className="text-white">قاعدة العقد (10 سنوات):</strong> العقد = 10 سنوات متتالية (السنوات 1-10 العقد الأول، 11-20 العقد الثاني... وهكذا).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#D4AF37]/30 bg-[#0E2046] flex items-center justify-between">
          <span className="text-[11px] text-[#F5E6AB] font-tajawal">
            أكاديمية المنارة التعليمية | «هنذاكر التاريخ سوا» 🎯
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق الحاسبة
          </button>
        </div>
      </div>
    </div>
  );
};
