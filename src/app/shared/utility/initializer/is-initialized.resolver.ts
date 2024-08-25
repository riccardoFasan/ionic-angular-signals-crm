import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ResolveFn } from '@angular/router';
import { first } from 'rxjs';
import { InitializerService } from './initializer.service';

export const initializationResolver: ResolveFn<boolean> = () => {
  const initializer = inject(InitializerService);
  return toObservable(initializer.initialized).pipe(
    first((initialized) => initialized),
  );
};
