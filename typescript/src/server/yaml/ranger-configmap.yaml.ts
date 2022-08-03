import * as state from '../state';
import { expand, read } from '../util-fs';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.hive.authorization === "RangerHiveAuthorizerFactory" && s.env.ranger.kind === "internal");
  const env = s.env;
  const rangerEnableKerberos = env.hive.authentication === "KERBEROS";

  return {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: env.consts.name.ranger.configMap,
      namespace: env.basics.namespace
    },
    data: {
      ['core-site.xml']: expand('./server/ranger-resources/core-site.xml', s),
      ['krb5.conf']: expand('./server/ranger-resources/krb5.conf', s),
      ['solr-security.json']: rangerEnableKerberos ? expand('./server/ranger-resources/solr-security.json', s) : read('./server/ranger-resources/solr-security.json.basic', s),
      ['solr-jgss.conf']: expand('./server/ranger-resources/solr-jgss.conf', s),
      ['ranger-admin-site.xml.append']: expand('./server/ranger-resources/ranger-admin-site.xml.append', s),
      ['ranger-log4j.properties']: read('./server/ranger-resources/ranger-log4j.properties', s),
      ['solr-core.properties']: read('./server/ranger-resources/solr-core.properties', s),
      ['solr-elevate.xml']: read('./server/ranger-resources/solr-elevate.xml', s),
      ['solr-log4j2.xml']: read('./server/ranger-resources/solr-log4j2.xml', s),
      ['solr-managed-schema']: read('./server/ranger-resources/solr-managed-schema', s),
      ['solr-solrconfig.xml']: read('./server/ranger-resources/solr-solrconfig.xml', s),
      ['solr-solr.xml']: read('./server/ranger-resources/solr-solr.xml', s)
    }
  };
}
