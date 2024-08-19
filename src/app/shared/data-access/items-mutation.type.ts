import { Observable } from 'rxjs';
import { ItemsPage } from '../utility';

export type ItemsMutation<Entity> =
  | {
      pages: ItemsPage<Entity>[];
      total: number;
    }
  | Observable<{
      pages: ItemsPage<Entity>[];
      total: number;
    }>;
