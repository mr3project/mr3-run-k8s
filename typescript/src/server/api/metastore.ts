// TODO: enableSsl is not supported for ORACLE

export interface T {
  kind: "external" | "internal";
  // for external
  host: string;           // use hostname (not IP address) if enableSslInternal == true
  port: number;
  // for internal
  dbType: "MYSQL" | "POSTGRES" | "MSSQL" | "ORACLE" | "DERBY";    // hive.metastore.db.type
  databaseHost?: string;        // not used for DERBY
  databasePortRaw?: string;     // to be interpreted as number
  databaseName: string;
  userName: string;             // javax.jdo.option.ConnectionUserName
  password: string;             // javax.jdo.option.ConnectionPassword (can be set to "_")
  initSchema: boolean;
  resources: {
    cpu: number; 
    memoryInMb: number;
  };
  enableMetastoreDatabaseSsl: boolean;
  //
  // set in validate()
  //
  databasePort?: number;        // optional for all, not used for DERBY
  connectionUrl?: string;
  connectionUserName?: string;
  connectionPassword?: string;
  connectionDriver?: string;
  args?: string[];
  //
  // only for validate()
  //
}
