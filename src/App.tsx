import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { MeetingInput } from './components/MeetingInput';
import { TaskFilter } from './components/TaskFilter';
import { TaskTable } from './components/TaskTable';
import { TaskItem } from './types';
import { SAMPLE_MEETING_NOTES } from './data/sampleNotes';

export default function App() {
  const [notes, setNotes] = useState<string>(SAMPLE_MEETING_NOTES[0].content);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract tasks using Gemini API via backend /api/extract-tasks
  const handleExtractTasks = async () => {
    if (!notes.trim()) {
      setErrorMessage('회의록 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/extract-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '할 일을 추출하지 못했습니다. 잠시 후 다시 시도해주세요.');
      }

      const extracted: TaskItem[] = (data.tasks || []).map((t: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        task: t.task || '할 일 내용 없음',
        assignee: t.assignee || '미정',
        dueDate: t.dueDate || '미정',
        sourceSentence: t.sourceSentence || '',
        completed: false,
      }));

      setTasks(extracted);
      setSelectedAssignee('전체');
      setSearchQuery('');

      if (extracted.length === 0) {
        setErrorMessage('회의록에서 실행할 할 일을 찾지 못했습니다. 회의록 내용을 확인해주세요.');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage(err.message || '네트워크 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle complete for a single task
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Toggle all filtered tasks completion
  const handleToggleAllComplete = () => {
    const allFilteredAreCompleted =
      filteredTasks.length > 0 && filteredTasks.every((t) => t.completed);

    const filteredIds = new Set(filteredTasks.map((t) => t.id));

    setTasks((prev) =>
      prev.map((t) => {
        if (filteredIds.has(t.id)) {
          return { ...t, completed: !allFilteredAreCompleted };
        }
        return t;
      })
    );
  };

  // Delete a task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Manually add a task
  const handleAddTask = (newTask: Omit<TaskItem, 'id' | 'completed'>) => {
    const item: TaskItem = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
    };
    setTasks((prev) => [item, ...prev]);
  };

  // Update existing task
  const handleUpdateTask = (id: string, updatedFields: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  // Extract unique assignees for the filter bar
  const assignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignee) set.add(t.assignee);
    });

    const list = Array.from(set);
    // Sort so '전원' is first, '미정' is last, and others alphabetical
    return list.sort((a, b) => {
      if (a === '전원') return -1;
      if (b === '전원') return 1;
      if (a === '미정') return 1;
      if (b === '미정') return -1;
      return a.localeCompare(b, 'ko');
    });
  }, [tasks]);

  // Filter tasks by selected assignee and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      // Assignee filter
      if (selectedAssignee !== '전체' && item.assignee !== selectedAssignee) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTask = item.task.toLowerCase().includes(query);
        const matchesAssignee = item.assignee.toLowerCase().includes(query);
        const matchesDue = item.dueDate.toLowerCase().includes(query);
        const matchesSource = item.sourceSentence.toLowerCase().includes(query);
        return matchesTask || matchesAssignee || matchesDue || matchesSource;
      }
      return true;
    });
  }, [tasks, selectedAssignee, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Upper: Meeting Notes Input + '할 일 뽑기' button */}
        <section aria-labelledby="input-heading">
          <h2 id="input-heading" className="sr-only">
            회의록 입력
          </h2>
          <MeetingInput
            notes={notes}
            onChangeNotes={setNotes}
            onExtractTasks={handleExtractTasks}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        </section>

        {/* Lower: Filter & Task Table */}
        <section aria-labelledby="task-table-heading" className="space-y-4">
          <h2 id="task-table-heading" className="sr-only">
            할 일 표 및 담당자 필터
          </h2>

          {/* Filter Bar (Only show if tasks exist) */}
          {tasks.length > 0 && (
            <TaskFilter
              assignees={assignees}
              selectedAssignee={selectedAssignee}
              onSelectAssignee={setSelectedAssignee}
              tasks={tasks}
              searchQuery={searchQuery}
              onChangeSearchQuery={setSearchQuery}
            />
          )}

          {/* Task Table */}
          <TaskTable
            tasks={tasks}
            filteredTasks={filteredTasks}
            selectedAssignee={selectedAssignee}
            onToggleComplete={handleToggleComplete}
            onToggleAllComplete={handleToggleAllComplete}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
          />
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>회의록 할 일 추출기 · Gemini API 기반 · 주간회의 액션 아이템 정리 및 CSV 공유</p>
      </footer>
    </div>
  );
}
