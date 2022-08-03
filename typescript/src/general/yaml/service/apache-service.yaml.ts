import * as state from '../../../server/state';

export function build(s: state.T) {
  const env = s.env;

  const useHttps = false;   // TODO: not supported yet
  const port =  useHttps ? env.consts.apache.httpsPort : env.consts.apache.httpPort;
  const portName = useHttps ? "https" : "http";

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.apache.service,
      namespace: env.basics.namespace
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
      ],
      externalIPs: [
        env.basics.externalIp
      ]
    }
  };
}
