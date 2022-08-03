import * as state from '../state';
import { expand } from '../util-fs';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.apache.apacheConfigMap,
      namespace: env.basics.namespace
    },
    data: {
      [env.consts.apache.apacheConf]: expand('./server/apache-resources/httpd.conf', s)
    }
  };
}
