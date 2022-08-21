import * as eks from '../validate/eks';
import * as eks_fs from '../eks-fs';
import * as autoscaler from '../validate/autoscaler';
import * as autoscaler_fs from '../autoscaler-fs';
import * as service from '../validate/service';
import * as service_fs from '../service-fs';
import * as efs from '../validate/efs';
import * as efs_fs from '../efs-fs';
import * as apps from '../validate/apps';
import * as apps_fs from '../apps-fs';
import * as driver from '../../server/validate/driver';

const eksConf: eks.T = {
  name: "hive-mr3",
  region: "ap-northeast-2",
  zone: "ap-northeast-2a",

  masterNodeGroup: "hive-mr3-master",
  masterInstanceType: "m5d.4xlarge",
  masterCapacity: 2,

  workerNodeGroup: "hive-mr3-worker",
  workerInstanceType: "m5d.4xlarge",
  workerMinCapacityOnDemand: 0,
  workerMaxCapacityOnDemand: 0,
  workerMaxCapacityTotal: 8,

  autoscalingWorkerPolicy: "arn:aws:iam::111111111111:policy/AutoScalingPolicy",
  accessS3Policy: "arn:aws:iam::111111111111:policy/S3AccessPolicy",

  masterLabelRoles: "masters",
  workerLabelRoles: "workers",

  hiveResources:       { cpu: 4,  memoryInMb: 16 * 1024 },
  metastoreResources:  { cpu: 4,  memoryInMb: 16 * 1024 },
  mr3MasterResources:  { cpu: 6,  memoryInMb: 20 * 1024 },
  rangerResources:     { cpu: 2,  memoryInMb: 6 * 1024 },
  supersetResources:   { cpu: 2,  memoryInMb: 10 * 1024 },
  sparkmr3Resources:   { cpu: 6,  memoryInMb: 20 * 1024 }
};

const autoscalerConf: autoscaler.T = {
  autoscalingScaleDownDelayAfterAddMin: 5,
  autoscalingScaleDownUnneededTimeMin: 1
}

const serviceConf: service.T = {
  namespace: "hivemr3",
  useHttps: false 
};

const efsConf: efs.T = {
  efsId: "fs-11111111111111111"
};

const appsConf: apps.T = {
  //
  // basics.T
  //
  warehouseDir: "s3a://data-warehouse/hivemr3",
  persistentVolumeClaimStorageInGb: 100,
  externalIpHostname: "foo.com",
  hiveserver2Ip: "1.1.1.1",
  hiveserver2IpHostname: "hs2host",
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
  dbPassword: "passwd",
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

const driverEnv: driver.T = {
  name: "spark1",
  resources: {
    cpu: 2,
    memoryInMb: 8 * 1024
  }
};

async function run() {
  try {
    await eks_fs.run(eksConf);
    await autoscaler_fs.run(eksConf, autoscalerConf);
    await service_fs.run(serviceConf);
    await efs_fs.run(eksConf, serviceConf, efsConf);
    await apps_fs.run(eksConf, serviceConf, appsConf);
    await apps_fs.runDriver(eksConf, serviceConf, appsConf, driverEnv);
  } catch (e) {
    const message = 'Run failed: ' + e;
    console.log(message);
  }
}

run().finally( () => {} );
