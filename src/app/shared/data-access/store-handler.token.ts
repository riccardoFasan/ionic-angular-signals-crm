import { InjectionToken } from '@angular/core';
import { StoreHandler } from './store-handler.interface';

export const STORE_HANDLER_TOKEN = new InjectionToken<StoreHandler<unknown>>(
  'StoreHandlerToken',
);
