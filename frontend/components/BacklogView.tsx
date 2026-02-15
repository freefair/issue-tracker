'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, BacklogCategory } from '@/types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { ConfirmDialog } from './ConfirmDialog';
import { backlogCategoryApi } from '@/lib/api';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable Category Component
function SortableCategory({
  category,
  tasks,
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
}: {
  category: BacklogCategory;
  tasks: Task[];
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
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>

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

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
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
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              No tasks in this category
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  // Note: selectedTask syncing removed - parent re-renders with updated task

  const backlogTasks = tasks
    .filter(task => task.status === TaskStatus.BACKLOG)
    .sort((a, b) => a.position - b.position);

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

  const getTasksByCategory = (categoryId: string | null) => {
    return backlogTasks.filter(task => {
      if (categoryId === null) {
        return !task.backlogCategoryId;
      }
      return task.backlogCategoryId === categoryId;
    });
  };

  const uncategorizedTasks = getTasksByCategory(null);

  const handleCreateTaskInCategory = (categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId);
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = (title: string, status: TaskStatus, description?: string) => {
    onCreateTask(title, status, description, selectedCategoryId);
    setSelectedCategoryId(undefined);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Check if dragging a category
    const isDraggingCategory = categories.some(c => c.id === active.id);

    if (isDraggingCategory) {
      // Handle category reordering
      const oldIndex = categories.findIndex(c => c.id === active.id);
      const newIndex = categories.findIndex(c => c.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedCategories = [...categories];
      const [movedCategory] = reorderedCategories.splice(oldIndex, 1);
      reorderedCategories.splice(newIndex, 0, movedCategory);

      const updatedCategories = reorderedCategories.map((cat, index) => ({
        ...cat,
        position: index,
      }));

      setCategories(updatedCategories);

      try {
        await backlogCategoryApi.update(movedCategory.id, {
          position: newIndex,
        });
      } catch (error) {
        console.error('Failed to update category position:', error);
        loadCategories();
      }
    } else {
      // Handle task movement between categories
      const draggedTask = backlogTasks.find(t => t.id === active.id);
      if (!draggedTask) return;

      // Find the task it was dropped on
      const targetTask = backlogTasks.find(t => t.id === over.id);
      if (!targetTask) return;

      // Update the dragged task to have the same category as the target task
      const newCategoryId = targetTask.backlogCategoryId || undefined;

      // Only update if category changed
      if (newCategoryId !== draggedTask.backlogCategoryId) {
        onUpdateTask(draggedTask.id, {
          backlogCategoryId: newCategoryId,
        });
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Backlog</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {backlogTasks.length} {backlogTasks.length === 1 ? 'task' : 'tasks'}
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

      {/* Categories */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map(category => {
            const categoryTasks = getTasksByCategory(category.id);
            return (
              <SortableCategory
                key={category.id}
                category={category}
                tasks={categoryTasks}
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
        </SortableContext>
      </DndContext>

      {/* Uncategorized Tasks */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Uncategorized</h3>
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
          <SortableContext
            items={uncategorizedTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {uncategorizedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  onClick={() => setSelectedTask(task)}
                  actionButton={{
                    label: 'To Todo',
                    onClick: () => onUpdateTask(task.id, { status: TaskStatus.TODO }),
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
              ))}
            </div>
          </SortableContext>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            No uncategorized tasks. Click &quot;+ Task&quot; to create one.
          </p>
        )}
      </div>

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
