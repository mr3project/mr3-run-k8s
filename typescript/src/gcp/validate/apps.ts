import { T } from '../../public/api/apps';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, checkNonEmpty, OptionalFields, trimString } from '../../helper';
import { applyConvertMap } from '../../run-env';
import { checkServer } from '../../gcp-run-env';

import * as gke from './gke';
import * as service from './service';

export function check(
    input: OptionalFields<T>,
    gkeInput: gke.T | null,
    serviceInput: service.T | null): CheckResult[] {
  let accum: CheckResult[] = [];
  let appsInput: T = input as T;

  if (gkeInput !== null && serviceInput !== null) {
    try {
      const gkeConf: gke.T = gke.validate(gkeInput);
      const serviceConf: service.T = service.validate(serviceInput);

      const appsConf: T = { ...appsInput };
      trimString(appsConf);

      const result = checkServer(gkeConf, serviceConf, appsConf);
      const converted = result.map((r) => { return { field: applyConvertMap(r.field), msg: r.msg }; });
      accum.push(...converted);
    } catch (e) {
      const message = 'Do not check invarints yet: ' + e;
      console.log(message);
      // add a dummy error to prevent downloading
      accum.push({ field: 'disabled', msg: message });
    }
  }

  return accum;
}

export function validate(input: T, gkeConf: gke.T, serviceConf: service.T): T {
  const checkResult = check(input, gkeConf, serviceConf);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ...input };
  trimString(copy);   // still, split(",") should be followed by trim()

  return copy;
}

export function initial(): T {
  return {
    //
    // basics.T
    //
    warehouseDir: "gs://",
    persistentVolumeClaimStorageInGb: 100,
    externalIpHostname: "",
    hiveserver2Ip: "",
    hiveserver2IpHostname: "",
    kerberos: {
      realm: "",
      adminServer: "",
      kdc: ""
    },

    //
    // hive.T
    //
    authentication: "NONE",
    enableSsl: false,

    //
    // metastore.T
    //
    dbType: "MYSQL",
    databaseHost: "",
    databaseName: "",
    userName: "root",
    password: "",
    initSchema: false,
    enableMetastoreDatabaseSsl: false,

    //
    // master.T
    //
    scaleOutThreshold: 50,
    scaleInThreshold: 10,
    scaleOutInitialContainers: 4,
    scaleOutIncrement: 1,
    scaleInDecrementHosts: 1,
    scaleInMinHosts: 1,

    //
    // ranger.T
    //
    service: "HIVE_service",
    dbFlavor: "MYSQL",
    dbRootUser: "root",
    dbRootPassword: "",
    dbHost: "",
    dbPassword: "",
    enableRangerDatabaseSsl: false,
    adminPassword: "",

    //
    // spark.T
    //
    driverNameStr: "spark1,spark2,spark3,spark4",

    //
    // secret.T
    //
    kerberosSecret: {
      server: {
        keytab: "",
        principal: "",
        data: "",
        keytabInternal: "",
        principalInternal: "",
        dataInternal: ""
      },
      ranger: {
        domain: "ranger.hivemr3.svc.cluster.local",
        spnego: {
          keytab: "",
          principal: "",
          data: ""
        },
        admin: {
          keytab: "",
          principal: "",
          data: ""
        },
        lookup: {
          keytab: "",
          principal: "",
          data: ""
        }
      }
    },
    spark: {
      keytab: "",
      principal: "",
      data: ""
    },
    ssl: {
      keystore: "",
      truststore: "",
      password: "",
      keystoreData: "",
      truststoreData: ""
    },
    secretEnvVars: [
    ]
  };
}
