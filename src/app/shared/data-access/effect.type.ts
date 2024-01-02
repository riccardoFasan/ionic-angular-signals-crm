import { EffectType } from './effect-type.enum';

export type Effect<T> = {
  type: EffectType | string;
  data?: T;
};
