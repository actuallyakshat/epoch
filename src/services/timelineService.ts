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

  formatEventDescription(event: TimelineEvent): string {
    const timeStr = event.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const stateInfo = event.newState
      ? ` (${event.previousState} → ${event.newState})`
      : '';

    return `${timeStr} - ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}: ${event.taskTitle}${stateInfo}`;
  }

  getEventIcon(eventType: TimelineEventType): string {
    const icons: Record<TimelineEventType, string> = {
      created: '✨',
      started: '▶️',
      completed: '✅',
      delegated: '👤',
      delayed: '⏸️',
      updated: '✏️',
    };

    return icons[eventType] || '•';
  }
}

export const timelineService = new TimelineService();
