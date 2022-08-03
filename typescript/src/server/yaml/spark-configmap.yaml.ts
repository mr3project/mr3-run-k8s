import * as state from '../state';
import { expand } from '../util-fs';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.name.spark.configMap,
      namespace: env.basics.namespace
    },
    data: {
      ['spark-defaults.conf']: expand('./server/spark-resources/spark-defaults.conf', s),
      ['mr3-site.xml']: expand('./server/spark-resources/mr3-site.xml', s),
      ['core-site.xml']: expand('./server/spark-resources/core-site.xml', s),
      ['hive-site.xml']: expand('./server/spark-resources/hive-site.xml', s),
      ['log4j.properties']: expand('./server/spark-resources/log4j.properties', s),
      ['jgss.conf']: expand('./server/spark-resources/jgss.conf', s),
      ['krb5.conf']: expand('./server/spark-resources/krb5.conf', s)
    }
  };
}
