import * as fs from 'fs';

import * as run_fs from '../run-fs';

import { RunEnv } from '../../server/run-env';
import * as basics from '../../server/validate/basics';
import * as hive from '../../server/validate/hive';
import * as metastore from '../../server/validate/metastore';
import * as master from '../../server/validate/master';
import * as worker from '../../server/validate/worker';
import * as ranger from '../../server/validate/ranger';
import * as timeline from '../../server/validate/timeline';
import * as superset from '../../server/validate/superset';
import * as spark from '../../server/validate/spark';
import * as sparkmr3 from '../../server/validate/sparkmr3';
import * as secret from '../../server/validate/secret';
import * as docker from '../../server/validate/docker';
import * as config from '../../server/validate/config';
import * as driver from '../../server/validate/driver';

import { buildSparkDriverYamlsFromRunEnv } from '../../server/server-fs';
import { strict as assert } from 'assert';

const basicsEnv: basics.T = {
  namespace: "hivemr3",
  warehouseDir: "s3a://hivemr3/warehouse",
  persistentVolume: "create_new",
  createPersistentVolume: {
    storageInGb: 100,
    reclaimPolicy: "Delete",
    pvType: "nfs",
    nfs: {
      server: "192.168.10.1",
      path: "/home/nfs/hivemr3/orange"
    }
  },
  persistentVolumeClaim: {
    storageInGb: 100,
    storageClass: "",
  },
  s3aEndpoint: "http://orange0:9000",
  s3aEnableSsl: false,
  s3aCredentialProvider: "EnvironmentVariable",
  hostPaths: "/data1/k8s",

  // for using LoadBalancer
  externalIp: "192.168.10.1",
  externalIpHostname: "orange1",

  // for using Ingress 
  // e.g., if 10.36.0.1 is an ingress address, use:
  //   curl --resolve orange.com:80:10.36.0.1 http://orange.com:80/ui/
  // externalIpHostname: "orange.com",

  hiveserver2Ip: "192.168.10.1",
  hiveserver2IpHostname: "orange1",

  masterNodeSelector: { key: "roles", value: "masters" },
  workerNodeSelector: { key: "roles", value: "workers" },

  hostAliases: [
    { ip: '192.168.10.100', hostnames: "orange0" },
    { ip: '192.168.10.1', hostnames: "orange1" }],

  useHttpsService: false
};

const metastoreEnv: metastore.T = {
  kind: "internal",
  host: "",
  port: 0,
  dbType: "MYSQL",
  databaseHost: "192.168.10.1",
  databaseName: "hive3mr3",
  userName: "root",
  password: "passwd",
  initSchema: false,
  resources: {
    cpu: 2,
    memoryInMb: 4 * 1024
  },
  enableMetastoreDatabaseSsl: false
};

const hiveEnv: hive.T = {
  resources: {
    cpu: 2,
    memoryInMb: 6 * 1024
  },
  numInstances: 1,
  authentication: "NONE",
  authenticator: "SessionStateUserAuthenticator",
  authorization: "RangerHiveAuthorizerFactory",
  enableSsl: false,
  enableSslInternal: false
};

const masterEnv: master.T = {
  resources: {
    cpu: 2,
    memoryInMb: 4 * 1024
  },
  mr3MasterCpuLimitMultiplier: 1.0,
  concurrencyLevel: 32,
  dagQueueScheme: "common",
  dagPriorityScheme: "fifo",
  numTaskAttempts: 3,
  speculativeThresholdPercent: 99,
  workerIdleTimeoutInMinutes: 60,
  autoscalingEnabled: false,
  scaleOutThreshold: 50,
  scaleInThreshold: 15,
  scaleOutInitialContainers: 4,
  scaleOutIncrement: 1,
  scaleInDecrementHosts: 1,
  scaleInMinHosts: 1
};

const workerEnv: worker.T = {
  workerMemoryInMb: 16 * 1024,
  workerCores: 4,
  numTasksInWorker: 4,
  numMaxWorkers: 10,
  llapIoEnabled: false,
  llapIo: {
    memoryInGb: 20,
    memoryMapped: false
  },
  useSoftReference: false,
  tezIoSortMb: 1040,
  tezUnorderedOutputBufferSizeInMb: 307,
  noConditionalTaskSize: 4000000000,
  maxReducers: 1009,
  javaHeapFraction: 0.7,
  numShuffleHandlersPerWorker: 8,
  useShuffleHandlerProcess: true,
  numThreadsPerShuffleHandler: 10,
  enableShuffleSsl: false
};

const rangerEnv: ranger.T = {
  kind: "internal",
  resources: {
    cpu: 2,
    memoryInMb: 6 * 1024
  },
  service: "ORANGE_hive",
  dbFlavor: "MYSQL",
    // 5.5.5-10.1.48-MariaDB-0ubuntu0.18.04.1 --> okay
    // mysql:5.6, 5.6.51 --> okay
    // 5.7.37-0ubuntu0.18.04.1 --> does not work
  dbRootUser: "root",
  dbRootPassword: "passwd",
  dbHost: "192.168.10.100",
  dbPassword: "password",
  enableRangerDatabaseSsl: false,
  adminPassword: "rangeradmin1",
  authentication: "NONE"
};

const timelineEnv: timeline.T = {
  timelineEnabled: true,
  apacheResources: {         // for Apache server
    cpu: 0.25,
    memoryInMb: 0.5 * 1024
  },
  resources: {               // for all components
    cpu: 2,
    memoryInMb: 6 * 1024
  },
  enableKerberos: false,
  enableTaskView: false
};

const supersetEnv: superset.T = {
  supersetEnabled: true,
  resources: {
    cpu: 2,
    memoryInMb: 8 * 1024
  },
  enableSsl: false
};

const sparkEnv: spark.T = {
  driverNameStr: "spark1,spark2,spark3,spark4"
}

const sparkmr3Env: sparkmr3.T = {
  resources: {
    cpu: 2,
    memoryInMb: 4 * 1024
  },
  mr3MasterCpuLimitMultiplier: 1.0,
  workerMemoryInMb: 12 * 1024,
  workerMemoryOverheadInMb: 4 * 1024,
  workerCores: 4.0,
  numTasksInWorker: 4,
  numMaxWorkers: 16,
  useShuffleHandlerProcess: true,
  concurrencyLevel: 32,
  containerSchedulerScheme: "fair",
  dagQueueScheme: "common",
  dagPriorityScheme: "fifo",
  numTaskAttempts: 3,
  speculativeThresholdPercent: 100,
  workerIdleTimeoutInMinutes: 60,
  autoscalingEnabled: false,
  scaleOutThreshold: 50,
  scaleInThreshold: 15,
  scaleOutInitialContainers: 4,
  scaleOutIncrement: 1,
  scaleInDecrementHosts: 1,
  scaleInMinHosts: 1
}

const dockerEnv: docker.T = {
  docker: {
    image: "mr3project/hive3:1.7",
    containerWorkerImage: "mr3project/hive3:1.7",
    rangerImage: "mr3project/ranger:2.1.0",
    atsImage: "mr3project/mr3ui:1.5",
    supersetImage: "mr3project/superset:1.4.2",
    apacheImage: "mr3project/httpd:2.4",
    user: "hive",
    imagePullPolicy: "Always",
    sparkImage: "mr3project/spark3:3.2.2",
    sparkUser: "spark"
  }
};

const secretEnv: secret.T = {
  secretEnvVars: [
    { name: "AWS_ACCESS_KEY_ID", value: "accesskey" },
    { name: "AWS_SECRET_ACCESS_KEY", value:"awesomesecret" }
  ]
};

const configEnv: config.T = config.initial();

const driverEnv: driver.T = {
  name: "spark1",
  resources: {
    cpu: 2,
    memoryInMb: 8 * 1024
  }
};

async function runDriver(runEnv: RunEnv) {
  assert(runEnv.driverEnv !== undefined);

  try {
    const result = buildSparkDriverYamlsFromRunEnv(runEnv);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync(runEnv.driverEnv.name + ".yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
      throw e;
  }
}

async function run() {
  const runEnv: RunEnv = {
    basicsEnv: basicsEnv,
    metastoreEnv: metastoreEnv,
    hiveEnv: hiveEnv,
    masterEnv: masterEnv,
    workerEnv: workerEnv,
    rangerEnv: rangerEnv,
    timelineEnv: timelineEnv,
    supersetEnv: supersetEnv,
    sparkEnv: sparkEnv,
    sparkmr3Env: sparkmr3Env,
    dockerEnv: dockerEnv,
    secretEnv: secretEnv,
    configEnv: configEnv,
    driverEnv: driverEnv 
  };
  try {
    await run_fs.run(runEnv);
    await runDriver(runEnv);
  } catch (e) {
    const message = 'Run failed: ' + e;
    console.log(message);
  }
}

run().finally( () => {} );
