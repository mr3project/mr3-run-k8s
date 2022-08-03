import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.timeline.timelineEnabled);
  assert(s.env.timeline.prometheusResources !== undefined);
  assert(s.env.timeline.timelineServerResources !== undefined);
  assert(s.env.timeline.jettyResources !== undefined);
  assert(s.env.timeline.grafanaResources !== undefined);

  const env = s.env;

  return {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
      name: env.consts.name.timeline.timeline,
      namespace: env.basics.namespace
    },
    spec: {
      serviceName: env.consts.name.timeline.service,
      replicas: 1,
      selector: {
        matchLabels: {
          hivemr3_app: env.consts.name.timeline.service
        }
      },
      template: {
        metadata: {
          name: env.consts.name.timeline.timeline,
          namespace: env.basics.namespace,
          labels: {
            hivemr3_app: env.consts.name.timeline.service,
            ['mr3-pod-role']: "master-role"
          }
        },
        spec: {
          restartPolicy: "Always",
          nodeSelector: util.createMasterNodeSelector(s),
          affinity: util.createPodAffinity("hivemr3_app", env.consts.name.metastore.service),
          hostAliases: env.basics.hostAliasesExpanded,
          imagePullSecrets: env.docker.yamlImagePullSecrets,
          containers: [
          {
            image: env.docker.docker.atsImage,
            command: [env.consts.dir.timeline + "/timeline-service.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "timelineserver-http",
            env: util.createEnvVarsFromRandoms(s),
            resources: util.createRequestsLimits(s.env.timeline.timelineServerResources),
            ports: [
              { containerPort: env.consts.timeline.httpsPort,
                protocol: "TCP" },
              { containerPort: env.consts.timeline.httpPort,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.timeline.httpPort },
              initialDelaySeconds: env.consts.timeline.livenessProbe,
              periodSeconds: env.consts.timeline.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForTimeline(s)
          },
          {
            image: env.docker.docker.atsImage,
            command: [env.consts.dir.timeline + "/mr3-ui.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "mr3-ui-jetty",
            resources: util.createRequestsLimits(s.env.timeline.jettyResources),
            ports: [
              { containerPort: 8080,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: 8080 },  // from timeline.jettyHttpUrl
              initialDelaySeconds: env.consts.timeline.livenessProbe,
              periodSeconds: env.consts.timeline.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForJetty(s)
          },
          {
            image: env.docker.docker.atsImage,
            command: [env.consts.dir.timeline + "/prometheus.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "prometheus",
            resources: util.createRequestsLimits(s.env.timeline.prometheusResources),
            ports: [
              { containerPort: env.consts.timeline.prometheusPort,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.timeline.prometheusPort },
              initialDelaySeconds: env.consts.timeline.livenessProbe,
              periodSeconds: env.consts.timeline.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForPrometheus(s)
          },
          {
            image: env.docker.docker.atsImage,
            command: [env.consts.dir.timeline + "/grafana.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "grafana",
            resources: util.createRequestsLimits(s.env.timeline.grafanaResources),
            ports: [
              { containerPort: env.consts.timeline.grafanaPort,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.timeline.grafanaPort },
              initialDelaySeconds: env.consts.timeline.livenessProbe,
              periodSeconds: env.consts.timeline.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForGrafana(s)
          }
          ],
          volumes: util.createVolumesForTimeline(s)
        }
      }
    }
  };
}
    
