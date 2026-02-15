'use client';

import { useEffect, useState } from 'react';
import { Board, Task, TaskStatus } from '@/types';
import { boardApi, taskApi } from '@/lib/api';
import { BoardView } from '@/components/BoardView';
import { Header } from '@/components/Header';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      loadTasks(selectedBoard.id);
    }
  }, [selectedBoard]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await boardApi.getAll();
      setBoards(data);
      if (data.length > 0 && !selectedBoard) {
        setSelectedBoard(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (boardId: string) => {
    try {
      const data = await taskApi.getAll(boardId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    }
  };

  const handleCreateTask = async (title: string, status: TaskStatus) => {
    if (!selectedBoard) return;

    try {
      const maxPosition = tasks
        .filter((t) => t.status === status)
        .reduce((max, t) => Math.max(max, t.position), 0);

      await taskApi.create({
        boardId: selectedBoard.id,
        title,
        status,
        position: maxPosition + 1,
      });

      loadTasks(selectedBoard.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskApi.update(taskId, updates);
      loadTasks(selectedBoard!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.delete(taskId);
      loadTasks(selectedBoard!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        boards={boards}
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        onCreateBoard={async (name, description) => {
          await boardApi.create(name, description);
          loadBoards();
        }}
      />
      {selectedBoard && (
        <BoardView
          board={selectedBoard}
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
}
