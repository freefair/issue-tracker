'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { TagInput } from './TagInput';
import { ConfirmDialog } from './ConfirmDialog';
import 'highlight.js/styles/github.css';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [tags, setTags] = useState<string[]>(task.tags);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Update internal state when task ID changes (new task selected)
  // This is an intentional sync from props to state
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setTags(task.tags);
    setIsEditing(false);
  }, [task.id, task.title, task.description, task.tags]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(task.id, {
        title: title.trim(),
        description: description.trim(),
        status: task.status,
        position: task.position,
        tags: tags,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description);
    setTags(task.tags);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onDelete(task.id);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="flex-1 text-2xl font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none"
                placeholder="Task title"
              />
            ) : (
              <h2 className="flex-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="task-description-edit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description (GitHub Flavored Markdown)
                  </label>
                  <textarea
                    id="task-description-edit"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                    placeholder="Supports: **bold**, *italic*, `code`, ```language blocks```, - [ ] task lists, tables, and more..."
                    rows={10}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Supports GFM: headings, lists, tables, code blocks, task lists, links, images
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="task-tags-edit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Tags
                  </label>
                  <div id="task-tags-edit">
                    <TagInput
                      boardId={task.boardId}
                      tags={tags}
                      onChange={setTags}
                      placeholder="Add tags..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Description with Markdown */}
                {task.description ? (
                  (() => {
                    // Preprocess markdown: Convert standalone checkboxes to proper task lists
                    const processedDescription = task.description
                      .split('\n')
                      .map(line => {
                        // Match lines starting with [ ] or [x] (with optional leading whitespace)
                        if (/^\s*\[([ xX])\]\s+/.test(line)) {
                          // Add list marker if not present
                          return line.replace(/^(\s*)\[([ xX])\]/, '$1- [$2]');
                        }
                        return line;
                      })
                      .join('\n');

                    return (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none
                  prose-p:text-gray-700 dark:prose-p:text-gray-300
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-gray-700 dark:prose-li:text-gray-300
                  prose-table:border-collapse prose-table:w-full
                  prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2
                  prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-4 prose-td:py-2
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-hr:border-gray-300 dark:prose-hr:border-gray-600
                  [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:border-b [&_h1]:border-gray-200 dark:[&_h1]:border-gray-700 [&_h1]:pb-2 [&_h1]:mb-4 [&_h1]:text-gray-900 dark:[&_h1]:text-white
                  [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:border-b [&_h2]:border-gray-200 dark:[&_h2]:border-gray-700 [&_h2]:pb-2 [&_h2]:mb-3 [&_h2]:text-gray-900 dark:[&_h2]:text-white
                  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-gray-900 dark:[&_h3]:text-white
                  [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-gray-900 dark:[&_h4]:text-white
                  [&_h5]:text-base [&_h5]:font-semibold [&_h5]:mb-1 [&_h5]:text-gray-700 dark:[&_h5]:text-gray-300
                  [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:mb-1 [&_h6]:text-gray-600 dark:[&_h6]:text-gray-400"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            // Custom checkbox rendering for task lists (GitHub-style)
                            input: ({ node: _node, ...props }) => {
                              if (props.type === 'checkbox') {
                                return (
                                  <input
                                    {...props}
                                    className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                    disabled={false}
                                  />
                                );
                              }
                              return <input {...props} />;
                            },
                            // Style list items with checkboxes (remove bullets)
                            li: ({ node: _node, children, ...props }) => {
                              const hasCheckbox = children?.toString().includes('type="checkbox"');
                              if (hasCheckbox) {
                                return (
                                  <li className="list-none flex items-start" {...props}>
                                    {children}
                                  </li>
                                );
                              }
                              return <li {...props}>{children}</li>;
                            },
                          }}
                        >
                          {processedDescription}
                        </ReactMarkdown>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic">No description</p>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
                    <p>
                      Status: <span className="font-medium">{task.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
