import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;

  let data: { [key: string]: string } = {};
  if (env.hive.secureMode && env.secret.kerberosSecret !== undefined) {
    data[env.secret.kerberosSecret.server.keytab] = env.secret.kerberosSecret.server.data;
    data[env.secret.kerberosSecret.server.keytabInternal] = env.secret.kerberosSecret.server.dataInternal;
  }
  if (env.hive.secureMode && env.secret.kerberosSecret !== undefined && env.secret.kerberosSecret.user !== undefined) {
    data[env.secret.kerberosSecret.user.keytab] = env.secret.kerberosSecret.user.data;
  }
  if ((env.hive.enableSsl || env.hive.enableSslInternal ||
       (env.basics.s3aEnableSsl !== undefined && env.basics.s3aEnableSsl))
      && env.secret.ssl !== undefined) {
    data[env.secret.ssl.keystore] = env.secret.ssl.keystoreData;
    data[env.secret.ssl.truststore] = env.secret.ssl.truststoreData;
  }

  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.hive.secret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    data: data
  };
}
