import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.consts !== undefined);
  assert(env.service !== undefined);

  const annotations = 
    env.service.useHttps ? 
      { ['service.beta.kubernetes.io/aws-load-balancer-backend-protocol']: "http",
        ['service.beta.kubernetes.io/aws-load-balancer-ssl-cert']: env.service.sslCertificateArn,
        ['service.beta.kubernetes.io/aws-load-balancer-ssl-ports']: "https" }
      : {};
  const port = env.service.useHttps ? env.consts.apache.httpsPort : env.consts.apache.httpPort;
  const portName = env.service.useHttps ? "https" : "http";
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.apache.service,
      namespace: env.service.namespace,
      annotations: annotations
    },
    spec: {
      type: "LoadBalancer",
      selector: {
        hivemr3_app: env.consts.apache.service
      },
      ports: [
        { port: port,
          targetPort: env.consts.apache.httpdServerPort,
          name: portName }
      ]
    }
  };
}
