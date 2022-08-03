import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.service !== undefined);

  return {
    kind: "RoleBinding",
    apiVersion: "rbac.authorization.k8s.io/v1",
    metadata: {
      namespace: env.service.namespace,
      name: "leader-locking-efs-provisioner"
    },
    subjects: [
    { kind: "ServiceAccount",
      namespace: env.service.namespace,
      name: "efs-provisioner" }
    ],
    roleRef: {
      kind: "Role",
      name: "leader-locking-efs-provisioner",
      apiGroup: "rbac.authorization.k8s.io"
    }
  };
}
