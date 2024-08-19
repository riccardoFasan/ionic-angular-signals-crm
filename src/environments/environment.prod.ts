export const environment = {
  production: true,
  operationsConcurrency: 5,
  CapacitorSQLite: {
    androidIsEncryption: true,
  },
  database: {
    name: 'ionic-angular-signals-crm-prod-db',
    encrypted: true,
    mode: 'secret',
    version: 1,
    readonly: false,
  },
};
