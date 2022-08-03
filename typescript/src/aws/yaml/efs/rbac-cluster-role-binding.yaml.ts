import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.service !== undefined);

  return {
    kind: "ClusterRoleBinding",
    apiVersion: "rbac.authorization.k8s.io/v1",
    metadata: {
      name: "run-efs-provisioner"
    },
    subjects: [
    { kind: "ServiceAccount",
      namespace: env.service.namespace,
      name: "efs-provisioner"
    }
    ],
    roleRef: {
      kind: "ClusterRole",
      name: "efs-provisioner-runner",
      apiGroup: "rbac.authorization.k8s.io"
    }
  };
}
