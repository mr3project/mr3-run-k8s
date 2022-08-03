import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRoleBinding",
    metadata: {
      name: "cluster-autoscaler",
      labels: {
        ['k8s-addon']: "cluster-autoscaler.addons.k8s.io",
        ['k8s-app']: "cluster-autoscaler"
      }
    },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "ClusterRole",
      name: "cluster-autoscaler"
    },
    subjects: [
      { kind: "ServiceAccount",
        name: "cluster-autoscaler",
        namespace: "kube-system" }
    ]
  };
}
