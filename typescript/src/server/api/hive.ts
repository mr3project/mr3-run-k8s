export interface T {
  resources: {
    cpu: number;
    memoryInMb: number;
  };
  numInstances: number;
  authentication: "NONE" | "LDAP" | "KERBEROS";   // hive.server2.authentication
  ldap?: {
    baseDN: string;     // hive.server2.authentication.ldap.baseDN
    url: string;        // hive.server2.authentication.ldap.url
  };
  authenticator: "HadoopDefaultAuthenticator" | "ProxyUserAuthenticator" | "SessionStateUserAuthenticator";
  authorization: "SQLStdConfOnlyAuthorizerFactory" | "SQLStdHiveAuthorizerFactory" | "RangerHiveAuthorizerFactory";
  // for hive.server2.use.SSL in public HiveServer2
  enableSsl: boolean;
  serviceAccountAnnotations?: { key: string; value: string; };  // e.g., eks.amazonaws.com/role-arn: arn:aws:iam::111111111111:role/NEW_IAM_ROLE_NAME
  // for hive.server2.use.SSL in internal HiveServer2, hive.metastore.use.SSL in Metastore, and Ranger
  enableSslInternal: false;
  //
  // set in validate()
  //
  // secureMode = authentication == "KERBEROS"
  secureMode?: boolean;
  authenticationInternal?: string;
  secureModeInternal?: boolean;
  secureModeMetastore?: boolean;
  authenticatorConf?: string;     // hive.security.authenticator.manager
  authorizationConf?: string;     // hive.security.authorization.manager
}
