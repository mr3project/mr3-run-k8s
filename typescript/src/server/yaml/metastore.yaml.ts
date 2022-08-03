import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.metastore.kind === "internal");  // now env.metastore.args is valid

  return {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
      name: env.consts.name.metastore.metastore,
      namespace: env.basics.namespace
    },
    spec: {
      serviceName: env.consts.name.metastore.service,
      replicas: 1,
      selector: {
        matchLabels: {
          hivemr3_hive_source: "hivesrc3",
          hivemr3_app: env.consts.name.metastore.service
        }
      },
      template: {
        metadata: {
          name: env.consts.name.metastore.metastore,
          namespace: env.basics.namespace,
          labels: {
            hivemr3_hive_source: "hivesrc3",
            hivemr3_app: env.consts.name.metastore.service,
            ['mr3-pod-role']: "master-role"
          }
        },
        spec: {
          serviceAccountName: env.consts.name.hive.serviceAccount,
          restartPolicy: "Always",
          nodeSelector: util.createMasterNodeSelector(s),
          affinity: util.createPodAffinity("hivemr3_app", env.consts.name.ranger.service),
          hostAliases: env.basics.hostAliasesExpanded,
          imagePullSecrets: env.docker.yamlImagePullSecrets,
          containers: [ {
            image: env.docker.docker.image,
            command: [env.consts.dir.hive + "/metastore-service.sh"],
            args: env.metastore.args,
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "metastore",
            env: util.createEnvVarsFromRandoms(s),
            resources: util.createRequestsLimits(env.metastore.resources),
            ports: [
              { containerPort: env.consts.metastore.port,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.metastore.port },
              initialDelaySeconds: env.consts.metastore.livenessProbe,
              periodSeconds: env.consts.metastore.livenessProbe
            },
            volumeMounts: util.createVolumeMounts(s)
          } ],
          volumes: util.createVolumes(s, true)
        }
      }
    }
  };  
}
