# Epoch - TUI Task Logger & Time Tracker

**Tech Stack**: TypeScript + React + Ink v5.0.1

## Overview

Epoch is a terminal-based todo application with:

- **Calendar view** for date selection and task count visualization
- **Tasks pane** with infinite nested subtasks and 4 task states
- **Timeline pane** that logs all task activities with timestamps
- **Extensible theme system** (dark/light built-in)
- **JSON-based persistence** in user's config directory

## Architecture

### Three-Pane Layout

```
┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Calendar   │  │      Tasks       │  │    Timeline      │
│             │  │                  │  │                  │
│ (navigable) │  │ (add/edit/check) │  │ (activity log)   │
│             │  │                  │  │                  │
└─────────────┘  └──────────────────┘  └──────────────────┘
```

### Core Components

**Contexts** (Global State):

- `ThemeContext`: Current theme + switching
- `StorageContext`: File I/O with auto-save (500ms debounce)
- `AppContext`: Selected date, tasks, timeline, UI state

**Services** (Business Logic):

- `taskService`: CRUD, tree manipulation, state transitions
- `timelineService`: Event creation, formatting
- `calendarService`: Month generation, navigation
- `storageService`: JSON file persistence

**Components** (UI):

- `CalendarPane`: Month grid with navigation
- `TasksPane`: Recursive task list with keyboard nav
- `TimelinePane`: Activity log
- `HelpDialog`: Keyboard shortcuts reference

## Data Models

### Task

```typescript
{
  id: string;                    // UUID
  title: string;
  state: 'todo' | 'completed' | 'delegated' | 'delayed';
  createdAt: Date;
  updatedAt: Date;
  startTime?: Date;              // When task started
  endTime?: Date;                // When task completed/delegated/delayed
  children: Task[];              // Infinite nesting support
  parentId?: string;
  date: string;                  // YYYY-MM-DD
}
```

### Timeline Event

```typescript
{
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'created' | 'started' | 'completed' | 'delegated' | 'delayed' | 'updated';
  timestamp: Date;
  previousState?: TaskState;
  newState?: TaskState;
}
```

### Storage

File: `~/Library/Application Support/epoch/data.json` (macOS)

- Version: "1.0.0"
- tasks: { [date]: Task[] }
- timeline: { [date]: TimelineEvent[] }
- settings: { theme, timeFormat, etc. }

## Key Files

### Types (`src/types/`)

- `task.ts`: Task, TaskState, TaskTree
- `timeline.ts`: TimelineEvent, TimelineEventType
- `calendar.ts`: CalendarView, CalendarDay
- `theme.ts`: Theme, ColorScheme
- `storage.ts`: StorageSchema, UserSettings

### Services (`src/services/`)

- `taskService.ts`: Task operations (create, update, delete, state changes)
- `timelineService.ts`: Event management
- `calendarService.ts`: Calendar calculations
- `storage.ts`: File I/O and persistence

### Contexts (`src/contexts/`)

- `ThemeContext.tsx`: Theme provider
- `StorageContext.tsx`: Auto-save storage with debouncing
- `AppContext.tsx`: Global app state

### Components (`src/components/`)

- `calendar/CalendarPane.tsx`: Calendar with month navigation
- `tasks/TasksPane.tsx`: Main task management
- `tasks/TaskList.tsx`: **Recursive** component for infinite nesting
- `timeline/TimelinePane.tsx`: Activity log viewer
- `common/HelpDialog.tsx`: Keyboard shortcuts

### Utilities (`src/utils/`)

- `date.ts`: Date formatting, month generation
- `tree.ts`: Tree traversal, task lookup
- `validation.ts`: Time constraints, title validation

## Keyboard Shortcuts

### Global

- `q`: Quit application
- `?`: Toggle help dialog
- `1/2/3`: Switch panes
- `Tab`/`Shift+Tab`: Cycle panes

### Calendar Pane

- `j/k` or `↓/↑`: Navigate weeks
- `h/l` or `←/→`: Navigate days
- `n`: Next month
- `p`: Previous month
- `Enter`: Select date

### Tasks Pane

- `j/k` or `↓/↑`: Navigate tasks
- `Space`: Toggle completion
- `a`: Add task
- `e`: Edit task
- `d`: Delete task
- `s`: Start task (set start time)
- `D`: Mark delegated
- `x`: Mark delayed/cancelled
- `Tab`: Indent (make subtask)
- `Shift+Tab`: Unindent
- `Enter`: Expand/collapse

### Timeline Pane

- `j/k` or `↓/↑`: Scroll timeline
- `t`: Toggle theme (dark ↔ light)

## Running the App

```bash
pnpm dev       # Development mode (hot reload with tsx)
pnpm build     # Compile TypeScript to dist/
pnpm start     # Run compiled version
```

## Extension Points

### Adding a New Theme

1. Create `src/themes/mytheme.ts` with ColorScheme
2. Import and register in `src/themes/index.ts`
3. Theme available in UI via `t` key toggle

### Adding Task State

1. Add to TaskState type in `src/types/task.ts`
2. Add colors to ColorScheme in themes
3. Update stateIcons/stateColors in `TaskItem.tsx`
4. Update timelineService event types

### Adding Keyboard Shortcut

1. Modify `useKeyboardNav.ts` for global shortcuts
2. Add pane-specific shortcuts in respective Pane components
3. Update `HelpDialog.tsx` shortcuts reference

## Themes

### Dark Theme (Default)

- Background: #1e1e1e (VS Code dark)
- Calendar selected: #c586c0 (purple)
- Task completed: #4ec9b0 (teal)
- Task delegated: #dcdcaa (yellow)
- Task delayed: #f48771 (red)

### Light Theme

- Background: #ffffff
- Calendar selected: #9933cc (purple)
- Task completed: #00aa77 (green)
- Task delegated: #ff9900 (orange)
- Task delayed: #cc3333 (red)

## Design Decisions

- **Ink vs Other TUIs**: React component model, familiar to React developers
- **JSON vs Database**: Simple, portable, human-readable, single-file
- **Context vs Redux**: Simpler for app this size, no boilerplate
- **date-fns**: Smaller than moment.js, functional API
- **Recursive TaskList**: Elegant infinite nesting, React's strength
- **Auto-save with debounce**: Prevents excessive I/O while keeping data current
- **Time validation**: start_time must be < end_time, prevents invalid states

## Data Persistence

- **Auto-save**: 500ms debounce after any state change
- **Graceful exit**: Saves on process termination
- **Error handling**: Creates default schema if file corrupted or missing
- **Backup**: Manual backup functionality (not yet exposed in UI)

## Testing Checklist

- [ ] Calendar: Navigate months (n/p), select dates (Enter)
- [ ] Tasks: Add (a), complete (Space), delete (d)
- [ ] Nesting: Create subtasks (Tab), expand/collapse (Enter)
- [ ] Timeline: Auto-updates on task state changes
- [ ] Themes: Dark/light switch (t), colors apply correctly
- [ ] Persistence: Data survives app restart
- [ ] Help: All shortcuts documented and work as described

## Future Enhancements

- Task editing (e key not yet functional)
- Search and filter tasks
- Recurring tasks
- Task priorities and categories
- Subtask indentation improvements
- Time estimate vs actual tracking
- Export to Markdown/CSV
- Cloud sync
- Custom user themes
