export const keytabSizeLimit = 2500;
export const storeSizeLimit = 50000;

export interface T {
  kerberosSecret?: {            // hadoop.security.authentication set to 'simple' or 'kerberos'
    // kerberosSecretDomain = basics.hiveserver2IpHostname
    // kerberosSecretDomainInternal = `{consts.name.hive.serviceInternal}.${basics.namespace}.svc.cluster.local`
    server: {
      keytab: string;
      principal: string;
      data: string;
      keytabInternal: string;
      principalInternal: string;
      dataInternal: string;
    };
    user?: {
      keytab: string;
      principal: string;
      data: string;
    };
    ranger?: {
      // kerberosSecretRangerDomain = `${consts.name.ranger.service}.${basics.namespace}.svc.cluster.local`
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
  shuffleSsl?: {
    keystore: string;       // mr3-keystore.jks
    truststore: string;     // mr3-truststore.jks
    keystoreData: string;
    truststoreData: string;
  };
  secretEnvVars: { name: string; value: string; }[];
  //
  // set in validate()
  //
  createSecret?: boolean;
  truststoreType?: string;
  keystorePath?: string;
  keystorePathFull?: string;
  truststorePath?: string;
  rangerKeystorePath?: string;
  rangerTruststorePath?: string;
  timelineKeystorePath?: string;
  timelineTruststorePath?: string;
  sslPassword?: string;
  shuffleKeystorePath?: string;
  shuffleTruststorePath?: string;
  envVarSeq?: string;
  envVarDefs?: string;
  masterLaunchCmdOpts?: string;
  containerLaunchCmdOpts?: string;
  solrAuthenticationOption?: string;
  sparkUser?: string;
  //
  // only for validate()
  //
}
