import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  return {
    kind: "ClusterRole",
    apiVersion: "rbac.authorization.k8s.io/v1",
    metadata: {
      name: "efs-provisioner-runner"
    },
    rules: [
    { apiGroups: [""],
      resources: ["persistentvolumes"],
      verbs: ["get", "list", "watch", "create", "delete"] },
    { apiGroups: [""],
      resources: ["persistentvolumeclaims"],
      verbs: ["get", "list", "watch", "update"] },
    { apiGroups: ["storage.k8s.io"],
      resources: ["storageclasses"],
      verbs: ["get", "list", "watch"] },
    { apiGroups: [""],
      resources: ["events"],
      verbs: ["create", "update", "patch"] }
    ]
  };
}
