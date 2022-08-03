import { strict as assert } from 'assert';
import * as state from '../../../server/state';
import { isEmptyString } from '../../../helper';

export function build(s: state.T) {
  const env = s.env;
  assert(isEmptyString(env.basics.externalIp));
  assert(!isEmptyString(env.basics.externalIpHostname));

  return {
    apiVersion: "extensions/v1beta1",
    kind: "Ingress",
    metadata: {
      name: env.consts.apache.ingress,
      namespace: env.basics.namespace
    },
    spec: {
      rules: [
        { host: env.basics.externalIpHostname,
          http: {
            paths: [
              { path: "/",
                backend: { 
                  serviceName: env.consts.apache.service,
                  servicePort: env.consts.apache.httpdServerPort
                } 
              },
            ]
          }
        }
      ]
    }
  };
}
