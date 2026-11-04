import { TaskItem } from '../types';

/**
 * Escapes a field for CSV according to RFC 4180
 */
function escapeCsvField(field: string): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  if (
    stringField.includes(',') ||
    stringField.includes('"') ||
    stringField.includes('\n') ||
    stringField.includes('\r')
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

/**
 * Downloads tasks as CSV file with UTF-8 BOM so Korean displays correctly in Excel.
 * First line is column headers as requested.
 */
export function downloadTasksAsCsv(tasks: TaskItem[], filenamePrefix = '회의록_할일목록') {
  if (tasks.length === 0) return;

  const headers = ['할 일', '담당자', '기한', '회의록 근거 문장', '완료 여부'];

  const rows = tasks.map((task) => [
    task.task,
    task.assignee,
    task.dueDate,
    task.sourceSentence,
    task.completed ? '완료' : '미완료',
  ]);

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) for proper Excel Korean encoding
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `${filenamePrefix}_${dateStr}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies tasks as formatted markdown table to clipboard
 */
export async function copyTasksToClipboard(tasks: TaskItem[]): Promise<boolean> {
  if (tasks.length === 0) return false;

  const header = '| 상태 | 할 일 | 담당자 | 기한 | 회의록 근거 문장 |\n| :---: | :--- | :---: | :---: | :--- |';
  const body = tasks
    .map(
      (t) =>
        `| ${t.completed ? '[x]' : '[ ]'} | ${t.task.replace(/\|/g, '\\|')} | ${t.assignee} | ${t.dueDate} | ${t.sourceSentence.replace(/\|/g, '\\|')} |`
    )
    .join('\n');

  const markdownText = `${header}\n${body}`;

  try {
    await navigator.clipboard.writeText(markdownText);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
