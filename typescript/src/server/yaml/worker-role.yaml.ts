import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: {
      name: "worker-role",
      namespace: env.basics.namespace
    },
    rules: [
      { apiGroups: [""],
        resources: ["configmaps"],
        verbs: ["get"] },
      { apiGroups: [""],
        resources: ["secrets"],
        verbs: ["get"] }
    ]
  };
}
