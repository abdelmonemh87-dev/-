import React, { useState } from 'react';
import { X, PlusCircle, Layers, Sparkles, Check } from 'lucide-react';
import { TrackMeta } from '../../types';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (newTrack: TrackMeta) => void;
}

export const AddTrackModal: React.FC<AddTrackModalProps> = ({
  isOpen,
  onClose,
  onAddTrack
}) => {
  const [shortTitle, setShortTitle] = useState('');
  const [title, setTitle] = useState('');
  const [targetSubject, setTargetSubject] = useState('التاريخ الوطني');
  const [academicSubtitle, setAcademicSubtitle] = useState('');
  const [curriculumBadge, setCurriculumBadge] = useState('مقرر وزاري جديد');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortTitle.trim() || !title.trim()) {
      setError('يرجى ملء اسم المسار المختصر وعنوان المقرر كاملاً.');
      return;
    }

    const cleanSubject = targetSubject.trim() || 'التاريخ';
    const trackId = `track_custom_${Date.now()}`;
    const newTrack: TrackMeta = {
      id: trackId,
      shortTitle: shortTitle.trim(),
      title: title.trim(),
      targetSubject: cleanSubject,
      academicSubtitle: academicSubtitle.trim() || `${cleanSubject} — مقرر معتمد جديد`,
      curriculumBadge: curriculumBadge.trim() || 'مقرر دراسي معتمد',
      description: description.trim() || `المحتوى الأكاديمي والوثائقي المعتمد لمقرر ${title.trim()} وفق نواتج التعلم الوزارية.`
    };

    onAddTrack(newTrack);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  const handleFillPreset = (presetType: 't2_sem2' | 'geo' | 'civics') => {
    if (presetType === 't2_sem2') {
      setShortTitle('2 ث - ترم 2');
      setTitle('التاريخ الوطني (الفصل الدراسي الثاني)');
      setTargetSubject('التاريخ الوطني');
      setAcademicSubtitle('التاريخ الوطني — الصف الثاني الثانوي — الفصل الدراسي الثاني');
      setCurriculumBadge('الوحدتان الثالثة والرابعة');
      setDescription('استكمال دراسة التاريخ الوطني للبكالوريا المصرية: البطولات التاريخية، تطور المؤسسات الوطنية، وأعلام الفكر والدفاع عن السيادة.');
    } else if (presetType === 'geo') {
      setShortTitle('1 ث جغرافيا');
      setTitle('جغرافيا مصر والتنمية المستدامة');
      setTargetSubject('الجغرافيا');
      setAcademicSubtitle('الجغرافيا — الصف الأول الثانوي — الفصل الدراسي الأول');
      setCurriculumBadge('الموقع والتضاريس والمناخ');
      setDescription('دراسة جغرافية مصر الطبيعية والبشرية، أثر الموقع في بناء الشخصية الإقليمية، وإدارة الموارد الوطنية.');
    } else {
      setShortTitle('فلسفة ووطنية');
      setTitle('الفلسفة وقضايا العصر');
      setTargetSubject('الفلسفة والحياة');
      setAcademicSubtitle('الفلسفة والحياة — المرحلة الثانوية');
      setCurriculumBadge('التفكير الناقد والوعي المجتمعي');
      setDescription('بناء الوعي القومي والتربية الوطنية وفلسفة الأخلاق والمسؤولية المجتمعية وفق معايير التقييم الحديث.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0B1B3D] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-[#0E2046]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cairo">
                ➕ إنشاء وتفعيل مسار دراسي جديد
              </h3>
              <p className="text-xs text-slate-300">
                يرث المسار فوراً كافة مميزات المنصة: الشعار المتغير، كروت الشاشة، الراوي الصوتي، والطباعة
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 no-scrollbar">
          {/* Presets Row */}
          <div>
            <span className="text-xs text-[#F5E6AB] block mb-1.5 font-cairo font-semibold">
              نماذج مقترحة سريعة للتعبئة:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillPreset('t2_sem2')}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-slate-200 transition-colors"
              >
                + تاريخ وطني (ترم ثاني)
              </button>
              <button
                type="button"
                onClick={() => handleFillPreset('geo')}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-slate-200 transition-colors"
              >
                + جغرافيا مصر 1ث
              </button>
              <button
                type="button"
                onClick={() => handleFillPreset('civics')}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#162C5B] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-slate-200 transition-colors"
              >
                + فلسفة ووطنية
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                الاسم المختصر للمسار (يظهر في الأزرار): *
              </label>
              <input
                type="text"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="مثال: 2ث - ترم 2 أو جغرافيا"
                className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                اسم المادة المستهدفة (لتغيير الشعار): *
              </label>
              <input
                type="text"
                value={targetSubject}
                onChange={(e) => setTargetSubject(e.target.value)}
                placeholder="مثال: التاريخ الوطني، الجغرافيا، الفلسفة"
                className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <span className="text-[10px] text-amber-300 block mt-0.5">
                سيتغير الشعار تلقائياً إلى: «هنذاكر {targetSubject || '...'} سوا» 🎯
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
              العنوان الكامل للمسار أو المقرر: *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: التاريخ الوطني (البكالوريا المصرية - الفصل الدراسي الثاني)"
              className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                سطر التوصيف الأكاديمي:
              </label>
              <input
                type="text"
                value={academicSubtitle}
                onChange={(e) => setAcademicSubtitle(e.target.value)}
                placeholder="مثال: التاريخ الوطني — الصف الثاني الثانوي — الترم الثاني"
                className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
                شارة المقرر (Badge):
              </label>
              <input
                type="text"
                value={curriculumBadge}
                onChange={(e) => setCurriculumBadge(e.target.value)}
                placeholder="مثال: الوحدتان الأولى والثانية"
                className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5E6AB] mb-1 font-cairo">
              النبذة الأكاديمية للمسار:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نبذة توضيحية عن المحتوى ونواتج التعلم المستهدفة في هذا المسار..."
              rows={2}
              className="w-full bg-[#162C5B] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/50 text-xs text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>تم إنشاء المسار وتفعيله بنجاح! سيتم التحويل إليه الآن.</span>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D4AF37]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#162C5B] hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={success}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6b847] text-[#0B1B3D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-cairo"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>حفظ وتفعيل المسار فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
