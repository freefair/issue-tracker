import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

const DRAG_ACTIVATION_DISTANCE = 8; // Prevent accidental drags

interface UseDragAndDropOptions<T> {
  items: T[];
  onReorder: (items: T[]) => void | Promise<void>;
  getId: (item: T) => string;
}

/**
 * Generic drag & drop hook using @dnd-kit
 * Reusable across tasks, categories, etc.
 */
export function useDragAndDrop<T>({ items, onReorder, getId }: UseDragAndDropOptions<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(item => getId(item) === active.id);
    const newIndex = items.findIndex(item => getId(item) === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder array
    const reordered = [...items];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed);

    await onReorder(reordered);
  };

  return {
    sensors,
    handleDragEnd,
  };
}
