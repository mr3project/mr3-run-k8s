import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.superset.supersetEnabled && s.env.superset.resources !== undefined);
  const env = s.env;

  const resources = s.env.superset.resources;

  return {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
      name: env.consts.name.superset.superset,
      namespace: env.basics.namespace
    },
    spec: {
      serviceName: env.consts.name.superset.service,
      replicas: 1,
      selector: {
        matchLabels: {
          hivemr3_app: env.consts.name.superset.service
        }
      },
      template: {
        metadata: {
          name: env.consts.name.superset.superset,
          namespace: env.basics.namespace,
          labels: {
            hivemr3_app: env.consts.name.superset.service,
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
            image: env.docker.docker.supersetImage,
            command: ["/opt/mr3-run/superset/superset.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "supersetbi",
            resources: util.createRequestsLimits(resources),
            ports: [
              { containerPort: env.consts.superset.port,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.superset.port },
              initialDelaySeconds: env.consts.superset.livenessProbe,
              periodSeconds: env.consts.superset.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForSuperset(s)
          } ],
          volumes: util.createVolumesForSuperset(s)
        }
      }
    }
  };
}
