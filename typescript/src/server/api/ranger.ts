// use discriminated union with property 'kind'
export type T = RangerInternal

export interface RangerInternal {
  kind: "internal",
  resources: {
    cpu: number; 
    memoryInMb: number;   // 1GB for Ranger, memoryInMb/2 for Solr
  };
  service: string;
  // Ranger authentication - currently we do not support "LDAP"
  dbFlavor: "MYSQL" | "ORACLE" | "POSTGRES" | "MSSQL";
  dbRootUser: string;
  dbRootPassword: string;
  dbHost: string;
  dbPassword: string;
  enableRangerDatabaseSsl: boolean;
  adminPassword: string;
  authentication: "NONE";
  //
  // set in validate()
  //
  // enableKerberos = hive.authentication === "KERBEROS"
  // do NOT remove enableKerberos which is used in ranger-resources/*
  enableKerberos?: boolean;
  adminPort?: number;
  adminUrl?: string;
  auditUrl?: string;
  connectionDriver?: string;
  // for Apache server
  httpUrl?: string;
}
