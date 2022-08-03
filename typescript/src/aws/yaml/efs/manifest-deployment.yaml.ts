import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.eks !== undefined);
  assert(env.service !== undefined);
  assert(env.efs !== undefined);

  return {
    kind: "Deployment",
    apiVersion: "apps/v1",
    metadata: {
      namespace: env.service.namespace,
      name: "efs-provisioner"
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "efs-provisioner"
        }
      },
      strategy: {
        type: "Recreate" 
      },
      template: {
        metadata: {
          labels: {
            app: "efs-provisioner"
          }
        },
        spec: {
          serviceAccountName: "efs-provisioner",
          containers: [
          { name: "efs-provisioner",
            image: "quay.io/external_storage/efs-provisioner:latest",
            env: [
            { name: "FILE_SYSTEM_ID",
              valueFrom: {
                configMapKeyRef: {
                  name: "efs-provisioner",
                  key: "file.system.id"
                }
              }
            },
            { name: "AWS_REGION",
              valueFrom: {
                configMapKeyRef: {
                  name: "efs-provisioner",
                  key: "aws.region"
                }
              }
            },
            { name: "DNS_NAME",
              valueFrom: {
                configMapKeyRef: {
                  name: "efs-provisioner",
                  key: "dns.name",
                  optional: true
                }
              }
            },
            { name: "PROVISIONER_NAME",
              valueFrom: {
                configMapKeyRef: {
                  name: "efs-provisioner",
                  key: "provisioner.name"
                }
              }
            } ],
            volumeMounts: [
            { name: "pv-volume",
              mountPath: "/persistentvolumes"
            } ],
          } ],
          volumes: [
          { name: "pv-volume",
            nfs: {
              server: env.efs.efsId + ".efs." + env.eks.region + ".amazonaws.com",
              path: "/"
            }
          } ]
        }
      }
    }
  };
}
