import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  CheckSquare,
  Square,
  Calendar,
  Quote,
  Trash2,
  Plus,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { TaskItem } from '../types';
import { downloadTasksAsCsv, copyTasksToClipboard } from '../utils/csvExport';

interface TaskTableProps {
  tasks: TaskItem[];
  filteredTasks: TaskItem[];
  selectedAssignee: string;
  onToggleComplete: (id: string) => void;
  onToggleAllComplete: () => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  onUpdateTask: (id: string, updatedFields: Partial<TaskItem>) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  filteredTasks,
  selectedAssignee,
  onToggleComplete,
  onToggleAllComplete,
  onDeleteTask,
  onAddTask,
  onUpdateTask,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskSource, setNewTaskSource] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const allFilteredCompleted =
    filteredTasks.length > 0 && filteredTasks.every((t) => t.completed);

  const handleDownloadCsv = () => {
    // Downloads current visible tasks or all tasks
    const tasksToExport = filteredTasks.length > 0 ? filteredTasks : tasks;
    const prefix =
      selectedAssignee !== '전체'
        ? `회의록_할일_${selectedAssignee}`
        : '회의록_할일목록';
    downloadTasksAsCsv(tasksToExport, prefix);
  };

  const handleCopyClipboard = async () => {
    const tasksToCopy = filteredTasks.length > 0 ? filteredTasks : tasks;
    const success = await copyTasksToClipboard(tasksToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      task: newTaskTitle.trim(),
      assignee: newTaskAssignee.trim() || '미정',
      dueDate: newTaskDueDate.trim() || '미정',
      sourceSentence: newTaskSource.trim() || '사용자 수동 추가',
    });

    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskDueDate('');
    setNewTaskSource('');
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar Header */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-slate-900">할 일 표</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
            {filteredTasks.length}건
            {selectedAssignee !== '전체' && ` (${selectedAssignee})`}
          </span>
        </div>

        {/* Action Buttons: CSV 내려받기, 복사, 할 일 추가 */}
        <div className="flex flex-wrap items-center gap-2">
          {filteredTasks.length > 0 && (
            <button
              type="button"
              onClick={onToggleAllComplete}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              {allFilteredCompleted ? (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                  <span>전체 미완료</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>전체 완료</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={filteredTasks.length === 0}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            title="마크다운 표 형태로 클립보드에 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>표 복사</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>할 일 직접 추가</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={tasks.length === 0}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold transition-all inline-flex items-center gap-1.5 shadow-xs shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="CSV 파일로 다운로드 (첫 줄은 열 이름)"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>CSV 내려받기</span>
          </button>
        </div>
      </div>

      {/* Manual Task Add Drawer */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateTask}
          className="p-4 bg-blue-50/70 border-b border-blue-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs"
        >
          <div className="md:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">
              할 일 내용 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="예: 2분기 예산 초안 작성"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              담당자 (다수 '전원', 없으면 '미정')
            </label>
            <input
              type="text"
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              placeholder="미정 또는 담당자명"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              기한 (없으면 '미정')
            </label>
            <input
              type="text"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              placeholder="미정 또는 기한"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block font-medium text-slate-700 mb-1">
              회의록 근거 문장
            </label>
            <input
              type="text"
              value={newTaskSource}
              onChange={(e) => setNewTaskSource(e.target.value)}
              placeholder="회의록 원문 문장 또는 출처"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-1.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              추가 완료
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="py-1.5 px-3 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* Task Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-800 border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold text-slate-600 select-none">
              <th scope="col" className="py-3 px-4 w-12 text-center">
                <span className="sr-only">완료 여부</span>
                <CheckCircle2 className="w-4 h-4 mx-auto text-slate-400" />
              </th>
              <th scope="col" className="py-3 px-4 min-w-[240px]">
                할 일
              </th>
              <th scope="col" className="py-3 px-4 min-w-[110px] w-32">
                담당자
              </th>
              <th scope="col" className="py-3 px-4 min-w-[120px] w-36">
                기한
              </th>
              <th scope="col" className="py-3 px-4 min-w-[280px]">
                회의록 근거 문장
              </th>
              <th scope="col" className="py-3 px-4 w-16 text-center">
                삭제
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-slate-400">
                    <Quote className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      {tasks.length === 0
                        ? '추출된 할 일이 없습니다'
                        : `'${selectedAssignee}' 담당자의 할 일이 없습니다`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {tasks.length === 0
                        ? "위 입력 칸에 회의록을 붙여넣고 '할 일 뽑기' 버튼을 눌러보세요."
                        : '다른 담당자를 선택하거나 검색어를 변경해보세요.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isEditing = editingId === task.id;
                const isAll = task.assignee === '전원';
                const isUnassigned = task.assignee === '미정';
                const isDueDateUndecided = task.dueDate === '미정';

                return (
                  <tr
                    key={task.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      task.completed ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* Completion Checkbox */}
                    <td className="py-3.5 px-4 text-center align-top">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-emerald-600 focus:outline-none transition-colors"
                        title={task.completed ? '완료 취소' : '할 일 완료 처리'}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Task Column */}
                    <td className="py-3.5 px-4 align-top">
                      {isEditing ? (
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) =>
                            onUpdateTask(task.id, { task: e.target.value })
                          }
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full text-sm px-2 py-1 border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingId(task.id)}
                          className={`font-medium leading-snug cursor-pointer group flex items-start justify-between gap-2 ${
                            task.completed
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900 hover:text-blue-700'
                          }`}
                          title="클릭하여 할 일 수정"
                        >
                          <span>{task.task}</span>
                        </div>
                      )}
                    </td>

                    {/* Assignee Column */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isAll
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : isUnassigned
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <Users className="w-3 h-3 opacity-70" />
                        {task.assignee}
                      </span>
                    </td>

                    {/* Due Date Column */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                          isDueDateUndecided
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold'
                        }`}
                      >
                        <Calendar className="w-3 h-3 opacity-70" />
                        {task.dueDate}
                      </span>
                    </td>

                    {/* Source Sentence Column */}
                    <td className="py-3.5 px-4 align-top text-xs text-slate-600 leading-relaxed">
                      <div className="bg-slate-50/90 border-l-2 border-slate-300 pl-2.5 py-1 rounded-r text-slate-600 italic">
                        "{task.sourceSentence}"
                      </div>
                    </td>

                    {/* Delete Action Column */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="이 할 일 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      {filteredTasks.length > 0 && (
        <div className="p-3 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            💡 할 일 텍스트를 클릭하면 직접 수정할 수 있습니다.
          </span>
          <span className="font-medium text-slate-600">
            CSV 첫 번째 줄에 열 이름(할 일, 담당자, 기한, 근거 문장, 완료 여부)이 자동 포함됩니다.
          </span>
        </div>
      )}
    </div>
  );
};
