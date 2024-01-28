import { Observable } from 'rxjs';

export type ItemsMutation<T> =
  | {
      items: T[];
      total: number;
    }
  | Observable<{
      items: T[];
      total: number;
    }>;
