export interface T {
  //
  // basics.T
  //
  warehouseDir: string;
  persistentVolumeClaimStorageInGb: number;
  // externalIp is not included because basics.externalIp is set later if necessary
  // externalIp: string;
  externalIpHostname: string;
  // externalIp for LoadBalancer for HiveServer2
  hiveserver2Ip: string;
  hiveserver2IpHostname: string;
  kerberos?: {
    realm: string;
    adminServer: string;
    kdc: string;
  }

  //
  // hive.T
  //
  authentication: "NONE" | "LDAP" | "KERBEROS";
  ldap?: {
    baseDN: string;     // hive.server2.authentication.ldap.baseDN
    url: string;        // hive.server2.authentication.ldap.url
  };
  enableSsl: boolean;   // for connecting to public HiveServer2

  //
  // metastore.T
  //
  dbType: "MYSQL" | "POSTGRES" | "MSSQL" | "ORACLE" | "DERBY";    // hive.metastore.db.type
  // dbType: "MYSQL" | "POSTGRES" | "MSSQL" | "ORACLE" | "DERBY";    // hive.metastore.db.type
  databaseHost?: string;        // not used for DERBY
  databasePortRaw?: string;     // to be interpreted as number
  databaseName: string;
  userName: string;             // javax.jdo.option.ConnectionUserName
  password: string;             // javax.jdo.option.ConnectionPassword (can be set to "_")
  initSchema: boolean;
  enableMetastoreDatabaseSsl: boolean;

  //
  // master.T, sparkmr3.T
  //
  scaleOutThreshold?: number;                 // mr3.auto.scale.out.threshold.percent
  scaleInThreshold?: number;                  // mr3.auto.scale.in.threshold.percent
  scaleOutInitialContainers?: number;         // mr3.auto.scale.out.num.initial.containers
  scaleOutIncrement?: number;                 // mr3.auto.scale.out.num.increment.containers
  scaleInDecrementHosts?: number;             // mr3.auto.scale.in.num.decrement.hosts
  scaleInMinHosts?: number;                   // mr3.auto.scale.in.min.hosts

  //
  // ranger.T
  //
  service: string;
  // Ranger authentication - currently we do not support "LDAP"
  dbFlavor: "MYSQL" | "ORACLE" | "POSTGRES" | "MSSQL";
  dbRootUser: string;
  dbRootPassword: string;
  dbHost: string;
  enableRangerDatabaseSsl: boolean;
  dbPassword: string;           // password for user 'rangeradmin'
  adminPassword: string;

  //
  // timeline.T
  //
  enableTaskView?: boolean;

  //
  // spark.T
  //
  driverNameStr: string;

  //
  // secret.T
  //
  kerberosSecret: {    // hadoop.security.authentication set to 'simple' or 'kerberos'
    server: {
      keytab: string;
      principal: string;
      data: string;
      keytabInternal: string;
      principalInternal: string;
      dataInternal: string;
    };
    ranger?: {
      domain: "ranger.hivemr3.svc.cluster.local";
      spnego: {
        keytab: string;
        principal: string;
        data: string;
      };
      admin: {
        keytab: string;
        principal: string;
        data: string;
      };
      lookup: {
        keytab: string;
        principal: string;
        data: string;
      };
    };
  };
  spark?: {
    keytab: string;
    principal: string;
    data: string;
  };
  ssl?: {
    keystore: string;       // hivemr3-ssl-certificate.jceks
    truststore: string;     // hivemr3-ssl-certificate.jks
    password: string;       // HIVE_SERVER2_SSL_TRUSTSTOREPASS, HADOOP_CREDSTORE_PASSWORD
    keystoreData: string;
    truststoreData: string;
  };
  secretEnvVars: { name: string; value: string; }[];

  // used to disable the entire 'Applications' page by setting errorFields.disabled
  disabled?: boolean;
}
