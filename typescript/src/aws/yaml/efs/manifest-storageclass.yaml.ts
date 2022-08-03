import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  return {
    kind: "StorageClass",
    apiVersion: "storage.k8s.io/v1",
    metadata: {
      name: "aws-efs"
    },
    provisioner: "example.com/aws-efs"
  };
}
