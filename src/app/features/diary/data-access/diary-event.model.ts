import { DiaryEventType } from './diary-event-type.enum';

export type DiaryEvent = {
  entityId: number;
  ref: string;
  name: string;
  type: DiaryEventType;
  createdAt: Date;
  updatedAt: Date;
  at: Date;
  end?: Date;
  color?: string;
  icon?: string;
};

export type DiaryEventKeys = { entityId: number };
