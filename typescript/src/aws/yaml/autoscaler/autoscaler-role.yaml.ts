import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: {
      name: "cluster-autoscaler",
      namespace: "kube-system",
      labels: {
        ['k8s-addon']: "cluster-autoscaler.addons.k8s.io",
        ['k8s-app']: "cluster-autoscaler"
      }
    },
    rules: [
      { apiGroups: [""],
        resources: ["configmaps"],
        verbs: ["create", "list", "watch"],
      },
      { apiGroups: [""],
        resources: ["configmaps"],
        resourceNames: ["cluster-autoscaler-status", "cluster-autoscaler-priority-expander"],
        verbs: ["delete", "get", "update", "watch"] 
      }
    ]
  };
}

