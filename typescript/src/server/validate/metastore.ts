import { T } from '../api/metastore';
export type { T };
import * as consts from '../../consts';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber, isValidPort, trimString, resetStringUndefined } from '../../helper';

const connectionUrlMap: { [key: string]: string } = {
  MYSQL: "jdbc:mysql://",
  POSTGRES: "jdbc:postgresql://",
  MSSQL: "jdbc:sqlserver://",
  ORACLE: "jdbc:oracle:thin:@//",
  DERBY: "jdbc:derby:"
};

const connectionDriverMap: { [key: string]: string } = {
  MYSQL: "com.mysql.jdbc.Driver",
  POSTGRES: "org.postgresql.Driver",
  MSSQL: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
  ORACLE: "oracle.jdbc.OracleDriver",
  DERBY: "org.apache.derby.jdbc.EmbeddedDriver"
};

function getConnectionUrl(dbType: "MYSQL" | "POSTGRES" | "MSSQL" | "ORACLE" | "DERBY",
      databaseName: string, enableDatabaseSsl: boolean,
      databaseHost?: string, databasePort?: number): string {
  let url = connectionUrlMap[dbType];
  switch (dbType) {
    case "MYSQL":
      assert(!isEmptyString(databaseHost));
      url += databaseHost;
      if (isValidPort(databasePort)) {
        url += `:${databasePort}`;
      }
      url += `/${databaseName}`;
      url += "?createDatabaseIfNotExist=true";
      if (enableDatabaseSsl) {
        url += "&amp;useSSL=true&amp;verifyServerCertificate=true";
      } else {
        url += "&amp;useSSL=false";
      }
      break;
    case "POSTGRES":
      assert(!isEmptyString(databaseHost));
      url += databaseHost;
      if (isValidPort(databasePort)) {
        url += `:${databasePort}`;
      }
      url += `/${databaseName}`;
      if (enableDatabaseSsl) {
        url += "?ssl=true";
      }
      break;
    case "MSSQL":
      assert(!isEmptyString(databaseHost));
      url += databaseHost;
      if (isValidPort(databasePort)) {
        url += `:${databasePort}`;
      }
      url += ";";
      url += `DatabaseName=${databaseName};`;
      if (enableDatabaseSsl) {
        url += "integratedSecurity=true;encrypt=true;";
      }
      break;
    case "ORACLE":
      assert(!isEmptyString(databaseHost));
      url += databaseHost;
      if (isValidPort(databasePort)) {
        url += `:${databasePort}`;
      }
      url += `/${databaseName}`;
      break;
    case "DERBY":
      url += `;databaseName=${consts.config.dir.work}/derby/${databaseName}`;
      url += ";create=true";
      break;
  }
  return url;
}

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];

  if (input.kind === "external") {
    accumAssert(accum,
      !isEmptyString(input.host),
      "A valid address should be specified for External Metastore.",
      'host');

    accumAssert(accum,
      isValidPositiveNumber(input.port),
      "A valid port should be specified for External Metastore.",
      'port');
  }

  if (input.kind === "internal") {
    checkRequiredType(accum, input);
    checkEmptyString(accum, input as T);
    checkStringTuple(accum, input as T);
    checkInvariants(accum, input as T); 
  }

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !isEmptyString(input.databaseName),
    "Database Name is mandatory.",
    'databaseName');

  accumAssert(accum,
    !(input.dbType !== "DERBY") || !isEmptyString(input.userName),
    "Database Account ID is mandatory.",
    'userName');

  accumAssert(accum,
    !(input.dbType !== "DERBY") || !isEmptyString(input.password),
    "Database Account Password is mandatory.",
    'password');

  accumAssert(accum,
    !(input.dbType !== "DERBY") ||
      !isEmptyString(input.databaseHost),
    "A valid address should be specified for Database Host.",
    'databaseHost');
}

function checkStringTuple(accum: CheckResult[], input: T) {
}

function checkInvariants(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(input.dbType !== "DERBY" &&
      input.databasePortRaw !== undefined && !isEmptyString(input.databasePortRaw)) ||  
      isValidPort(parseInt(input.databasePortRaw)),
    "A valid port should be specified for Database Address: " + input.databasePortRaw,
    'databasePortRaw');

  accumAssert(accum,
    isValidPositiveNumber(input.resources.cpu),
    "A valid value should be specified for the number of CPUs.",
    ['resources', 'cpu']);

  accumAssert(accum,
    isValidPositiveNumber(input.resources.memoryInMb) && input.resources.memoryInMb >= 1024,
    "The memory size should be valid and at least 1024MB.",
    ['resources', 'memoryInMb']);
}

export function validate(input: T, consts: consts.T): T {
  if (input.kind == "internal") {
    const checkResult = check(input);
    assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));
  }

  if (input.kind === "internal") {
    const copy = { ... input };
    trimString(copy);
    resetStringUndefined(copy, 'databaseHost');
    resetStringUndefined(copy, 'databasePortRaw');

    if (copy.databasePortRaw === undefined) {
      copy.databasePort = undefined;
     } else {
      const p = parseInt(copy.databasePortRaw);
      copy.databasePort = isValidPort(p) ? p : undefined; 
     }

    copy.connectionUrl = getConnectionUrl(
        copy.dbType, copy.databaseName, copy.enableMetastoreDatabaseSsl,
        copy.databaseHost, copy.databasePort);

    copy.connectionUserName = (copy.dbType === "DERBY") ? "" : copy.userName;
    copy.connectionPassword = (copy.dbType === "DERBY") ? "" : copy.password;

    copy.connectionDriver = connectionDriverMap[copy.dbType];
    copy.args = copy.initSchema ?
      ["start", "--init-schema", consts.hive.amMode] :
      ["start", consts.hive.amMode];

    return copy;
  } else {
    const copy = { ... input };
    trimString(copy);

    copy.connectionUrl = "";
    copy.connectionDriver = "";

    return copy;
  }
}

export function initial(): T {
  return {
    kind: "internal",
    host: "",
    port: 0,
    dbType: "MYSQL",
    databaseHost: "",
    databasePortRaw: "",
    databaseName: "hivemr3",
    userName: "",
    password: "",
    initSchema: true,
    resources: {
      cpu: 0,
      memoryInMb: 0
    },
    enableMetastoreDatabaseSsl: false
  };
}
