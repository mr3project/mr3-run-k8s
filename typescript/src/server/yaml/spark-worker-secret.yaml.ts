import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;

  let data: { [key: string]: string } = {};
  if ((env.basics.s3aEnableSsl !== undefined && env.basics.s3aEnableSsl)
      && env.secret.ssl !== undefined) {
    data[env.secret.ssl.keystore] = env.secret.ssl.keystoreData;
    data[env.secret.ssl.truststore] = env.secret.ssl.truststoreData;
  }

  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.spark.workerSecret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    data: data
  };
}
