import { DiaryEventType } from './diary-event-type.enum';

export type DiaryEvent = {
  id: number;
  name: string;
  type: DiaryEventType;
  createdAt: Date;
  updatedAt: Date;
  at: Date;
  color?: string;
  icon?: string;
};
