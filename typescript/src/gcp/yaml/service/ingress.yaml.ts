import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.consts !== undefined);
  assert(env.service !== undefined);

  return {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
      name: env.consts.apache.ingress,
      namespace: env.service.namespace
    },
    spec: {
      rules: [
        { http: {
            paths: [
              { path: "/",
                pathType: "ImplementationSpecific",
                backend: { 
                  service: {
                    name: env.consts.apache.service,
                    port: {
                      number: env.consts.apache.httpdServerPort
                    }
                  }
                }
              },
            ]
          }
        }
      ]
    }
  };
}
