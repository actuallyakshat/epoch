import React, { useState } from "react";
import { Box } from "ink";
import { TaskItem } from "./TaskItem";
import type { Task } from "../../types/task";

interface TaskListProps {
  tasks: Task[];
  depth?: number;
  selectedId?: string;
  expandedIds?: Set<string>;
  onToggleExpand?: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  depth = 0,
  selectedId,
  expandedIds = new Set(),
  onToggleExpand,
}) => {
  return (
    <Box flexDirection="column">
      {tasks.map((task) => {
        const isSelected = task.id === selectedId;
        const isExpanded = expandedIds.has(task.id);
        const hasChildren = task.children.length > 0;

        return (
          <Box key={task.id} flexDirection="column">
            <TaskItem
              task={task}
              depth={depth}
              isSelected={isSelected}
              isExpanded={isExpanded}
            />

            {hasChildren && isExpanded && (
              <TaskList
                tasks={task.children}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};
