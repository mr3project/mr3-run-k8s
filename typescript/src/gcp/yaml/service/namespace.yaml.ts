import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.service !== undefined);

  return {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name: env.service.namespace
    }
  };
}
