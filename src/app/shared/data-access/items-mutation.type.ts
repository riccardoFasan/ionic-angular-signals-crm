import { Observable } from 'rxjs';
import { ItemsPage } from '../utility';

export type ItemsMutation<T> =
  | {
      pages: ItemsPage<T>[];
      total: number;
    }
  | Observable<{
      pages: ItemsPage<T>[];
      total: number;
    }>;
