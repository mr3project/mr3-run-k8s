import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.hive.authorization === "RangerHiveAuthorizerFactory" && s.env.ranger.kind === "internal");
  const env = s.env;

  const halfResources = {
    cpu: s.env.ranger.resources.cpu / 2,
    memoryInMb: Math.floor(s.env.ranger.resources.memoryInMb / 2)
  };

  return {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
      name: env.consts.name.ranger.ranger,
      namespace: env.basics.namespace
    },
    spec: {
      serviceName: env.consts.name.ranger.service,
      replicas: 1,
      selector: {
        matchLabels: {
          hivemr3_app: env.consts.name.ranger.service
        }
      },
      template: {
        metadata: {
          name: env.consts.name.ranger.ranger,
          namespace: env.basics.namespace,
          labels: {
            hivemr3_app: env.consts.name.ranger.service,
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
            image: env.docker.docker.rangerImage,
            command: [env.consts.dir.ranger + "/start-solr.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "solr",
            resources: util.createRequestsLimits(halfResources),
            ports: [
              { containerPort: env.consts.ranger.auditPort,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.ranger.auditPort },
              initialDelaySeconds: env.consts.ranger.livenessProbe,
              periodSeconds: env.consts.ranger.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForRanger(s)
          },
          { image: env.docker.docker.rangerImage,
            command: [env.consts.dir.ranger + "/start-ranger.sh"],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "ranger",
            resources: util.createRequestsLimits(halfResources),
            ports: [
              { containerPort: env.consts.ranger.httpPort,
                protocol: "TCP" },
              { containerPort: env.consts.ranger.httpsPort,
                protocol: "TCP" }
            ],
            livenessProbe: {
              tcpSocket: { port: env.consts.ranger.httpPort },
              initialDelaySeconds: env.consts.ranger.livenessProbe,
              periodSeconds: env.consts.ranger.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForRanger(s)
          } ],
          volumes: util.createVolumesForRanger(s)
        }
      }
    }
  };
}
