import * as gke from '../validate/gke';
import * as gke_fs from '../gke-fs';
import * as service from '../validate/service';
import * as service_fs from '../service-fs';
import * as apps from '../validate/apps';
import * as apps_fs from '../apps-fs';

const gkeConf: gke.T = {
  projectId: "mr3-11111111",
  computeZone: "asia-northeast3-a",

  clusterName: "hivemr3",
  masterMachineType: "n2-standard-16",
  masterLabelRoles: "masters",

  workerPoolName: "workersPool",
  workerMachineType: "n2-standard-16",
  numWorkerNodes: 4,
  localSsdCount: 1,
  workerLabelRoles: "workers",

  iamServiceAccount: "hivewarehouse-sa@mr3-11111111.iam.gserviceaccount.com",

  hiveResources:       { cpu: 4,  memoryInMb: 16 * 1024 },
  metastoreResources:  { cpu: 4,  memoryInMb: 16 * 1024 },
  mr3MasterResources:  { cpu: 6,  memoryInMb: 20 * 1024 },
  rangerResources:     { cpu: 2,  memoryInMb: 6 * 1024 },
  supersetResources:   { cpu: 2,  memoryInMb: 10 * 1024 },
  sparkmr3Resources:   { cpu: 6,  memoryInMb: 20 * 1024 }
};

const serviceConf: service.T = {
  namespace: "hivemr3",
  useHttps: false 
};

const appsConf: apps.T = {
  //
  // basics.T
  //
  warehouseDir: "gs://mr3-warehouse/hivemr3",
  persistentVolumeClaimStorageInGb: 100,
  externalIpHostname: "foo.com",
  hiveserver2Ip: "1.1.1.1",
  hiveserver2IpHostname: "bar.com",
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
  databaseHost: "1.1.1.1",
  databaseName: "hivemr3",
  userName: "root",
  password: "passwd",
  initSchema: true,
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
  dbRootPassword: "passwd",
  dbHost: "1.1.1.1",
  dbPassword: "password",
  enableRangerDatabaseSsl: false,
  adminPassword: "rangeradmin1",

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
  ],

  disabled: false
};

async function run() {
  try {
    await gke_fs.run("../resources/gke.sh", gkeConf);
    await service_fs.run(serviceConf);
    await apps_fs.run(gkeConf, serviceConf, appsConf);
  } catch (e) {
    const message = 'Run failed: ' + e;
    console.log(message);
  }
}

run().finally( () => {} );
