import * as state from '../state';
import { expand, read } from '../util-fs';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.timeline.timelineEnabled); 
  const env = s.env;

  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.name.timeline.configMap,
      namespace: env.basics.namespace
    },
    data: {
      ['configs.env']: expand('./server/ats-resources/configs.env', s),
      ['core-site.xml']: expand('./server/ats-resources/core-site.xml', s),
      ['krb5.conf']: expand('./server/ats-resources/krb5.conf', s),
      ['ssl-server.xml']: expand('./server/ats-resources/ssl-server.xml', s),
      ['yarn-site.xml']: expand('./server/ats-resources/yarn-site.xml', s),
      ['defaults.ini']: expand('./server/ats-resources/defaults.ini', s),
      ['log4j.properties']: read('./server/ats-resources/log4j.properties', s),
      ['prometheus.yml']: expand('./server/ats-resources/prometheus.yml', s),
      ['mr3.yaml']: expand('./server/ats-resources/mr3.yaml', s),
      ['mr3dashboard.yaml']: read('./server/ats-resources/mr3dashboard.yaml', s),
      ['mr3.json']: read('./server/ats-resources/mr3.json', s),
      ['mr3spark.json']: read('./server/ats-resources/mr3spark.json', s)
    }
  };
}
