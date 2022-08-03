import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.driver !== undefined);

  return {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
      name: env.driver.name,
      namespace: env.basics.namespace,
      labels: {
        sparkmr3_app: env.driver.name,
        ['mr3-pod-role']: "master-role"
      }
    },
    spec: {
      serviceAccountName: env.consts.name.spark.serviceAccount,
      restartPolicy: "Never",
      nodeSelector: util.createMasterNodeSelector(s),
      hostAliases: env.basics.hostAliasesExpanded,
      imagePullSecrets: env.docker.yamlImagePullSecrets,
      containers: [
      { 
        image: env.docker.docker.sparkImage,
        command: ["/bin/sleep"],
        args: [ "infinity" ],
        imagePullPolicy: env.docker.docker.imagePullPolicy,
        name: "sparkmr3-run",
        resources: util.createRequestsLimits(env.driver.resources),
        env: [
          { name: "DRIVER_NAME",
            value: env.driver.name 
          },
          { name: "CLIENT_TO_AM_TOKEN_KEY",
            valueFrom: {
              configMapKeyRef: {
                name: env.consts.name.amConfigMapSpark,
                key: "CLIENT_TO_AM_TOKEN_KEY"
              }
            }
          },
          { name: "MR3_APPLICATION_ID_TIMESTAMP",
            valueFrom: {
              configMapKeyRef: {
                name: env.consts.name.amConfigMapSpark,
                key: "MR3_APPLICATION_ID_TIMESTAMP"
              }
            }
          },
          { name: "KRB5_CONFIG",
            value: `${env.consts.dir.conf}/krb5.conf`
          },
          { name: "SPARK_DRIVER_CORES",
            value: `${env.driver.sparkDriverCores}`
          },
          { name: "SPARK_DRIVER_MEMORY_MB",
            value: `${env.driver.sparkDriverMemoryInMb}`
          }
        ],
        ports: [
          { name: "driver",
            containerPort: env.consts.spark.port },
          { name: "webui",
            containerPort: env.consts.spark.uiPort }
        ],
        volumeMounts: util.createVolumeMountsForSpark(s)
      }
      ],
      volumes: util.createVolumesForSpark(s)
    }
  };
}
