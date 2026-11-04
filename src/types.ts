export interface TaskItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  sourceSentence: string;
  completed: boolean;
}

export type AssigneeFilter = string; // '전체' or specific assignee name
