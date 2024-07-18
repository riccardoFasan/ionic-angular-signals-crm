export const environment = {
  production: true,
  operationsConcurrency: 5,
  CapacitorSQLite: {
    androidIsEncryption: true,
  },
  database: {
    name: 'food-diary-prod-db',
    encrypted: true,
    mode: 'secret',
    version: 1,
    readonly: false,
  },
};
