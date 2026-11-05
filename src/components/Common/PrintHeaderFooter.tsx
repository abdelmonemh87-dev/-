import React from 'react';
import { TrackId } from '../../types';
import { TRACKS } from '../../data/historyData';

interface PrintHeaderFooterProps {
  currentTrack: TrackId;
  documentTitle?: string;
  documentSubtext?: string;
}

export const LighthouseSeal: React.FC<{ size?: number }> = ({ size = 56 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-2xl p-0.5 bg-gradient-to-tr from-[#D4AF37] to-[#0B4F3C] flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
    >
      <img
        src="/icon.svg"
        alt="تاريخ المنارة"
        className="w-full h-full rounded-[12px] object-cover"
      />
    </div>
  );
};

const getTrackMetaSafe = (tId: TrackId) => {
  if (TRACKS[tId]) return TRACKS[tId];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('manara_custom_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[tId]) return parsed[tId];
      }
    } catch {}
  }
  return TRACKS['track1'];
};

export const PrintFirstPageHeader: React.FC<PrintHeaderFooterProps> = ({
  currentTrack,
  documentTitle,
  documentSubtext
}) => {
  const meta = getTrackMetaSafe(currentTrack);

  return (
    <div className="print-first-page-header">
      <div className="flex items-center gap-3.5">
        <LighthouseSeal size={56} />
        <div>
          {/* Line 1: Strict institutional name */}
          <h1 className="text-lg font-black text-[#0B1B3D] font-cairo tracking-wide">
            أكاديمية المنارة التعليمية
          </h1>
          {/* Line 2: Product Name — Grade — Semester */}
          <p className="text-xs font-bold text-[#92400E] font-tajawal mt-0.5">
            المنارة في {meta.targetSubject} — {meta.shortTitle} — {meta.academicSubtitle.includes('الأول') ? 'الفصل الدراسي الأول' : meta.academicSubtitle.includes('الثاني') ? 'الفصل الدراسي الثاني' : 'المقرر المعتمد'}
          </p>
          {documentTitle && (
            <p className="text-xs font-bold text-slate-800 font-cairo mt-1">
              موضوع الملزمة: {documentTitle} {documentSubtext ? `(${documentSubtext})` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="text-left text-xs font-bold text-[#0B1B3D] border-r-2 border-[#D4AF37] pr-3 font-tajawal">
        <div className="text-[#92400E] font-cairo font-black text-xs">
          «هنذاكر {meta.targetSubject} سوا» 🎯
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5 font-mono">
          ملزمة تعليمية معتمدة
        </div>
      </div>
    </div>
  );
};

export const PrintEndFooter: React.FC<{ currentTrack: TrackId }> = ({ currentTrack }) => {
  const meta = getTrackMetaSafe(currentTrack);

  return (
    <div className="print-end-footer">
      المنارة التعليمية / هنذاكر {meta.targetSubject} سوا / واتس 01097083710
    </div>
  );
};
