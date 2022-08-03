import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.hive.authorization === "RangerHiveAuthorizerFactory" && s.env.ranger.kind === "internal");
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.name.ranger.service,
      namespace: env.basics.namespace
    },
    spec: {
      clusterIP: "None",
      selector: {
        hivemr3_app: env.consts.name.ranger.service
      },
      ports: [
        { name: "ranger-admin-http",
          protocol: "TCP",
          port: env.consts.ranger.httpPort,
          targetPort: env.consts.ranger.httpPort },
        { name: "ranger-admin-https",
          protocol: "TCP",
          port: env.consts.ranger.httpsPort,
          targetPort: env.consts.ranger.httpsPort },
        { name: "solr",
          protocol: "TCP",
          port: env.consts.ranger.auditPort,
          targetPort: env.consts.ranger.auditPort }
      ]
    }
  };
}
