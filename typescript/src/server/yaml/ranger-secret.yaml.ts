import * as state from '../state';
import { expand } from '../util-fs';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.hive.authorization === "RangerHiveAuthorizerFactory" && s.env.ranger.kind === "internal");
  const env = s.env;
  const rangerEnableKerberos = env.hive.authentication === "KERBEROS";

  let data: { [key: string]: string } = {};
  if (rangerEnableKerberos && env.secret.kerberosSecret !== undefined && env.secret.kerberosSecret.ranger !== undefined) {
    data[env.secret.kerberosSecret.ranger.spnego.keytab] = env.secret.kerberosSecret.ranger.spnego.data;
    data[env.secret.kerberosSecret.ranger.admin.keytab] = env.secret.kerberosSecret.ranger.admin.data;
    data[env.secret.kerberosSecret.ranger.lookup.keytab] = env.secret.kerberosSecret.ranger.lookup.data;
  }
  // do not use hive.enableSslInternal because if hive.enableSsl == true,
  // Ranger needs certificates to connect to HiveServer2
  if (env.hive.enableSsl && env.secret.ssl !== undefined) {
    data[env.secret.ssl.keystore] = env.secret.ssl.keystoreData;
    data[env.secret.ssl.truststore] = env.secret.ssl.truststoreData;
  }

  let stringData: { [key: string]: string } = {};
  stringData['install.properties'] = expand('./server/ranger-resources/install.properties', s);
  stringData['solr.in.sh'] = expand('./server/ranger-resources/solr.in.sh', s);

  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.ranger.secret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    data: data,
    stringData: stringData
  };
}
