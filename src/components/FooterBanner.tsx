import React from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';

interface FooterBannerProps {
  subjectName?: string;
}

export const FooterBanner: React.FC<FooterBannerProps> = ({ subjectName = 'التاريخ' }) => {
  const whatsappUrl = `https://wa.me/201097083710?text=${encodeURIComponent('السلام عليكم - استفسار بخصوص منصة المنارة في ' + subjectName)}`;

  return (
    <footer className="w-full bg-[#060E21] border-t border-[#D4AF37]/30 py-4 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
        {/* The Exact Mandatory Unified Institutional Banner Line */}
        <div className="text-sm md:text-base font-bold text-[#F5E6AB] tracking-wide select-all font-cairo">
          أكاديمية المنارة التعليمية | «هنذاكر {subjectName} سوا» 🎯 | واتساب: 01097083710
        </div>

        {/* Quick Direct Actions */}
        <div className="flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B4F3C] hover:bg-[#167D60] text-emerald-100 text-xs font-bold transition-all shadow-md border border-emerald-500/40"
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>تواصل عبر واتساب</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </footer>
  );
};
