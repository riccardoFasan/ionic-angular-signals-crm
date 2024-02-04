import { ResolveFn } from '@angular/router';
import { InitializerService } from './initializer.service';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { first } from 'rxjs';

export const initializationResolver: ResolveFn<boolean> = () => {
  const initializer = inject(InitializerService);
  return toObservable(initializer.initialized).pipe(
    first((initialized) => initialized),
  );
};
