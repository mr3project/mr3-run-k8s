import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.timeline.apacheResources !== undefined);

  const env = s.env;

  return {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
      name: env.consts.apache.apache,
      namespace: env.basics.namespace
    },
    spec: {
      serviceName: env.consts.apache.service,
      replicas: 1,
      selector: {
        matchLabels: {
          hivemr3_app: env.consts.apache.service
        }
      },
      template: {
        metadata: {
          name: env.consts.apache.apache,
          namespace: env.basics.namespace,
          labels: {
            hivemr3_app: env.consts.apache.service,
            ['mr3-pod-role']: "master-role"
          }
        },
        spec: {
          restartPolicy: "Always",
          nodeSelector: util.createMasterNodeSelector(s),
          hostAliases: env.basics.hostAliasesExpanded,
          imagePullSecrets: env.docker.yamlImagePullSecrets,
          containers: [
          {
            image: env.docker.docker.apacheImage,
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "apache",
            resources: util.createRequestsLimits(s.env.timeline.apacheResources),
            ports: [
              { containerPort: env.consts.apache.httpdServerPort,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.apache.httpdServerPort },
              initialDelaySeconds: env.consts.apache.livenessProbe,
              periodSeconds: env.consts.apache.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForApache(s)
          }
          ],
          volumes: util.createVolumesForApache(s)
        }
      }
    }
  };
}

