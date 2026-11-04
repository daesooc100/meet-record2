import React from 'react';
import { Sparkles, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { SAMPLE_MEETING_NOTES } from '../data/sampleNotes';

interface MeetingInputProps {
  notes: string;
  onChangeNotes: (value: string) => void;
  onExtractTasks: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const MeetingInput: React.FC<MeetingInputProps> = ({
  notes,
  onChangeNotes,
  onExtractTasks,
  isLoading,
  errorMessage,
}) => {
  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_MEETING_NOTES[sampleIndex];
    if (sample) {
      onChangeNotes(sample.content);
    }
  };

  const handleClear = () => {
    onChangeNotes('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar of input */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-800">회의록 붙여넣기</h2>
          <span className="text-xs text-slate-400">
            ({notes.trim().length.toLocaleString()}자)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">예시 불러오기:</span>
          {SAMPLE_MEETING_NOTES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(idx)}
              className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 transition-colors shadow-2xs"
            >
              샘플 {idx + 1}
            </button>
          ))}
          {notes.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-2 py-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center gap-1 ml-1"
              title="회의록 지우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">비우기</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="p-4 sm:p-5">
        <label htmlFor="meeting-notes-textarea" className="sr-only">
          회의록 본문
        </label>
        <textarea
          id="meeting-notes-textarea"
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder={`여기에 주간회의, 정기회의, 스프린트 미팅 등의 회의록을 붙여넣으세요.
예:
- 김민수 님이 결제 연동 테스트베드 구성을 11월 12일까지 완료하기로 했습니다.
- 이지은 님은 UI/UX 시안 3종을 제작하여 공유하기로 했습니다.
- 팀원 전원이 보안 교육을 이번 주 목요일까지 수강해야 합니다.
- 회의실 프로젝터 케이블 구매 필요 (담당자 미지정)`}
          rows={7}
          className="w-full p-3.5 text-sm font-normal text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y leading-relaxed"
          disabled={isLoading}
        />

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">오류 안내</p>
              <p className="mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            💡 AI가 회의록에서 실제로 누군가 해야 할 일만 찾아 표로 구성합니다.
          </p>

          <button
            type="button"
            onClick={onExtractTasks}
            disabled={isLoading || notes.trim().length === 0}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all ${
              isLoading || notes.trim().length === 0
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-200'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>할 일 뽑아내는 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>할 일 뽑기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
