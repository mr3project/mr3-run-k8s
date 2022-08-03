import { T, RangerInternal } from '../api/ranger';
export type { T, RangerInternal };
import * as basics from '../api/basics';
import * as hive from '../api/hive';
import * as consts from '../../consts';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber, trimString, resetStringUndefined } from '../../helper';

//
// Drivers should match:
//  1. files copied to mr3-run/kubernetes/ranger/lib
//  2. file copied by mr3-run/kubernetes/ranger/start-ranger.sh
//
const connectionDriverMap: { [key: string]: string } = {
  MYSQL: "mysql-connector-java-8.0.28.jar",
  POSTGRES: "postgresql-42.3.2.jar",
  MSSQL: "mssql-jdbc-10.2.0.jre8.jar",
  ORACLE: "ojdbc6.jar"
};

export function check(input: OptionalFields<RangerInternal>, hive: hive.T): CheckResult[] {
  let accum: CheckResult[] = [];

  if (hive.authorization === "RangerHiveAuthorizerFactory") {
    checkRequiredType(accum, input);
    checkEmptyString(accum, input as RangerInternal);
    checkStringTuple(accum, input as RangerInternal);
    checkInvariants(accum, input as RangerInternal);
  }

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<RangerInternal>) {
}

function checkEmptyString(accum: CheckResult[], input: RangerInternal) {
  accumAssert(accum,
    !isEmptyString(input.service),
    "Ranger Service for Hive is mandatory.",
    'service');

  accumAssert(accum,
    !isEmptyString(input.dbRootUser),
    "Database Account ID is mandatory.",
    'dbRootUser');

  accumAssert(accum,
    !isEmptyString(input.dbRootPassword),
    "Database Account Password is mandatory.",
    'dbRootPassword');

  accumAssert(accum,
    !isEmptyString(input.dbHost),
    "Database Address Host is mandatory.",
    'dbHost');

  accumAssert(accum,
    !isEmptyString(input.dbPassword),
    "Ranger Password is mandatory.",
    'dbPassword');

  accumAssert(accum,
    !isEmptyString(input.adminPassword),
    "Administrator Password is mandatory.",
    'adminPassword');
}

function checkStringTuple(accum: CheckResult[], input: RangerInternal) {
}

function checkInvariants(accum: CheckResult[], input: RangerInternal) {
  // TODO: not sure why isValidPositiveNumber(input.resources.cpu) does not work.
  // note that calling register("resources") in useEffect() of ranger.tsx does not fix the problem.
  // as a temporary fix, we use input.resources?.cpu.
  accumAssert(accum,
    isValidPositiveNumber(input.resources?.cpu),
    "A valid value should be specified for the number of CPUs.",
    ['resources', 'cpu']);
  accumAssert(accum,
    isValidPositiveNumber(input.resources?.memoryInMb) && input.resources.memoryInMb >= 512,
    "The memory size should be valid and at least 512MB.",
    ['resources', 'memoryInMb']);
}

export function validate(input: T, consts: consts.T, basics: basics.T, hive: hive.T): T {
  if (input.kind == "internal") {
    const checkResult = check(input, hive);
    assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));
  }

  const copy = { ... input };
  assert(copy.kind === "internal");

  trimString(copy);
  resetStringUndefined(copy, 'databaseHost');

  copy.enableKerberos = hive.authentication === "KERBEROS";

  let address: string;
  copy.adminPort = hive.enableSslInternal ? consts.ranger.httpsPort : consts.ranger.httpPort;
  address = consts.name.ranger.service + '.' + basics.namespace + '.svc.cluster.local';
  copy.connectionDriver = consts.dir.lib + "/" + connectionDriverMap[copy.dbFlavor];

  const header = hive.enableSslInternal ? "https" : "http";
  copy.adminUrl = `${header}://${address}:${copy.adminPort}`
  copy.auditUrl = `${header}://${address}:${consts.ranger.auditPort}`

  copy.httpUrl = `http://${address}:${consts.ranger.httpPort}`;

  return copy;
}

export function initial(): RangerInternal {
  return {
    kind: "internal",
    service: "hive",
    resources: {
      cpu: 0,
      memoryInMb: 0
    },
    dbFlavor: "MYSQL",
    dbRootUser: "",
    dbRootPassword: "",
    dbHost: "",
    dbPassword: "",
    enableRangerDatabaseSsl: false,
    adminPassword: "",
    authentication: "NONE"
  };
}
