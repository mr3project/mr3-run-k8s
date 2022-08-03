import * as state from '../state';
import * as util from '../util';

export function build(s: state.T) {
  const env = s.env;

  const webPort = util.getWebUiPort(env.config);
  const webPortSpec = webPort > 0 ? 
    { containerPort: webPort,
      protocol: "TCP" } : 
    {};

  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: env.consts.name.hive.hiveserver2,
      namespace: env.basics.namespace
    },
    spec: {
      replicas: env.hive.numInstances,
      selector: {
        matchLabels: {
          hivemr3_hive_source: "hivesrc3",
          hivemr3_app: env.consts.name.hive.service
        }
      },
      template: {
        metadata: {
          name: env.consts.name.hive.hiveserver2,
          namespace: env.basics.namespace,
          labels: {
            hivemr3_hive_source: "hivesrc3",
            hivemr3_app: env.consts.name.hive.service,
            ['mr3-pod-role']: "master-role"
          }
        },
        spec: {
          serviceAccountName: env.consts.name.hive.serviceAccount,
          restartPolicy: "Always",
          nodeSelector: util.createMasterNodeSelector(s),
          affinity: util.createPodAffinity("hivemr3_app", env.consts.name.metastore.service),
          hostAliases: env.basics.hostAliasesExpanded,
          imagePullSecrets: env.docker.yamlImagePullSecrets,
          containers: [ {
            image: env.docker.docker.image,
            command: [env.consts.dir.hive + "/hiveserver2-service.sh"],
            args: ["start", env.consts.hive.amMode],
            imagePullPolicy: env.docker.docker.imagePullPolicy,
            name: "hiveserver2",
            env: util.createEnvVarsFromRandoms(s),
            resources: util.createRequestsLimits(env.hive.resources),
            ports: [
              { containerPort: env.consts.hive.port,
                protocol: "TCP" },
              { containerPort: env.consts.hive.httpport,
                protocol: "TCP" },
              webPortSpec 
            ],
            readinessProbe: {
              tcpSocket: { port: env.consts.hive.port },
              initialDelaySeconds: env.consts.hive.readinessProbe,
              periodSeconds: env.consts.hive.readinessProbe
            },
            livenessProbe: {
              tcpSocket: { port: env.consts.hive.port },
              initialDelaySeconds: env.consts.hive.livenessProbe,
              periodSeconds: env.consts.hive.livenessProbe
            },
            volumeMounts: util.createVolumeMountsForHiveServer2(s)
          } ],
          volumes: util.createVolumesForHiveServer2(s, false)
        }
      }
    }
  };
}
