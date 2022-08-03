import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.service !== undefined);

  return {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      namespace: env.service.namespace,
      name: "efs-provisioner"
    }
  };
}
