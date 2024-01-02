import { EffectType } from './effect-type.enum';

export type Effect<T> = {
  effect: EffectType | string;
  item?: T | Omit<T, 'id'>;
};
