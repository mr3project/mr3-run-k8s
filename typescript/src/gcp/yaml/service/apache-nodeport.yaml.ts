import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.consts !== undefined);
  assert(env.service !== undefined);

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.apache.service,
      namespace: env.service.namespace
    },
    spec: {
      type: "NodePort",
      selector: {
        hivemr3_app: env.consts.apache.service
      },
      ports: [
        { protocol: "TCP",
          port: env.consts.apache.httpdServerPort,
          targetPort: env.consts.apache.httpdServerPort }
      ]
    }
  };
}
