import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRoleBinding",
    metadata: {
      name: "spark-master-clusterrole-binding"
    }, 
    roleRef: {
      kind: "ClusterRole",
      name: "node-reader",
      apiGroup: "rbac.authorization.k8s.io"
    },
    subjects: [ 
      { kind: "ServiceAccount",
        name: env.consts.name.mr3.sparkMasterServiceAccount,
        namespace: env.basics.namespace } 
    ]
  };
}
