import React from 'react';
import { ClipboardList, ShieldCheck, CalendarClock, Quote, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    회의록 할 일 추출기
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Gemini AI
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  회의록에서 누군가 해야 할 일만 찾아 담당자, 기한, 원문 근거 문장으로 정리합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
              날짜 없으면 <b>'미정'</b>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              다수는 <b>'전원'</b> / 미지정 <b>'미정'</b>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              <Quote className="w-3.5 h-3.5 text-slate-500" />
              근거 문장 <b>글자 그대로</b>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
