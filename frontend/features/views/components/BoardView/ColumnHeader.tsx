interface ColumnHeaderProps {
  title: string;
  count: number;
  color: string;
}

/**
 * Column header with title and task count
 */
export function ColumnHeader({ title, count, color }: ColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full bg-${color}-500`} aria-hidden="true" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <span className="text-sm text-gray-500" aria-label={`${count} tasks`}>
        {count}
      </span>
    </div>
  );
}
