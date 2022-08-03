import * as state from '../state';
import * as util from '../util';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.consts.create.serviceAccount);
  return {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      name: env.consts.name.mr3.sparkWorkerServiceAccount,
      namespace: env.basics.namespace,
      annotations: util.createSparkServiceAccountAnnotations(s)
    }
  };
}
