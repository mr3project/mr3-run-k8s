import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;

  let data: { [key: string]: string } = {};
  if (env.hive.secureMode && env.secret.kerberosSecret !== undefined) {
    data[env.secret.kerberosSecret.server.keytabInternal] = env.secret.kerberosSecret.server.dataInternal;
  }
  if (env.secret.spark !== undefined) {
    data[env.secret.spark.keytab] = env.secret.spark.data;
  }
  if ((env.basics.s3aEnableSsl !== undefined && env.basics.s3aEnableSsl)
      && env.secret.ssl !== undefined) {
    data[env.secret.ssl.keystore] = env.secret.ssl.keystoreData;
    data[env.secret.ssl.truststore] = env.secret.ssl.truststoreData;
  }

  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.spark.secret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    data: data
  };
}
