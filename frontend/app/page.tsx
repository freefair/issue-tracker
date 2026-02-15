'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Board, Task, TaskStatus } from '@/types';
import { boardApi, taskApi } from '@/lib/api';
import { BoardView } from '@/components/BoardView';
import { BacklogView } from '@/components/BacklogView';
import { ArchiveView } from '@/components/ArchiveView';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CreateBoardModal } from '@/components/CreateBoardModal';
import { EditBoardModal } from '@/components/EditBoardModal';
import { TaskModal } from '@/components/TaskModal';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const boardId = searchParams.get('board');
  const viewParam = searchParams.get('view') as 'board' | 'backlog' | 'archive' | null;

  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [view, setView] = useState<'board' | 'backlog' | 'archive'>(viewParam || 'board');
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      // If no board specified in URL, redirect to first board
      if (!boardId) {
        const defaultView = viewParam || 'board';
        router.push(`/?board=${boards[0].id}&view=${defaultView}`);
      } else {
        // Load the specified board
        const board = boards.find(b => b.id === boardId);
        if (board) {
          setCurrentBoard(board);
          loadTasks(boardId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, boards, router]);

  // Update view when URL parameter changes
  useEffect(() => {
    if (viewParam) {
      setView(viewParam);
    }
  }, [viewParam]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await boardApi.getAll();
      setBoards(data);
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

      // Extract all unique tags from tasks
      const tagsSet = new Set<string>();
      data.forEach(task => {
        task.tags.forEach(tag => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    }
  };

  const handleCreateBoard = async (name: string, description?: string) => {
    try {
      const board = await boardApi.create(name, description);
      await loadBoards();
      router.push(`/?board=${board.id}&view=board`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      console.error(err);
    }
  };

  const handleCreateTask = async (
    title: string,
    status: TaskStatus,
    description?: string,
    categoryId?: string
  ) => {
    if (!currentBoard) return;

    try {
      const maxPosition = tasks
        .filter(t => t.status === status)
        .reduce((max, t) => Math.max(max, t.position), 0);

      await taskApi.create({
        boardId: currentBoard.id,
        title,
        description,
        status,
        position: maxPosition + 1,
        backlogCategoryId: categoryId,
      });

      loadTasks(currentBoard.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!currentBoard) return;

    // Optimistic UI update - update immediately without backend reload
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      )
    );

    try {
      await taskApi.update(taskId, updates);
      // No full reload - optimistic update already applied
    } catch (err) {
      // On error, reload to revert
      setError(err instanceof Error ? err.message : 'Failed to update task');
      loadTasks(currentBoard.id);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentBoard) return;

    // Optimistic UI update - remove immediately
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    try {
      await taskApi.delete(taskId);
      // No full reload - optimistic update already applied
    } catch (err) {
      // On error, reload to revert
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      loadTasks(currentBoard.id);
    }
  };

  const handleEditBoard = async (boardId: string, name: string, description?: string) => {
    try {
      const updatedBoard = await boardApi.update(boardId, name, description);
      setBoards(boards.map(b => (b.id === boardId ? updatedBoard : b)));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(updatedBoard);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update board');
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await boardApi.delete(boardId);
      const updatedBoards = boards.filter(b => b.id !== boardId);
      setBoards(updatedBoards);

      // If we deleted the current board, redirect to another board or home
      if (boardId === currentBoard?.id) {
        if (updatedBoards.length > 0) {
          router.push(`/?board=${updatedBoards[0].id}&view=${view}`);
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
    }
  };

  const handleViewChange = (newView: 'board' | 'backlog' | 'archive') => {
    if (currentBoard) {
      router.push(`/?board=${currentBoard.id}&view=${newView}`);
    }
    setView(newView);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Issue Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No boards found. Create one to get started!
            </p>
            <button
              onClick={() => setIsCreateBoardModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Your First Board
            </button>
          </div>
        </div>

        <CreateBoardModal
          isOpen={isCreateBoardModalOpen}
          onClose={() => setIsCreateBoardModalOpen(false)}
          onCreate={handleCreateBoard}
        />
      </>
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        boards={boards}
        currentBoardId={boardId || undefined}
        currentView={view}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onCreateBoard={() => setIsCreateBoardModalOpen(true)}
        onEditBoard={setBoardToEdit}
        onDeleteBoard={handleDeleteBoard}
      />
      <main className={`flex-1 transition-all duration-200 ${isSidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
        <Header
          board={currentBoard}
          boards={boards}
          allTags={allTags}
          view={view}
          onViewChange={handleViewChange}
          onTaskSelect={setSelectedTask}
        />
        {currentBoard && view === 'board' && (
          <BoardView
            board={currentBoard}
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {currentBoard && view === 'backlog' && (
          <BacklogView
            boardId={currentBoard.id}
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {currentBoard && view === 'archive' && (
          <ArchiveView
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onCreate={handleCreateBoard}
      />

      <EditBoardModal
        board={boardToEdit}
        isOpen={!!boardToEdit}
        onClose={() => setBoardToEdit(null)}
        onUpdate={handleEditBoard}
      />

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
