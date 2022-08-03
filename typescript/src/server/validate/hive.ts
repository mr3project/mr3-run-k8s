import { T } from '../api/hive';
export type { T };
import * as basics from './basics';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber, trimString, resetKeyValueUndefined, containsEmptyStringOnly } from '../../helper';

const authenticatorMap: { [key: string]: string } = {
  HadoopDefaultAuthenticator: "org.apache.hadoop.hive.ql.security.HadoopDefaultAuthenticator",
  ProxyUserAuthenticator: "org.apache.hadoop.hive.ql.security.ProxyUserAuthenticator",
  SessionStateUserAuthenticator: "org.apache.hadoop.hive.ql.security.SessionStateUserAuthenticator"
};

const authorizationMap: { [key: string]: string } = {
  SQLStdConfOnlyAuthorizerFactory: "org.apache.hadoop.hive.ql.security.authorization.plugin.sqlstd.SQLStdConfOnlyAuthorizerFactory",
  SQLStdHiveAuthorizerFactory: "org.apache.hadoop.hive.ql.security.authorization.plugin.sqlstd.SQLStdHiveAuthorizerFactory",
  RangerHiveAuthorizerFactory: "org.apache.ranger.authorization.hive.authorizer.RangerHiveAuthorizerFactory"
};

export function check(input: OptionalFields<T>, basics: basics.T): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T, basics); 

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
  accumAssert(accum,
    !(input.authentication === "LDAP") ||
      input.ldap !== undefined,
    "LDAP is missing.",
    "authentication");
}

function checkEmptyString(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(input.authentication === "LDAP") ||
      !isEmptyString(input.ldap?.baseDN),
    "LDAP BaseDN is mandatory.",
    ['ldap', 'baseDN']);

  accumAssert(accum,
    !(input.authentication === "LDAP") ||
      !isEmptyString(input.ldap?.url),
    "LDAP URL is mandatory.",
    ['ldap', 'url']);
}

function checkStringTuple(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(input.serviceAccountAnnotations !== undefined) ||
    !(isEmptyString(input.serviceAccountAnnotations.key) &&
      !isEmptyString(input.serviceAccountAnnotations.value)),
    "Service Account Annotation key should also be specified.",
    ['serviceAccountAnnotations', 'key']);

  accumAssert(accum,
    !(input.serviceAccountAnnotations !== undefined) ||
    !(!isEmptyString(input.serviceAccountAnnotations.key) &&
      isEmptyString(input.serviceAccountAnnotations.value)),
    "Service Account Annotation value should also be specified.",
    ['serviceAccountAnnotations', 'value']);
}

function checkInvariants(accum: CheckResult[], input: T, basics: basics.T) {
  accumAssert(accum,
    isValidPositiveNumber(input.resources.cpu),
    "A valid value should be specified for the number of CPUs.",
    ['resources', 'cpu']);

  accumAssert(accum,
    isValidPositiveNumber(input.resources.memoryInMb) && input.resources.memoryInMb >= 1024,
    "The memory size should be valid and at least 1024MB.",
    ['resources', 'memoryInMb']);

  accumAssert(accum,
    isValidPositiveNumber(input.numInstances) && input.numInstances >= 1,
    "The number of HiveServer2 instances should be valid and at least 1.",
    ['resources', 'numInstances']);

  accumAssert(accum,  
    !(basics.kerberos === undefined ||
      isEmptyString(basics.kerberos.realm) ||
      isEmptyString(basics.kerberos.adminServer) ||
      isEmptyString(basics.kerberos.kdc)) ||
    input.authentication !== "KERBEROS",
    "Kerberos (Realm/Admin Server/KDC) is not specified.",
    'authentication');

  return accum;
}

export function validate(input: T, basics: basics.T): T {
  const checkResult = check(input, basics);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ... input };
  trimString(copy);

  if (input.ldap !== undefined &&
      containsEmptyStringOnly(input.ldap)) {
    input.ldap = undefined;
  }

  resetKeyValueUndefined(copy, 'serviceAccountAnnotations');

  copy.secureMode = copy.authentication == "KERBEROS";

  // ranger.enableKerberos should be set in the same way
  copy.authenticationInternal = copy.authentication == "KERBEROS" ? "KERBEROS" : "NONE";
  copy.secureModeInternal = copy.authenticationInternal == "KERBEROS";  // false if copy.authentication == "LDAP"

  // set to false if SparkSQL fails to connect
  copy.secureModeMetastore = copy.secureModeInternal;

  copy.authenticatorConf = authenticatorMap[input.authenticator];
  copy.authorizationConf = authorizationMap[input.authorization]; 

  return copy;
}

export function initial(): T {
  return {
    resources: {
      cpu: 0,
      memoryInMb: 0
    },
    numInstances: 1,
    authentication: "NONE",
    authenticator: "SessionStateUserAuthenticator",
    authorization: "RangerHiveAuthorizerFactory",
    enableSsl: false,
    enableSslInternal: false
  };
}
