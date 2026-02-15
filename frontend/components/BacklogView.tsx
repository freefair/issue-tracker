'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import type { PropsWithChildren } from 'react';
import { Task, TaskStatus, BacklogCategory } from '@/types';
import { TaskCardView } from './TaskCardView';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { ConfirmDialog } from './ConfirmDialog';
import { backlogCategoryApi } from '@/lib/api';
import { CollisionPriority } from '@dnd-kit/abstract';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';
import { defaultPreset, PointerSensor, KeyboardSensor } from '@dnd-kit/dom';
import type { DragDropEventHandlers } from '@dnd-kit/react';

interface BacklogViewProps {
  boardId: string;
  tasks: Task[];
  onCreateTask: (
    title: string,
    status: TaskStatus,
    description?: string,
    categoryId?: string
  ) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const sensors = [PointerSensor, KeyboardSensor];

interface SortableTaskProps {
  task: Task;
  categoryId: string | null;
  index: number;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

const SortableTask = memo(function SortableTask({
  task,
  categoryId,
  index,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete: _onTaskDelete,
}: PropsWithChildren<SortableTaskProps>) {
  const DRAGGING_OPACITY = 0.5;
  const group = categoryId || 'uncategorized';
  const { ref, isDragging } = useSortable({
    id: task.id,
    group,
    accept: 'task',
    type: 'task',
    feedback: 'clone',
    index,
    data: { group, type: 'task' },
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div ref={ref as any} style={{ opacity: isDragging ? DRAGGING_OPACITY : 1 }}>
      <TaskCardView
        task={task}
        isDragging={isDragging}
        onClick={() => onTaskClick(task)}
        actionButton={{
          label: 'To Todo',
          onClick: () => onTaskUpdate(task.id, { status: TaskStatus.TODO }),
          icon: (
            <svg
              className="w-3 h-3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          ),
        }}
      />
    </div>
  );
});

interface SortableCategoryProps {
  category: BacklogCategory;
  tasks: Task[];
  index: number;
  editingCategoryId: string | null;
  editingCategoryName: string;
  onEditStart: (id: string, name: string) => void;
  onEditChange: (name: string) => void;
  onEditEnd: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateTask: (categoryId: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

const SortableCategory = memo(function SortableCategory({
  category,
  tasks,
  index,
  editingCategoryId,
  editingCategoryName,
  onEditStart,
  onEditChange,
  onEditEnd,
  onDelete,
  onCreateTask,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}: PropsWithChildren<SortableCategoryProps>) {
  const DRAGGING_OPACITY = 0.5;
  const { handleRef, isDragging, ref } = useSortable({
    id: category.id,
    accept: ['category', 'task'],
    collisionPriority: CollisionPriority.Low,
    type: 'category',
    index,
    data: { type: 'category' },
  });

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700 mb-4"
      style={{ opacity: isDragging ? DRAGGING_OPACITY : 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Drag Handle */}
          <button
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={handleRef as any}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {editingCategoryId === category.id ? (
            <input
              type="text"
              value={editingCategoryName}
              onChange={e => onEditChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onEditEnd(category.id);
                if (e.key === 'Escape') {
                  onEditChange(category.name);
                  onEditEnd(category.id);
                }
              }}
              onBlur={() => onEditEnd(category.id)}
              className="flex-1 text-lg font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none border-b-2 border-purple-500"
            />
          ) : (
            <h3 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <button
            onClick={() => onEditStart(category.id, category.name)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Rename category"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete category"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => onCreateTask(category.id)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            + Task
          </button>
        </div>
      </div>

      <div id={category.id} className="space-y-3">
        {tasks.map((task, taskIndex) => (
          <SortableTask
            key={task.id}
            task={task}
            categoryId={category.id}
            index={taskIndex}
            onTaskClick={onTaskClick}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No tasks in this category
          </div>
        )}
      </div>
    </div>
  );
});

export function BacklogView({
  boardId,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: BacklogViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<BacklogCategory[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Organize tasks by category (including uncategorized)
  const [tasksByCategory, setTasksByCategory] = useState<Record<string, Task[]>>({});
  const snapshot = useRef<Record<string, Task[]>>({});

  // Load categories function
  const loadCategories = useCallback(async () => {
    try {
      const cats = await backlogCategoryApi.getAll(boardId);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [boardId]);

  // Load categories on mount and when boardId changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, [loadCategories]);

  // Organize tasks by category whenever tasks or categories change
  useEffect(() => {
    const backlogTasks = tasks
      .filter(task => task.status === TaskStatus.BACKLOG)
      .sort((a, b) => a.position - b.position);

    const organized: Record<string, Task[]> = { uncategorized: [] };

    // Initialize all categories
    categories.forEach(cat => {
      organized[cat.id] = [];
    });

    // Distribute tasks
    backlogTasks.forEach(task => {
      const categoryId = task.backlogCategoryId || 'uncategorized';
      if (!organized[categoryId]) {
        organized[categoryId] = [];
      }
      organized[categoryId].push(task);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasksByCategory(organized);
  }, [tasks, categories]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await backlogCategoryApi.create(boardId, {
        name: newCategoryName.trim(),
        position: categories.length,
      });
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsCreatingCategory(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleRenameCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) return;

    try {
      const updated = await backlogCategoryApi.update(categoryId, {
        name: editingCategoryName.trim(),
      });
      setCategories(categories.map(c => (c.id === categoryId ? updated : c)));
      setEditingCategoryId(null);
      setEditingCategoryName('');
    } catch (error) {
      console.error('Failed to rename category:', error);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setDeleteCategoryId(categoryId);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    try {
      await backlogCategoryApi.delete(deleteCategoryId);
      setCategories(categories.filter(c => c.id !== deleteCategoryId));
      setDeleteCategoryId(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setDeleteCategoryId(null);
    }
  };

  const handleCreateTaskInCategory = (categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId);
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = (title: string, status: TaskStatus, description?: string) => {
    onCreateTask(title, status, description, selectedCategoryId);
    setSelectedCategoryId(undefined);
  };

  const uncategorizedTasks = tasksByCategory['uncategorized'] || [];
  const totalTasks = Object.values(tasksByCategory).reduce((sum, tasks) => sum + tasks.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Backlog</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
          </p>
        </div>
        <button
          onClick={() => setIsCreatingCategory(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Create Category Form */}
      {isCreatingCategory && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateCategory();
              if (e.key === 'Escape') {
                setIsCreatingCategory(false);
                setNewCategoryName('');
              }
            }}
            placeholder="Category name (e.g., Critical, Nice to have)"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCreateCategory}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreatingCategory(false);
                setNewCategoryName('');
              }}
              className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Provider with new API */}
      <DragDropProvider
        plugins={defaultPreset.plugins}
        sensors={sensors}
        onDragStart={useCallback<DragDropEventHandlers['onDragStart']>(() => {
          snapshot.current = JSON.parse(JSON.stringify(tasksByCategory));
        }, [tasksByCategory])}
        onDragOver={useCallback<DragDropEventHandlers['onDragOver']>(event => {
          const { source } = event.operation;

          // Don't handle category reordering here (categories have their own logic)
          if (source && source.type === 'category') {
            return;
          }

          // Handle task movement
          setTasksByCategory(current => move(current, event));
        }, [])}
        onDragEnd={useCallback<DragDropEventHandlers['onDragEnd']>(
          async event => {
            if (event.canceled) {
              setTasksByCategory(snapshot.current);
              return;
            }

            // After successful drag, update backend
            const { source, target } = event.operation;

            // Handle category reordering
            if (source && target && source.type === 'category') {
              const sourceCategoryId = String(source.id);
              const targetCategoryId = String(target.id);

              if (sourceCategoryId === targetCategoryId) return;

              // Find current positions
              const sourceIndex = categories.findIndex(c => c.id === sourceCategoryId);
              const targetIndex = categories.findIndex(c => c.id === targetCategoryId);

              if (sourceIndex === -1 || targetIndex === -1) return;

              // Reorder categories
              const reordered = [...categories];
              const [movedCategory] = reordered.splice(sourceIndex, 1);
              reordered.splice(targetIndex, 0, movedCategory);

              // Update local state immediately
              setCategories(reordered);

              // Update positions in backend
              (async () => {
                try {
                  for (let i = 0; i < reordered.length; i++) {
                    const category = reordered[i];
                    if (category.position !== i) {
                      await backlogCategoryApi.update(category.id, { position: i });
                    }
                  }
                } catch (error) {
                  console.error('Failed to update category positions:', error);
                  // Reload categories on error
                  loadCategories();
                }
              })();

              return;
            }

            // Handle task reordering
            if (source && target && source.type === 'task') {
              // Get source and target groups from the drag data
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sourceGroup = (source.data as any)?.group;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const targetGroup = (target.data as any)?.group || String(target.id);

              // Find the dragged task
              const allTasks = Object.values(tasksByCategory).flat();
              const movedTask = allTasks.find(t => t.id === source.id);
              if (!movedTask) return;

              // Determine target category ID (undefined for uncategorized)
              const targetCategoryId = targetGroup === 'uncategorized' ? undefined : targetGroup;

              // Check if category changed
              const categoryChanged = sourceGroup !== targetGroup;

              // Get tasks in source and target categories from CURRENT state
              const tasksInSourceCategory = tasksByCategory[sourceGroup] || [];
              const tasksInTargetCategory = tasksByCategory[targetGroup] || [];

              // Find insert index
              const targetTask = allTasks.find(t => t.id === target.id);
              let insertIndex: number;
              if (targetTask) {
                // Dropped on a task - insert before it
                insertIndex = tasksInTargetCategory.findIndex(t => t.id === targetTask.id);
              } else {
                // Dropped on category container - append at end
                insertIndex = tasksInTargetCategory.length;
              }

              // Build update list
              const updates: Array<{ id: string; updates: Partial<Task> }> = [];

              if (categoryChanged) {
                // Moving between categories
                // 1. Reindex source category (without moved task)
                tasksInSourceCategory
                  .filter(t => t.id !== movedTask.id)
                  .forEach((task, index) => {
                    updates.push({
                      id: task.id,
                      updates: { position: index },
                    });
                  });

                // 2. Insert moved task into target category and reindex all
                const targetWithInserted = [...tasksInTargetCategory];
                targetWithInserted.splice(insertIndex, 0, movedTask);

                targetWithInserted.forEach((task, index) => {
                  if (task.id === movedTask.id) {
                    // Update BOTH position AND category for moved task
                    updates.push({
                      id: task.id,
                      updates: {
                        position: index,
                        backlogCategoryId: targetCategoryId,
                      },
                    });
                  } else {
                    // Update position for other tasks
                    updates.push({
                      id: task.id,
                      updates: { position: index },
                    });
                  }
                });
              } else {
                // Moving within same category
                const currentIndex = tasksInTargetCategory.findIndex(t => t.id === movedTask.id);
                if (currentIndex === -1) return;

                if (currentIndex === insertIndex) return; // No change

                // Reorder and reindex
                const reordered = [...tasksInTargetCategory];
                const [removed] = reordered.splice(currentIndex, 1);
                reordered.splice(insertIndex, 0, removed);

                reordered.forEach((task, index) => {
                  updates.push({
                    id: task.id,
                    updates: { position: index },
                  });
                });
              }

              // Execute backend updates
              // No optimistic UI update here - let parent's optimistic update handle it
              console.log('Backlog drag end - updates to send:', updates);
              (async () => {
                try {
                  for (const { id, updates: taskUpdates } of updates) {
                    console.log('Updating task:', id, taskUpdates);
                    await onUpdateTask(id, taskUpdates);
                  }
                  console.log('All updates completed');
                } catch (error) {
                  console.error('Failed to update task positions:', error);
                }
              })();
            }
          },
          [tasksByCategory, onUpdateTask, categories, loadCategories]
        )}
      >
        <div className="space-y-4">
          {categories.map((category, index) => {
            const categoryTasks = tasksByCategory[category.id] || [];
            return (
              <SortableCategory
                key={category.id}
                category={category}
                tasks={categoryTasks}
                index={index}
                editingCategoryId={editingCategoryId}
                editingCategoryName={editingCategoryName}
                onEditStart={(id, name) => {
                  setEditingCategoryId(id);
                  setEditingCategoryName(name);
                }}
                onEditChange={setEditingCategoryName}
                onEditEnd={handleRenameCategory}
                onDelete={handleDeleteCategory}
                onCreateTask={handleCreateTaskInCategory}
                onTaskClick={setSelectedTask}
                onTaskUpdate={onUpdateTask}
                onTaskDelete={onDeleteTask}
              />
            );
          })}

          {/* Uncategorized Tasks */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Uncategorized
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {uncategorizedTasks.length} {uncategorizedTasks.length === 1 ? 'task' : 'tasks'}
                </span>
                <button
                  onClick={() => handleCreateTaskInCategory(undefined)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  + Task
                </button>
              </div>
            </div>
            {uncategorizedTasks.length > 0 ? (
              <div id="uncategorized" className="space-y-3">
                {uncategorizedTasks.map((task, taskIndex) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    categoryId={null}
                    index={taskIndex}
                    onTaskClick={setSelectedTask}
                    onTaskUpdate={onUpdateTask}
                    onTaskDelete={onDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                No uncategorized tasks. Click &quot;+ Task&quot; to create one.
              </p>
            )}
          </div>
        </div>
      </DragDropProvider>

      {/* Empty State */}
      {categories.length === 0 && uncategorizedTasks.length === 0 && (
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-12 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">No categories or tasks in backlog</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Create a category to get started
          </p>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedCategoryId(undefined);
        }}
        onCreate={handleCreateTask}
        defaultStatus={TaskStatus.BACKLOG}
      />

      <ConfirmDialog
        isOpen={deleteCategoryId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? Tasks in this category will not be deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDangerous={true}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteCategoryId(null)}
      />
    </div>
  );
}
