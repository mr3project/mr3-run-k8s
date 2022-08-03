import * as state from '../../../server/state';

export function build(s: state.T) {
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.name.hive.service,
      namespace: env.basics.namespace
    },
    spec: {
      type: "LoadBalancer",
      selector: {
        hivemr3_app: env.consts.name.hive.service
      },
      ports: [
        { protocol: "TCP",
          port: env.consts.hive.port,
          targetPort: env.consts.hive.port,
          name: "thrift" },
        { protocol: "TCP",
          port: env.consts.hive.httpport,
          targetPort: env.consts.hive.httpport,
          name: "http" }
      ],
      externalIPs: [
        env.basics.hiveserver2Ip
      ]
    }
  };
}
