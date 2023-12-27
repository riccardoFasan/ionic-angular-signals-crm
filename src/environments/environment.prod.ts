export const environment = {
  production: true,
  CapacitorSQLite: {
    androidIsEncryption: true,
  },
  database: {
    name: 'food-diary-prod-db',
    encrypted: true,
    mode: 'encryption',
    version: 1,
    readonly: false,
  },
};
