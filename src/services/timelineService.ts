import { v4 as uuid } from 'uuid';
import { getDateString } from '../utils/date';
import type { TimelineEvent, TimelineEventType } from '../types/timeline';
import type { TaskState } from '../types/task';

export class TimelineService {
  createEvent(
    taskId: string,
    taskTitle: string,
    eventType: TimelineEventType,
    timestamp: Date = new Date(),
    previousState?: TaskState,
    newState?: TaskState
  ): TimelineEvent {
    return {
      id: uuid(),
      taskId,
      taskTitle,
      type: eventType,
      timestamp,
      previousState,
      newState,
    };
  }

  getEventsForDate(timeline: { [date: string]: TimelineEvent[] }, date: string): TimelineEvent[] {
    return timeline[date] || [];
  }

  addEvent(
    timeline: { [date: string]: TimelineEvent[] },
    event: TimelineEvent
  ): { [date: string]: TimelineEvent[] } {
    const dateStr = getDateString(event.timestamp);

    return {
      ...timeline,
      [dateStr]: [...(timeline[dateStr] || []), event],
    };
  }

  // Remove all events for a specific task (used when deleting a task)
  removeEventsByTaskId(
    timeline: { [date: string]: TimelineEvent[] },
    taskId: string
  ): { [date: string]: TimelineEvent[] } {
    const result: { [date: string]: TimelineEvent[] } = {};

    for (const [date, events] of Object.entries(timeline)) {
      const filtered = events.filter(e => e.taskId !== taskId);
      if (filtered.length > 0) {
        result[date] = filtered;
      }
    }

    return result;
  }

  // Remove the last event of a specific type for a task (used for undo operations)
  removeLastEventByType(
    timeline: { [date: string]: TimelineEvent[] },
    taskId: string,
    eventType: TimelineEventType
  ): { [date: string]: TimelineEvent[] } {
    const result: { [date: string]: TimelineEvent[] } = {};
    let removed = false;

    // Process dates in reverse order to find the most recent event
    const dates = Object.keys(timeline).sort().reverse();

    for (const date of dates) {
      const events = timeline[date];
      if (!removed) {
        // Find the last matching event in this date's events
        const lastIndex = events.map((e, i) => ({ e, i }))
          .filter(({ e }) => e.taskId === taskId && e.type === eventType)
          .pop()?.i;

        if (lastIndex !== undefined) {
          const filtered = events.filter((_, i) => i !== lastIndex);
          if (filtered.length > 0) {
            result[date] = filtered;
          }
          removed = true;
        } else {
          result[date] = events;
        }
      } else {
        result[date] = events;
      }
    }

    return result;
  }

  formatEventDescription(event: TimelineEvent): string {
    const timeStr = event.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const stateInfo = event.newState
      ? ` (${event.previousState} -> ${event.newState})`
      : '';

    return `${timeStr} - ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}: ${event.taskTitle}${stateInfo}`;
  }
}

export const timelineService = new TimelineService();
