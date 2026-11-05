import React from 'react';
import { X, Lightbulb, Compass, Mic, MapPin, Database, Award } from 'lucide-react';

interface IdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IdeasModal: React.FC<IdeasModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const ideas = [
    {
      icon: <Mic className="w-5 h-5 text-[#D4AF37]" />,
      title: 'محاكي الإلقاء الصوتي الراديواتي المتقدم',
      desc: 'إدماج أصوات عربية وثائقية متعددة الطبقات (جهوري، حماسي، هادئ) مع فواصل صوتية موسيقية تعزف الربابة التراثية في بودكاست حواديت منسية.'
    },
    {
      icon: <MapPin className="w-5 h-5 text-emerald-400" />,
      title: 'أطلس الخرائط التفاعلية لنواتج التعلم',
      desc: 'خريطة تفاعلية لمعارك تحتمس الثالث، ومسار الفينيقيين في البحر المتوسط، وامتداد إمبراطورية محمد علي لتجسيد مفاهيم المجال الحيوي بصرياً.'
    },
    {
      icon: <Database className="w-5 h-5 text-sky-400" />,
      title: 'الربط المباشر مع أسئلة امتحانات الثانوية العامة السابقة',
      desc: 'تصنيف كل فكرة ودرس وفق ورقات امتحانات 2021 إلى 2026 مع بيان نسبة تكرار الفكرة ونسبة الطلاب الذين اختاروا المشتتات الخاطئة.'
    },
    {
      icon: <Award className="w-5 h-5 text-amber-300" />,
      title: 'شهادات الإتقان الأكاديمي الرقمية للطلاب',
      desc: 'إصدار كارت إنجاز معتمد ومختوم إلكترونياً باسم الطالب عند إتمام التقييمات بنسبة تتجاوز 85% لنواتج التعلم المركبة.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0B1B3D] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#0E2046]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cairo">
                أفكار ومقترحات التطوير المستقبلي
              </h3>
              <p className="text-xs text-slate-300">
                خارطة الطريق الأكاديمية والتقنية لتطوير منصة «أكاديمية المنارة التعليمية»
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="bg-[#162C5B]/80 hover:bg-[#162C5B] p-4 rounded-xl border border-[#D4AF37]/25 transition-all flex items-start gap-3.5"
              >
                <div className="p-2.5 rounded-lg bg-[#0B1B3D] border border-slate-700 shrink-0">
                  {idea.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-cairo mb-1">
                    {idea.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-tajawal">
                    {idea.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#0B4F3C]/40 border border-[#0B4F3C] text-xs text-emerald-200 leading-relaxed font-tajawal">
            💡 <strong>رؤية المنارة:</strong> الجمع بين وقار السرد التاريخي الوثائقي ودقة القياس والتقويم في أحدث مواصفات الثانوية العامة والبكالوريا المصرية.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D4AF37]/30 bg-[#0E2046] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
