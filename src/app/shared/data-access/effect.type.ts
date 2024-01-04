import { EffectType } from './effect-type.enum';

export type Effect = {
  type: EffectType | string;
  formData: unknown;
};
