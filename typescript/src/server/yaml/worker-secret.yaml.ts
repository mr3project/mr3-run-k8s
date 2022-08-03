import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;

  let data: { [key: string]: string } = {};
  if (((env.basics.s3aEnableSsl !== undefined && env.basics.s3aEnableSsl) ||
       env.worker.enableShuffleSsl)   // because of hadoop.security.credential.provider.path in core-site.xml
      && env.secret.ssl !== undefined) {
    data[env.secret.ssl.keystore] = env.secret.ssl.keystoreData;
    data[env.secret.ssl.truststore] = env.secret.ssl.truststoreData;
  }
  if (env.worker.enableShuffleSsl && env.secret.shuffleSsl !== undefined) {
    data[env.secret.shuffleSsl.keystore] = env.secret.shuffleSsl.keystoreData;
    data[env.secret.shuffleSsl.truststore] = env.secret.shuffleSsl.truststoreData;
  }

  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.hive.workerSecret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    data: data
  };
}
