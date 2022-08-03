import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.eks !== undefined);
  assert(env.autoscaler !== undefined);

  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "cluster-autoscaler",
      namespace: "kube-system",
      labels: {
        app: "cluster-autoscaler"
      }
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "cluster-autoscaler"
        }
      },
      template: {
        metadata: {
          labels: {
            app: "cluster-autoscaler"
          },
          annotations: {
            ['prometheus.io/scrape']: 'true',
            ['prometheus.io/port']: '8085'
          }
        },
        spec: {
          priorityClassName: "system-cluster-critical",
          securityContext: {
            runAsNonRoot: true,
            runAsUser: 65534,
            fsGroup: 65534
          },
          serviceAccountName: "cluster-autoscaler",
          containers: [
            { image: "k8s.gcr.io/autoscaling/cluster-autoscaler:v1.22.2",
              name: "cluster-autoscaler",
              resources: {
                limits: {
                  cpu: "100m",
                  memory: "600Mi"
                },
                requests: {
                  cpu: "100m",
                  memory: "600Mi"
                }
              },
              command: [
                "./cluster-autoscaler",
                "--v=4",
                "--stderrthreshold=info",
                "--cloud-provider=aws",
                "--skip-nodes-with-local-storage=false",
                "--expander=least-waste",
                "--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/" + env.eks.name,
                "--scale-down-delay-after-add=" + (Math.floor(env.autoscaler.autoscalingScaleDownDelayAfterAddMin)) + "m",
                "--scale-down-unneeded-time=" + (Math.floor(env.autoscaler.autoscalingScaleDownUnneededTimeMin)) + "m"
              ],
              volumeMounts: [
                { name: "ssl-certs",
                  mountPath: "/etc/ssl/certs/ca-certificates.crt",
                  readOnly: true }
              ],
              imagePullPolicy: "Always"
            }
          ],
          volumes: [
            { name: "ssl-certs",
              hostPath: {
                path: "/etc/ssl/certs/ca-bundle.crt"
              }
            }
          ]
        }
      }
    }
  };
}
