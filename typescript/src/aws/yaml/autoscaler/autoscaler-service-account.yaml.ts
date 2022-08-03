import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  return {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      labels: {
        ['k8s-addon']: "cluster-autoscaler.addons.k8s.io",
        ['k8s-app']: "cluster-autoscaler"
      },
      name: "cluster-autoscaler",
      namespace: "kube-system"
    }
  };
}
