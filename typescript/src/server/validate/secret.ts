import { T, keytabSizeLimit, storeSizeLimit } from '../api/secret';
export type { T };
import * as consts from '../../consts';
import * as basics from '../api/basics';
import * as metastore from '../api/metastore';
import * as hive from '../api/hive';
import * as worker from '../api/worker';
import * as ranger from '../api/ranger';
import * as timeline from '../api/timeline';
import * as superset from '../api/superset';
import * as docker from '../api/docker';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, trimString, containsEmptyStringOnly } from '../../helper';

interface Parameter {
  hiveKerberos: boolean;
  hiveUseRanger: boolean;
  hiveEnableSsl: boolean;
  workerShuffleSsl: boolean;
  rangerKerberos: boolean;
  timelineKerberos: boolean;
  supersetEnableSsl: boolean;
  s3EnvVar: boolean;
}

export function check(input: OptionalFields<T>,
    consts: consts.T,
    basics: basics.T,
    metastore: metastore.T,
    hive: hive.T,
    worker: worker.T,
    ranger: ranger.T,
    timeline: timeline.T,
    superset: superset.T,
    docker: docker.T): CheckResult[] {
  let accum: CheckResult[] = [];

  const parameter: Parameter = {
    hiveKerberos: hive.authentication === "KERBEROS",
    hiveUseRanger: hive.authorization === "RangerHiveAuthorizerFactory",
    hiveEnableSsl:
      hive.enableSsl || hive.enableSslInternal ||
      metastore.enableMetastoreDatabaseSsl ||
      ranger.enableRangerDatabaseSsl,
    workerShuffleSsl: worker.enableShuffleSsl,
    rangerKerberos: hive.authorization === "RangerHiveAuthorizerFactory" && hive.authentication === "KERBEROS",
    timelineKerberos: timeline.timelineEnabled && timeline.enableKerberos,
    supersetEnableSsl: superset.supersetEnabled && superset.enableSsl,
    s3EnvVar: basics.s3aCredentialProvider === "EnvironmentVariable"
  };

  checkRequiredType(accum, input); 
  checkEmptyString(accum, input as T, parameter, consts, basics);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T, consts, basics, hive, worker, timeline, superset, docker, parameter);

  return accum;
}

function checkRequiredType(
    accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T, parameter: Parameter,
    consts: consts.T, basics: basics.T) {
  accumAssert(accum,
    !(parameter.hiveKerberos) ||
      !isEmptyString(input.kerberosSecret?.server?.keytab),
    "Public Service Keytab is mandatory.",
    ['kerberosSecret', 'server', 'keytab']);
  accumAssert(accum,
    !(parameter.hiveKerberos) ||
      !isEmptyString(input.kerberosSecret?.server?.principal),
    "Public Service Principal is mandatory.",
    ['kerberosSecret', 'server', 'principal']);

  accumAssert(accum,
    !(parameter.hiveKerberos || parameter.timelineKerberos) ||
      !isEmptyString(input.kerberosSecret?.server?.keytabInternal),
    "Internal Service Keytab is mandatory.",
    ['kerberosSecret', 'server', 'keytabInternal']);
  accumAssert(accum,
    !(parameter.hiveKerberos || parameter.timelineKerberos) ||
      !isEmptyString(input.kerberosSecret?.server?.principalInternal),
    "Internal Service Principal is mandatory.",
    ['kerberosSecret', 'server', 'principalInternal']);

  accumAssert(accum,
    !(parameter.rangerKerberos && parameter.hiveUseRanger) ||
      !isEmptyString(input.kerberosSecret?.ranger?.spnego?.keytab),
    "Spnego Service Keytab is mandatory.",
    ['kerberosSecret', 'ranger', 'spnego', 'keytab']);
  accumAssert(accum,
    !(parameter.rangerKerberos && parameter.hiveUseRanger) ||
      !isEmptyString(input.kerberosSecret?.ranger?.spnego?.principal),
    "Spnego Service Principal is mandatory.",
    ['kerberosSecret', 'ranger', 'spnego', 'principal']);

  accumAssert(accum,
    !(parameter.rangerKerberos && parameter.hiveUseRanger) ||
      !isEmptyString(input.kerberosSecret?.ranger?.admin?.keytab),
    "Admin Service Keytab is mandatory.",
    ['kerberosSecret', 'ranger', 'admin', 'keytab']);
  accumAssert(accum,
    !(parameter.rangerKerberos && parameter.hiveUseRanger) ||
      !isEmptyString(input.kerberosSecret?.ranger?.admin?.principal),
    "Admin Service Principal is mandatory.",
    ['kerberosSecret', 'ranger', 'admin', 'principal']);

  accumAssert(accum,
    !(parameter.rangerKerberos && parameter.hiveUseRanger) ||
      !isEmptyString(input.kerberosSecret?.ranger?.lookup?.keytab),
    "Lookup Keytab is mandatory.",
    ['kerberosSecret', 'ranger', 'lookup', 'keytab']);
  accumAssert(accum,
    !(parameter.rangerKerberos && parameter.hiveUseRanger) ||
      !isEmptyString(input.kerberosSecret?.ranger?.lookup?.principal),
    "Lookup Principal is mandatory.",
    ['kerberosSecret', 'ranger', 'lookup', 'principal']);

  accumAssert(accum,
    !parameter.hiveEnableSsl ||
      !isEmptyString(input.ssl?.keystore),
    "Keystore is mandatory.",
    ['ssl', 'keystore']);
  accumAssert(accum,
    !parameter.hiveEnableSsl ||
      !isEmptyString(input.ssl?.truststore),
    "Truststore is mandatory.",
    ['ssl', 'truststore']);
  accumAssert(accum,
    !parameter.hiveEnableSsl ||
      !isEmptyString(input.ssl?.password),
    "Password is mandatory.",
    ['ssl', 'password']);

  accumAssert(accum,
    !parameter.workerShuffleSsl ||
      !isEmptyString(input.shuffleSsl?.keystore),
    "Keystore is mandatory.",
    ['shuffleSsl', 'keystore']);
  accumAssert(accum,
    !parameter.workerShuffleSsl ||
      !isEmptyString(input.shuffleSsl?.truststore),
    "Truststore is mandatory.",
    ['shuffleSsl', 'truststore']);
}
  
function checkStringTuple(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(input.kerberosSecret?.user !== undefined) ||
      !(isEmptyString(input.kerberosSecret?.user?.keytab) &&
        !isEmptyString(input.kerberosSecret?.user?.principal)),
    "User Keytab should also be specified.",
    ['kerberosSecret', 'user', 'keytab']);
  accumAssert(accum,
    !(input.kerberosSecret?.user !== undefined) ||
      !(!isEmptyString(input.kerberosSecret?.user?.keytab) &&
        isEmptyString(input.kerberosSecret?.user?.principal)),
    "User Principal should also be specified.",
    ['kerberosSecret', 'user', 'principal']);

  accumAssert(accum,
    !(input.spark !== undefined) ||
      !(isEmptyString(input.spark.keytab) &&
        !isEmptyString(input.spark.principal)),
    "Spark user Keytab should also be specified.",
    ['spark', 'keytab']);
  accumAssert(accum,
    !(input.spark !== undefined) ||
      !(!isEmptyString(input.spark?.keytab) &&
        isEmptyString(input.spark?.principal)),
    "Spark user Principal should also be specified.",
    ['spark', 'principal']);
}

function checkInvariants(accum: CheckResult[], input: T,
    consts: consts.T,
    basics: basics.T,
    hive: hive.T,
    worker: worker.T,
    timeline: timeline.T, superset: superset.T,
    docker: docker.T,
    parameter: Parameter) {
  if (input.secretEnvVars !== undefined) {
    input.secretEnvVars.forEach((nameValue, index) => {
      accumAssert(accum,
        !isEmptyString(nameValue?.name),
        "Name is mandatory.",
        ['secretEnvVars', index.toString(), 'name']);
      accumAssert(accum,
        !isEmptyString(nameValue?.value),
        "Value is mandatory.",
        ['secretEnvVars', index.toString(), 'value']);
    });
  }

  // check contents

  accumAssert(accum,
    !(input.kerberosSecret !== undefined && !isEmptyString(input.kerberosSecret.server.keytab)) ||
      !isEmptyString(input.kerberosSecret.server.data),
    "Public Service Keytab File should not be empty.",
    ['kerberosSecret', 'server', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret !== undefined && !isEmptyString(input.kerberosSecret.server.keytabInternal)) ||
      !isEmptyString(input.kerberosSecret.server.dataInternal),
    "Internal Service Keytab File should not be empty.",
    ['kerberosSecret', 'server', 'keytabInternal']);

  accumAssert(accum,
    !(input.kerberosSecret !== undefined && !isEmptyString(input.kerberosSecret.user?.keytab)) ||
      !isEmptyString(input.kerberosSecret.user?.data),
    "User Keytab File should not be empty.",
    ['kerberosSecret', 'user', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret !== undefined && !isEmptyString(input.kerberosSecret.ranger?.spnego.keytab)) ||
      !isEmptyString(input.kerberosSecret.ranger?.spnego.data),
    "Spnego Service Keytab File should not be empty.",
    ['kerberosSecret', 'ranger', 'spnego', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret !== undefined && !isEmptyString(input.kerberosSecret.ranger?.admin.keytab)) ||
      !isEmptyString(input.kerberosSecret.ranger?.admin.data),
    "Admin Service Keytab File should not be empty.",
    ['kerberosSecret', 'ranger', 'admin', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret !== undefined && !isEmptyString(input.kerberosSecret.ranger?.lookup.keytab)) ||
      !isEmptyString(input.kerberosSecret.ranger?.lookup.data),
    "Lookup Keytab File should not be empty.",
    ['kerberosSecret', 'ranger', 'lookup', 'keytab']);

  accumAssert(accum,
    !(input.ssl !== undefined && !isEmptyString(input.ssl.keystore)) ||
      !isEmptyString(input.ssl.keystoreData),
    "Keystore File should not be empty.",
    ['ssl', 'keystore']);

  accumAssert(accum,
    !(input.ssl !== undefined && !isEmptyString(input.ssl.truststore)) ||
      !isEmptyString(input.ssl.truststoreData),
    "Truststore File should not be empty.",
    ['ssl', 'truststore']);

  accumAssert(accum,
    !(input.shuffleSsl !== undefined && !isEmptyString(input.shuffleSsl.keystore)) ||
      !isEmptyString(input.shuffleSsl.keystoreData),
    "Keystore File should not be empty.",
    ['shuffleSsl', 'keystore']);

  accumAssert(accum,
    !(input.shuffleSsl !== undefined && !isEmptyString(input.shuffleSsl.truststore)) ||
      !isEmptyString(input.shuffleSsl.truststoreData),
    "Truststore File should not be empty.",
    ['shuffleSsl', 'truststore']);

  // check extension

  accumAssert(accum,
    !(!isEmptyString(input.ssl?.keystore) && input.ssl !== undefined) ||
      input.ssl.keystore.trim().endsWith("jceks"),
    "Keystore File should have an extension " + `"jceks"` + ".",
    ['ssl', 'keystore']);

  accumAssert(accum,
    !(!isEmptyString(input.ssl?.truststore) && input.ssl !== undefined) ||
      input.ssl.truststore.trim().endsWith("jks"),
    "Truststore File should have an extension " + `"jks"` + ".",
    ['ssl', 'truststore']);

  // originally from validate() 

  accumAssert(accum,
    !hive.secureMode || input.kerberosSecret !== undefined,
    "Hive Kerberos is mandatory.",
    ['kerberosSecret', 'server', 'keytab']);

  accumAssert(accum,
    !(parameter.hiveUseRanger && parameter.rangerKerberos) ||
      input.kerberosSecret?.ranger !== undefined,
    "Ranger Kerberos is mandatory.",
    ['kerberosSecret', 'ranger', 'spnego', 'keytab']);

  accumAssert(accum,
    !(parameter.hiveEnableSsl || (basics.s3aEnableSsl !== undefined && basics.s3aEnableSsl)) ||
      input.ssl !== undefined,
    "Hive SSL is mandatory.",
    ['ssl', 'keystore']);

  accumAssert(accum,
    !parameter.timelineKerberos || input.kerberosSecret !== undefined,
    "MR3-UI Kerberos is mandatory.",
    ['kerberosSecret', 'server', 'keytab']);

  accumAssert(accum,
    !worker.enableShuffleSsl || input.shuffleSsl !== undefined,
    "Shuffle Handler SSL is mandatory.",
    ['shuffleSsl', 'keystore']);

  accumAssert(accum,
    !(basics.s3aCredentialProvider !== undefined &&
      basics.s3aCredentialProvider === "EnvironmentVariable") || 
      input.secretEnvVars.map(p => p.name.trim()).includes("AWS_ACCESS_KEY_ID"),
    "AWS_ACCESS_KEY_ID should be defined.",
    ['secretEnvVars', '0', 'any']);   // 'any' does not have a corresponding input field

  accumAssert(accum,
    !(basics.s3aCredentialProvider !== undefined &&
      basics.s3aCredentialProvider === "EnvironmentVariable") || 
      input.secretEnvVars.map(p => p.name.trim()).includes("AWS_SECRET_ACCESS_KEY"),
    "AWS_SECRET_ACCESS_KEY should be defined.",
    ['secretEnvVars', '0', 'any']);   // 'any' does not have a corresponding input field

  if (parameter.hiveKerberos &&
      input.kerberosSecret !== undefined &&
      basics.kerberos !== undefined) {
    const kerberosSecretDomain = basics.hiveserver2IpHostname;
    const kerberosSecretDomainInternal =
      `${consts.name.hive.serviceInternal}.${basics.namespace}.svc.cluster.local`;

    if (!isEmptyString(docker.docker.user) &&
        !isEmptyString(basics.kerberos.realm)) {
      const principal = 
        `${docker.docker.user}/${kerberosSecretDomain}@${basics.kerberos.realm}`;
      const principalInternal = 
        `${docker.docker.user}/${kerberosSecretDomainInternal}@${basics.kerberos.realm}`;

      accumAssert(accum,
        input.kerberosSecret.server.principal.trim() === principal,
        "Public Service Principal should be " + principal + ".",
        ['kerberosSecret', 'server', 'principal']);
      accumAssert(accum,
        input.kerberosSecret.server.principalInternal.trim() === principalInternal,
        "Internal Service Principal should be " + principalInternal + ".",
        ['kerberosSecret', 'server', 'principalInternal']);
    } else {
      accumAssert(accum,
        input.kerberosSecret.server.principal.trim().startsWith(docker.docker.user),
        "The primary of Public Service Principal should match Docker user (" + docker.docker.user + ").",
        ['kerberosSecret', 'server', 'principal']);
      accumAssert(accum,
        input.kerberosSecret.server.principal.trim().endsWith(basics.kerberos.realm),
        "The realm of Public Service Principal should match Kerberos Realm (" + basics.kerberos.realm + ").",
        ['kerberosSecret', 'server', 'principal']);
      accumAssert(accum,
        input.kerberosSecret.server.principal.includes("/" + kerberosSecretDomain + "@"),
        "Public Service Principal should use " + (isEmptyString(kerberosSecretDomain) ? "???" : kerberosSecretDomain) + " for its instance.",
        ['kerberosSecret', 'server', 'principal']);

      accumAssert(accum,
        input.kerberosSecret.server.principalInternal.trim().startsWith(docker.docker.user),
        "The primary of Internal Service Principal should match Docker user (" + docker.docker.user + ").",
        ['kerberosSecret', 'server', 'principalInternal']);
      accumAssert(accum,
        input.kerberosSecret.server.principalInternal.trim().endsWith(basics.kerberos.realm),
        "The realm of Internal Service Principal should match Kerberos Realm (" + basics.kerberos.realm + ").",
        ['kerberosSecret', 'server', 'principalInternal']);
      accumAssert(accum,
        input.kerberosSecret.server.principalInternal.includes("/" + kerberosSecretDomainInternal + "@"),
        "Internal Service Principal should use " + kerberosSecretDomainInternal + " for its instance.",
        ['kerberosSecret', 'server', 'principalInternal']);
    }

    if (!isEmptyString(basics.kerberos.realm) &&
        input.kerberosSecret.user !== undefined && 
        !isEmptyString(input.kerberosSecret.user.principal)) {
      accumAssert(accum,
        input.kerberosSecret.user.principal.trim().endsWith("@" + basics.kerberos.realm) &&
        !input.kerberosSecret.user.principal.trim().startsWith("@"),
        "The realm of User Principal should match Kerberos Realm (" + basics.kerberos.realm + ").",
        ['kerberosSecret', 'user', 'principal']);
    }
  }

  if (parameter.hiveUseRanger && parameter.rangerKerberos &&
      input.kerberosSecret !== undefined &&
      input.kerberosSecret.ranger !== undefined &&
      basics.kerberos !== undefined) {
    const kerberosSecretRangerDomain =
      `${consts.name.ranger.service}.${basics.namespace}.svc.cluster.local`;
    const realmString = !isEmptyString(basics.kerberos.realm) ? basics.kerberos.realm : "???";

    accumAssert(accum,
      input.kerberosSecret.ranger.spnego.principal.trim() ===
        "HTTP/" + kerberosSecretRangerDomain + "@" + basics.kerberos.realm,
      "Spnego Service Principal should be " +
        "HTTP/" + kerberosSecretRangerDomain + "@" + realmString + ".",
      ['kerberosSecret', 'ranger', 'spnego', 'principal']);
    accumAssert(accum,
      input.kerberosSecret.ranger.admin.principal.trim() ===
        "rangeradmin/" + kerberosSecretRangerDomain + "@" + basics.kerberos.realm,
      "Admin Service Principal should be " +
        "rangeradmin/" + kerberosSecretRangerDomain + "@" + realmString + ".",
      ['kerberosSecret', 'ranger', 'admin', 'principal']);
    accumAssert(accum,
      input.kerberosSecret.ranger.lookup.principal.trim() ===
        "rangerlookup" + "@" + basics.kerberos.realm,
      "Lookup Principal should be " +
        "rangerlookup" + "@" + realmString + ".",
      ['kerberosSecret', 'ranger', 'lookup', 'principal']);
  }

  if (input.spark !== undefined &&
      basics.kerberos !== undefined &&
      !isEmptyString(input.spark.principal)) {
    accumAssert(accum,
      input.spark.principal.trim().endsWith("@" + basics.kerberos.realm) &&
      !input.spark.principal.trim().startsWith("@"),
      "The realm of Spark User Principal should match Kerberos Realm (" + basics.kerberos.realm + ").",
      ['spark', 'principal']);
  }

  // check the size of data

  accumAssert(accum,
    !(input.kerberosSecret?.server.data !== undefined) ||
      input.kerberosSecret.server.data.length < keytabSizeLimit,
    "Public Service Keytab is too large.",
    ['kerberosSecret', 'server', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret?.server.dataInternal !== undefined) ||
      input.kerberosSecret.server.dataInternal.length < keytabSizeLimit,
    "Internal Service Keytab is too large.",
    ['kerberosSecret', 'server', 'keytabInternal']);

  accumAssert(accum,
    !(input.kerberosSecret?.user?.data !== undefined) ||
      input.kerberosSecret.user.data.length < keytabSizeLimit,
    "User Keytab is too large.",
    ['kerberosSecret', 'user', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret?.ranger?.spnego.data !== undefined) ||
      input.kerberosSecret?.ranger?.spnego.data.length < keytabSizeLimit,
    "Spengo Service Keytab is too large.",
    ['kerberosSecret', 'ranger', 'spnego', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret?.ranger?.admin.data !== undefined) ||
      input.kerberosSecret?.ranger?.admin.data.length < keytabSizeLimit,
    "Admin Service Keytab is too large.",
    ['kerberosSecret', 'ranger', 'admin', 'keytab']);

  accumAssert(accum,
    !(input.kerberosSecret?.ranger?.lookup.data !== undefined) ||
      input.kerberosSecret?.ranger?.lookup.data.length < keytabSizeLimit,
    "Lookup Keytab is too large.",
    ['kerberosSecret', 'ranger', 'lookup', 'keytab']);

  accumAssert(accum,
    !(input.spark?.data !== undefined) ||
      input.spark.data.length < keytabSizeLimit,
    "Spark User Keytab is too large.",
    ['spark', 'keytab']);

  accumAssert(accum,
    !(input.ssl?.keystoreData !== undefined) ||
      input.ssl?.keystoreData.length < storeSizeLimit,
    "Keystore is too large.",
    ['ssl', 'keystore']);

  accumAssert(accum,
    !(input.ssl?.truststoreData !== undefined) ||
      input.ssl?.truststoreData.length < storeSizeLimit,
    "Truststore is too large.",
    ['ssl', 'truststore']);

  accumAssert(accum,
    !(input.shuffleSsl?.keystoreData !== undefined) ||
      input.shuffleSsl?.keystoreData.length < storeSizeLimit,
    "Keystore is too large.",
    ['shuffleSsl', 'keystore']);

  accumAssert(accum,
    !(input.shuffleSsl?.truststoreData !== undefined) ||
      input.shuffleSsl?.truststoreData.length < storeSizeLimit,
    "Truststore is too large.",
    ['shuffleSsl', 'truststore']);
}

export function validate(
    input: T, consts: consts.T, basics: basics.T, metastore: metastore.T, hive: hive.T, worker: worker.T,
    ranger: ranger.T, timeline: timeline.T, superset: superset.T, docker: docker.T): T {
  const checkResult = check(input, consts, basics, metastore, hive, worker, ranger, timeline, superset, docker);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));
  
  const copy = { ...input };
  trimString(copy);
  if (copy.kerberosSecret !== undefined && containsEmptyStringOnly(copy.kerberosSecret)) {
    copy.kerberosSecret = undefined;
  }
  if (copy.spark !== undefined && containsEmptyStringOnly(copy.spark)) {
    copy.spark = undefined;
  }
  if (copy.ssl !== undefined && containsEmptyStringOnly(copy.ssl)) {
    copy.ssl = undefined;
  }
  if (copy.shuffleSsl !== undefined && containsEmptyStringOnly(copy.shuffleSsl)) {
    copy.shuffleSsl = undefined;
  }

  copy.createSecret = copy.kerberosSecret !== undefined || copy.spark !== undefined || copy.ssl !== undefined || copy.shuffleSsl !== undefined;
  copy.truststoreType = "jks";

  copy.keystorePath = copy.ssl !== undefined ? consts.dir.keytab + "/" + copy.ssl.keystore : "";
  copy.keystorePathFull = copy.ssl !== undefined ? "localjceks://file" + copy.keystorePath : "";
  copy.truststorePath = copy.ssl !== undefined ? consts.dir.keytab + "/" + copy.ssl.truststore : "";
  copy.rangerKeystorePath = copy.ssl !== undefined ? consts.dir.rangerKeytab + "/" + copy.ssl.keystore : "";
  copy.rangerTruststorePath = copy.ssl !== undefined ? consts.dir.rangerKeytab + "/" + copy.ssl.truststore : "";
  copy.timelineKeystorePath = copy.ssl !== undefined ? consts.dir.timelineKeytab + "/" + copy.ssl.keystore : "";
  copy.timelineTruststorePath = copy.ssl !== undefined ? consts.dir.timelineKeytab + "/" + copy.ssl.truststore : "";

  copy.sslPassword = copy.ssl !== undefined ? copy.ssl.password : "";

  copy.shuffleKeystorePath = copy.shuffleSsl !== undefined ? consts.dir.keytab + "/" + copy.shuffleSsl.keystore : "";
  copy.shuffleTruststorePath = copy.shuffleSsl !== undefined ? consts.dir.keytab + "/" + copy.shuffleSsl.truststore : "";

  copy.envVarSeq = copy.secretEnvVars.map(p => p.name).join(",");
  copy.envVarDefs = copy.secretEnvVars.map(p => `export ${p.name}=${p.value}`).join("\n");

  copy.masterLaunchCmdOpts = "";
  if (hive.enableSslInternal || (basics.s3aEnableSsl !== undefined && basics.s3aEnableSsl) || basics.warehouseDir.startsWith("hdfs")) {
    const s = `-Djavax.net.ssl.trustStore=${copy.truststorePath} -Djavax.net.ssl.trustStoreType=${copy.truststoreType} `;
    copy.masterLaunchCmdOpts += s;
  }
  // if warehouseDir.startsWith("s3a"), do not set because of internal secure connections to S3 (Cf. docs/k8s/eks/configure-hive/)

  copy.containerLaunchCmdOpts = "";
  if (hive.enableSslInternal || (basics.s3aEnableSsl !== undefined && basics.s3aEnableSsl) || basics.warehouseDir.startsWith("hdfs")) {
    const s = `-Djavax.net.ssl.trustStore=${copy.truststorePath} -Djavax.net.ssl.trustStoreType=${copy.truststoreType} `;
    copy.containerLaunchCmdOpts += s;
  }
  // if warehouseDir.startsWith("s3a"), do not set because of internal secure connections to S3 (Cf. docs/k8s/eks/configure-hive/)
  copy.containerLaunchCmdOpts += worker.useSoftReference ? "-XX:SoftRefLRUPolicyMSPerMB=25" : "";

  if (hive.authorization === "RangerHiveAuthorizerFactory") {
    if (hive.secureMode && copy.kerberosSecret !== undefined && copy.kerberosSecret.ranger !== undefined) {
      const kerberosSecretRangerDomain =
        `${consts.name.ranger.service}.${basics.namespace}.svc.cluster.local`;
      copy.solrAuthenticationOption =
        `-Djava.security.auth.login.config=${consts.dir.rangerConf}/solr-jgss.conf ` +
        `-Djava.security.krb5.conf=${consts.dir.rangerConf}/krb5.conf ` +
        `-Dsolr.kerberos.cookie.domain=${kerberosSecretRangerDomain} ` +
        `-Dsolr.kerberos.principal=${copy.kerberosSecret.ranger.spnego.principal} ` +
        `-Dsolr.kerberos.keytab=${consts.dir.rangerKeytab}/${copy.kerberosSecret.ranger.spnego.keytab}`
    } else {
      copy.solrAuthenticationOption = "-Dbasicauth=solr:solrRocks"
    }
  }

  copy.sparkUser = copy.spark !== undefined ? copy.spark.principal.trim().split("@")[0] : '';

  return copy;
}

export function initial(): T {
  return {
    secretEnvVars: [
    ]
  };
}
