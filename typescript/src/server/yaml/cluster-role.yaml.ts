import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRole",
    metadata: {
      name: "node-reader"
    },
    rules: [ 
      { apiGroups: [""],
        resources: ["nodes"],
        verbs: ["get", "watch", "list"] }
    ]
  };
}
