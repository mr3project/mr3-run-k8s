export interface T {
  supersetEnabled: boolean;
  resources?: {
    cpu: number; 
    memoryInMb: number;
  };
  // for Superset interface (Cf. hive.enableSslInternal for connecting to HS2)
  enableSsl: false;     // set to false in mr3-cloud
  //
  // set in validate()
  //
  // for Apache server
  httpUrl?: string;
}
