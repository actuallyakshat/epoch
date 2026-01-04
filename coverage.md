# Test Coverage Report

This document lists all the test cases implemented for the Epoch TUI application.

## 1. Utilities Tests (`__tests__/utils.test.ts`)

### Date Utilities

- **formatDate**
  - Formats dates correctly with default format
  - Formats dates correctly with custom format
  - Handles different months correctly
- **formatTime**
  - Formats time in 12-hour format by default
  - Formats time in 24-hour format when requested
  - Handles midnight correctly
  - Handles noon correctly
  - Handles single-digit minutes
- **getDateString**
  - Returns date in YYYY-MM-DD format
  - Handles single-digit months and days
  - Handles double-digit months and days
- **parseDateString**
  - Parses date string correctly
  - Handles edge cases: last day of month
  - Handles edge cases: first day of year
  - Handles leap year dates
  - Sets time to midnight (00:00:00)
- **generateMonthCalendar**
  - Generates correct week structure for a month starting on Monday
  - Generates correct week structure for a month with 31 days
  - Generates correct week structure for February in leap year
  - Generates correct week structure for February in non-leap year
  - Includes dates from previous and next months to complete weeks
- **isToday**
  - Correctly identifies today's date
  - Returns false for yesterday
  - Returns false for tomorrow
  - Returns false for different month same day
- **isSameDay**
  - Returns true for same date
  - Returns false for different days
  - Returns false for different months
  - Returns false for different years

### Tree Utilities

- **findTaskById**
  - Finds task at root level
  - Finds task nested in children
  - Finds task at first level of children
  - Returns null when task not found
  - Returns null for empty task array
- **updateTaskInTree**
  - Updates task at root level
  - Updates task nested in children
  - Updates updatedAt timestamp
  - Preserves other properties when updating
  - Returns new array without modifying original
- **deleteTaskFromTree**
  - Removes task at root level
  - Removes task and its subtasks
  - Preserves siblings when deleting task
  - Handles deleting from empty array
  - Handles deleting non-existent task
- **addSubtaskToTree**
  - Adds subtask to correct parent
  - Adds subtask to nested parent
  - Preserves tree structure
  - Returns new array without modifying original
- **flattenTasks**
  - Flattens simple task list
  - Flattens nested structure correctly
  - Includes all tasks in correct order
  - Handles empty task list
  - Handles tasks with no children
- **getTaskStats**
  - Calculates total tasks correctly
  - Calculates completed tasks correctly
  - Calculates percentage correctly
  - Calculates stats for nested tasks
  - Returns zero percentage for empty task list
  - Rounds percentage correctly
  - Returns 100% when all tasks completed
  - Returns 0% when no tasks completed

### Validation Utilities

- **validateTaskTitle**
  - Accepts valid title
  - Rejects empty string
  - Rejects whitespace-only string
  - Rejects title longer than 255 characters
  - Accepts title with exactly 255 characters
  - Rejects title with tab characters only
  - Accepts title with leading/trailing whitespace
- **validateTaskTimes**
  - Passes validation when no times set
  - Passes validation with only start time in past
  - Passes validation with valid start and end times
  - Rejects start time equal to end time
  - Rejects start time after end time
  - Rejects start time in the future
  - Passes validation when end time is in future but start time is in past
  - Handles start time exactly at current time
  - Handles millisecond precision differences

## 2. Services Tests (`__tests__/services.test.ts`)

### TaskService

- **createTask**
  - Creates task with correct structure, UUID, timestamps
  - Throws error for invalid title
- **excludeRecurringInstance**
  - Excludes a recurring task instance correctly
  - Throws error if parent recurring task not found
  - Does nothing if task has no recurrence
  - Preserves other tasks in the list
- **updateTask**
  - Throws error if task not found
  - Updates task fields correctly
  - Throws error for invalid title
  - Validates time constraints
- **deleteTask**
  - Removes task from tree, returns new tree
  - Handles task not found gracefully (returns original tree)
  - Returns original tree if task not found (branch coverage)
- **addSubtask**
  - Adds subtask to correct parent
  - Throws error for invalid parent
- **changeTaskState**
  - Updates state and sets endTime for terminal states
  - Clears endTime for non-terminal states
- **startTask**
  - Sets startTime, clears endTime, resets state to todo
- **getTasksForDate**
  - Returns tasks for specific date
  - Returns empty array for date with no tasks
- **getAllTasks**
  - Flattens and returns all tasks
- **getTaskStats**
  - Returns stats for specific date

### CalendarService

- **generateMonthView**
  - Generates correct month structure
  - Includes task counts for each day
- **getNextMonth**
  - Increments month correctly
  - Wraps year when month is December
- **getPreviousMonth**
  - Decrements month correctly
  - Wraps year when month is January
- **getDayOfWeek**
  - Returns correct day index
- **getMonthName**
  - Returns correct month names

## 3. Timeline & Storage Tests (`__tests__/timeline-storage.test.ts`)

### TimelineService

- **createEvent**
  - Creates event with correct structure, UUID, timestamps
  - Handles optional previousState/newState
- **getEventsForDate**
  - Returns events for specific date
  - Returns empty array for date with no events
- **addEvent**
  - Adds event to correct date bucket
  - Creates new date bucket if needed
- **removeEventsByTaskId**
  - Removes all events for a task across all dates
  - Preserves events for other tasks
- **removeLastEventByType**
  - Removes only the last matching event
  - Handles multiple dates correctly (stops after removing last)
- **formatEventDescription**
  - Formats correctly with state changes
  - Formats correctly without state changes

### StorageService

- **load**
  - Returns default schema for non-existent file
  - Loads and hydrates dates correctly from JSON
  - Handles corrupted JSON gracefully
- **save**
  - Creates directory if needed
  - Serializes dates to ISO format correctly
  - Handles save error gracefully
- **backup**
  - Creates backup file with timestamp
  - Handles backup error gracefully
- **getStoragePath**
  - Preserves all data including nested children (save/load roundtrip)
  - Returns correct path for current platform
  - Returns correct path for Linux
  - Returns correct path for Windows
  - Returns correct path for macOS
  - Returns default path for unknown platform

## 4. Logger Tests (`__tests__/logger.test.ts`)

### Logger

- **initialization**
  - Creates log file on initialization
  - Clears existing log file if it exists
- **log**
  - Writes message to stream with timestamp
  - Writes message with data to stream
  - Does not write if stream is null
- **cleanup**
  - Ends stream and removes file
  - Handles cleanup when stream is already null
  - Does not unlink if file does not exist
