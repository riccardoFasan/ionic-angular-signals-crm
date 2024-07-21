import { InjectionToken } from '@angular/core';
import { StoreHandler } from './store-handler.interface';

export const STORE_HANDLER = new InjectionToken<
  StoreHandler<any, any, Record<string, never>, Record<string, never>>
>('StoreHandler');
