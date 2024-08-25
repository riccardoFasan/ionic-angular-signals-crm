import { Observable, OperatorFunction, Subscription } from 'rxjs';

export function switchMapWithCancel<T, R>(
  project: (value: T, index: number) => Observable<R>,
  onCancel: (value: T) => void,
): OperatorFunction<T, R> {
  return (source$: Observable<T>) =>
    new Observable<R>((subscriber) => {
      let innerSubscription: Subscription | null = null;
      let index: number = 0;

      const sourceSubscription = source$.subscribe({
        next(value) {
          if (innerSubscription) {
            onCancel(value);
            innerSubscription.unsubscribe();
          }

          innerSubscription = project(value, index++).subscribe({
            next(innerValue) {
              subscriber.next(innerValue);
            },
            error(err) {
              subscriber.error(err);
            },
            complete() {
              innerSubscription = null;
              if (sourceSubscription.closed) {
                subscriber.complete();
              }
            },
          });
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          if (!innerSubscription) {
            subscriber.complete();
          }
        },
      });

      return () => {
        if (innerSubscription) {
          innerSubscription.unsubscribe();
        }
        sourceSubscription.unsubscribe();
      };
    });
}
