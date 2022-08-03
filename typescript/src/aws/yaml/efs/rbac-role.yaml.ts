import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.service !== undefined);

  return {
    kind: "Role",
    apiVersion: "rbac.authorization.k8s.io/v1",
    metadata: {
      namespace: env.service.namespace,
      name: "leader-locking-efs-provisioner"
    },
    rules: [
    { apiGroups: [""],
      resources: ["endpoints"],
      verbs: ["get", "list", "watch", "create", "update", "patch"] } 
    ]
  };
}

