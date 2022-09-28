import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: {
      name: "spark-role-binding",
      namespace: env.basics.namespace
    },
    roleRef: {
      kind: "Role",
      name: "spark-role",
      apiGroup: "rbac.authorization.k8s.io"
    },
    subjects: [ 
      { kind: "ServiceAccount",
        name: env.consts.name.spark.serviceAccount,
        namespace: env.basics.namespace } 
    ]
  };
}
