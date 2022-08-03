import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.timeline.timelineEnabled);
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.consts.name.timeline.service,
      namespace: env.basics.namespace
    },
    spec: {
      clusterIP: "None",
      selector: {
        hivemr3_app: env.consts.name.timeline.service
      },
      ports: [
        { name: "timelineserver-http",
          protocol: "TCP",
          port: env.consts.timeline.httpPort,
          targetPort: env.consts.timeline.httpPort },
        { name: "timelineserver-https",
          protocol: "TCP",
          port: env.consts.timeline.httpsPort,
          targetPort: env.consts.timeline.httpsPort },
        { name: "mr3-ui-jetty",
          protocol: "TCP",
          port: 8080,
          targetPort: 8080 },
        { name: "prometheus",
          protocol: "TCP",
          port: env.consts.timeline.prometheusPort,
          targetPort: env.consts.timeline.prometheusPort },
        { name: "grafana",
          protocol: "TCP",
          port: env.consts.timeline.grafanaPort,
          targetPort: env.consts.timeline.grafanaPort }
      ]
    }
  };
}
