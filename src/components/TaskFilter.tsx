import React from 'react';
import { Users, Search, CheckCircle2 } from 'lucide-react';
import { TaskItem } from '../types';

interface TaskFilterProps {
  assignees: string[];
  selectedAssignee: string;
  onSelectAssignee: (assignee: string) => void;
  tasks: TaskItem[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
}

export const TaskFilter: React.FC<TaskFilterProps> = ({
  assignees,
  selectedAssignee,
  onSelectAssignee,
  tasks,
  searchQuery,
  onChangeSearchQuery,
}) => {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate count for each assignee
  const getAssigneeCount = (assignee: string) => {
    if (assignee === '전체') return tasks.length;
    return tasks.filter((t) => t.assignee === assignee).length;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top row: Status stats & progress bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            전체 <span className="text-blue-600 font-bold">{totalCount}</span>건
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            완료 <span className="text-emerald-600 font-bold">{completedCount}</span>건
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            남은 일 <span className="text-amber-600 font-bold">{pendingCount}</span>건
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5 min-w-[160px]">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 w-8 text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Second row: Assignee filter chips + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Assignee filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-slate-500 mr-1">
            <Users className="w-3.5 h-3.5" />
            <span>담당자:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectAssignee('전체')}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              selectedAssignee === '전체'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 ({getAssigneeCount('전체')})
          </button>

          {assignees.map((assignee) => {
            const isSelected = selectedAssignee === assignee;
            const isAll = assignee === '전원';
            const isUnassigned = assignee === '미정';

            let badgeStyle = isSelected
              ? 'bg-blue-600 text-white shadow-xs font-semibold'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

            if (isSelected) {
              badgeStyle = 'bg-blue-600 text-white shadow-xs font-semibold';
            } else if (isAll) {
              badgeStyle = 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100';
            } else if (isUnassigned) {
              badgeStyle = 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
            }

            return (
              <button
                key={assignee}
                type="button"
                onClick={() => onSelectAssignee(assignee)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${badgeStyle}`}
              >
                {assignee} ({getAssigneeCount(assignee)})
              </button>
            );
          })}
        </div>

        {/* Search within extracted tasks */}
        <div className="relative min-w-[200px] shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="할 일·근거 검색..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
