import * as state from '../state';
import { expand, read } from '../util-fs';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.name.superset.configMap,
      namespace: env.basics.namespace
    },
    data: {
      ['config.sh']: expand('./server/superset-resources/config.sh', s),
      ['krb5.conf']: expand('./server/superset-resources/krb5.conf', s),
      ['env.sh']: expand('./server/superset-resources/env.sh', s)
    }
  };
}
