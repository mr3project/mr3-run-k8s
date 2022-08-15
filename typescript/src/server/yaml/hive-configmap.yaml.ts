import * as state from '../state';
import { expand, expandAppend } from '../util-fs';

export function build(s: state.T) {
  const env = s.env;
  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.name.hive.configMap,
      namespace: env.basics.namespace
    },
    data: {
      ['hive-site.xml']: expandAppend('./server/resources/hive-site.xml', './server/resources/hive-site.xml.append', s),
      ['hplsql-site.xml']: expand('./server/resources/hplsql-site.xml', s),
      ['mr3-site.xml']: expand('./server/resources/mr3-site.xml', s),
      ['tez-site.xml']: expand('./server/resources/tez-site.xml', s),
      ['core-site.xml']: expandAppend('./server/resources/core-site.xml', './server/resources/core-site.xml.append', s),
      ['yarn-site.xml']: expand('./server/resources/yarn-site.xml', s),
      ['hadoop-metrics2-s3a-file-system.properties']: expand('./server/resources/hadoop-metrics2-s3a-file-system.properties', s),
      ['hive-log4j2.properties']: expand('./server/resources/hive-log4j2.properties', s),
      ['jgss.conf']: expand('./server/resources/jgss.conf', s),
      ['krb5.conf']: expand('./server/resources/krb5.conf', s),
      ['ranger-hive-audit.xml']: expand('./server/resources/ranger-hive-audit.xml', s),
      ['ranger-hive-security.xml']: expand('./server/resources/ranger-hive-security.xml', s),
      ['ranger-policymgr-ssl.xml']: expand('./server/resources/ranger-policymgr-ssl.xml', s)
    }
  };
}
