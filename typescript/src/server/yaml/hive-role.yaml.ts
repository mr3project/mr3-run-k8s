import * as state from '../state';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: {
      name: "hive-role",
      namespace: env.basics.namespace
    },
    rules: [
      { apiGroups: [""],
        resources: ["pods"],
        verbs: ["get", "watch", "list", "create", "delete"] },
      { apiGroups: ["extensions", "apps"],
        resources: ["deployments"],
        verbs: ["get", "watch", "list", "create", "delete"] },
      { apiGroups: [""],
        resources: ["configmaps"],
        verbs: ["get", "create", "update", "delete"] },
      { apiGroups: [""],
        resources: ["secrets"],
        verbs: ["get"] },
      { apiGroups: [""],
        resources: ["services"],
        verbs: ["get", "list", "create", "delete"] }
    ]
  };
}
