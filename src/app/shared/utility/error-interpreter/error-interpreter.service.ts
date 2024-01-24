import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterpreterService {
  interpretError(error: Error): string | undefined {
    if (error.message.includes('UNIQUE constraint failed')) {
      return 'This name is already taken';
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return 'This item is in use and cannot be deleted';
    }

    return;
  }
}
