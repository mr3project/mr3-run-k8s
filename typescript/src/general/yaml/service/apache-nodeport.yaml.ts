import * as state from '../../../server/state';

export function build(s: state.T) {
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.apache.service,
      namespace: env.basics.namespace
    },
    spec: {
      type: "NodePort",
      selector: {
        hivemr3_app: env.consts.apache.service
      },
      ports: [
        { port: env.consts.apache.httpdServerPort,
          targetPort: env.consts.apache.httpdServerPort,
          name: "http" }
      ]
    }
  };
}
