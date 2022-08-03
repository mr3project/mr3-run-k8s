import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.eks !== undefined);
  assert(env.service !== undefined);
  assert(env.efs !== undefined);

  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      namespace: env.service.namespace, 
      name: "efs-provisioner"
    },
    data: {
      ['file.system.id']: env.efs.efsId,
      ['aws.region']: env.eks.region,
      ['provisioner.name']: "example.com/aws-efs",
      ['dns.name']: ""
    }
  };
}
