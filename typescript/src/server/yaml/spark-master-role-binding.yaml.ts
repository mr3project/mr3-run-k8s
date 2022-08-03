import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "rbac.authorization.k8s.io/v1beta1",
    kind: "RoleBinding",
    metadata: {
      name: "spark-master-role-binding",
      namespace: env.basics.namespace
    },
    roleRef: {
      kind: "Role",
      name: "master-role",
      apiGroup: "rbac.authorization.k8s.io"
    },
    subjects: [ 
      { kind: "ServiceAccount",
        name: env.consts.name.mr3.sparkMasterServiceAccount,
        namespace: env.basics.namespace } 
    ]
  };
}
