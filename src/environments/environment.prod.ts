export const environment = {
  production: true,
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
