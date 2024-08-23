export enum OperationType {
  Fetch = 'FETCH',
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
}

export type OperationTypeLike = OperationType | string;
