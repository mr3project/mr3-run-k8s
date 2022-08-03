import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.name.superset.service,
      namespace: env.basics.namespace
    },
    spec: {
      clusterIP: "None",
      selector: {
        hivemr3_app: env.consts.name.superset.service
      },
      ports: [
        { name: "supersetbi",
          protocol: "TCP",
          port: 8088,
          targetPort: 8088 }
      ]
    }
  };
}
