import { strict as assert } from 'assert';

import * as cluster from './public/api/cluster';
import * as service from './public/api/service';
import * as apps from './public/api/apps';

import * as basics from './server/validate/basics';
import * as hive from './server/validate/hive';
import * as metastore from './server/validate/metastore';
import * as master from './server/validate/master';
import * as worker from './server/validate/worker';
import * as ranger from './server/validate/ranger';
import * as timeline from './server/validate/timeline';
import * as superset from './server/validate/superset';
import * as spark from './server/validate/spark';
import * as sparkmr3 from './server/validate/sparkmr3';
import * as secret from './server/validate/secret';
import * as docker from './server/validate/docker';
import * as config from './server/validate/config';

import { RunEnv } from './server/run-env';

function getBasics(clusterConf: cluster.T, serviceConf: service.T, appsConf: apps.T): basics.T {
  assert(clusterConf.workerMountDirs !== undefined);

  const hostAliases = [{ ip: appsConf.hiveserver2Ip, hostnames: appsConf.hiveserver2IpHostname }];
  return {
    namespace: serviceConf.namespace,
    warehouseDir: appsConf.warehouseDir,
    persistentVolume: "use_existing", 
    persistentVolumeClaim: {
      storageInGb: appsConf.persistentVolumeClaimStorageInGb,
      storageClass: ""
    },
    s3aEnableSsl: false,
    s3aCredentialProvider: "DoNotUseS3",
    hostPaths: clusterConf.workerMountDirs.join(","),

    // TODO: externalIp should not be set to use Ingress
    // TODO; externalIp should be set to use LoadBalancer
    externalIp: "0.0.0.0",

    externalIpHostname: appsConf.externalIpHostname,
    hiveserver2Ip: appsConf.hiveserver2Ip,
    hiveserver2IpHostname: appsConf.hiveserver2IpHostname,
    kerberos: appsConf.kerberos,
    masterNodeSelector: { key: "roles", value: clusterConf.masterLabelRoles },
    workerNodeSelector: { key: "roles", value: clusterConf.workerLabelRoles },
    hostAliases: hostAliases,
    useHttpsService: serviceConf.useHttps
  }
}

function getMetastore(clusterConf: cluster.T, appsConf: apps.T): metastore.T {
  assert(clusterConf.metastoreResources !== undefined);

  return {
    kind: "internal",
    // for external
    host: "",
    port: 0,
    // for internal
    dbType: appsConf.dbType,
    databaseHost: appsConf.databaseHost,
    databasePortRaw: appsConf.databasePortRaw,
    databaseName: appsConf.databaseName,
    userName: appsConf.userName,
    password: appsConf.password,
    initSchema: appsConf.initSchema,
    resources: clusterConf.metastoreResources,
    enableMetastoreDatabaseSsl: appsConf.enableMetastoreDatabaseSsl
  };
}

function getHive(clusterConf: cluster.T, appsConf: apps.T): hive.T {
  assert(clusterConf.hiveResources !== undefined);
  assert(clusterConf.hiveNumInstances !== undefined);

  return {
    resources: clusterConf.hiveResources,
    numInstances: clusterConf.hiveNumInstances,
    authentication: appsConf.authentication,
    ldap: appsConf.ldap,
    authenticator: "SessionStateUserAuthenticator",
    authorization: "RangerHiveAuthorizerFactory",
    enableSsl: appsConf.enableSsl,
    enableSslInternal: false
  };
}

function getMaster(clusterConf: cluster.T, appsConf: apps.T): master.T {
  assert(clusterConf.mr3MasterResources !== undefined);
  assert(clusterConf.mr3MasterCpuLimitMultiplier !== undefined);

  return {
    resources: clusterConf.mr3MasterResources,
    mr3MasterCpuLimitMultiplier: clusterConf.mr3MasterCpuLimitMultiplier,
    concurrencyLevel: 32,
    dagQueueScheme: "common",
    dagPriorityScheme: "fifo",
    numTaskAttempts: 3,
    speculativeThresholdPercent: 99,
    workerIdleTimeoutInMinutes: 60,
    autoscalingEnabled: true,
    scaleOutThreshold: appsConf.scaleOutThreshold !== undefined ? appsConf.scaleOutThreshold : 50,
    scaleInThreshold: appsConf.scaleInThreshold !== undefined ? appsConf.scaleInThreshold : 10,
    scaleOutInitialContainers: appsConf.scaleOutInitialContainers !== undefined ? appsConf.scaleOutInitialContainers : 4,
    scaleOutIncrement: appsConf.scaleOutIncrement !== undefined ? appsConf.scaleOutIncrement : 1,
    scaleInDecrementHosts: appsConf.scaleInDecrementHosts !== undefined ? appsConf.scaleInDecrementHosts : 1,
    scaleInMinHosts: appsConf.scaleInMinHosts !== undefined ? appsConf.scaleInMinHosts : 1
  };
}

function getWorker(clusterConf: cluster.T, appsConf: apps.T): worker.T {
  assert(clusterConf.workerMemoryInMb !== undefined);
  assert(clusterConf.workerCores !== undefined);
  assert(clusterConf.numTasksInWorker !== undefined);
  assert(clusterConf.numShuffleHandlersPerWorker !== undefined);
  assert(clusterConf.numThreadsPerShuffleHandler !== undefined);

  return {
    workerMemoryInMb: clusterConf.workerMemoryInMb,
    workerCores: clusterConf.workerCores,
    numTasksInWorker: clusterConf.numTasksInWorker,
    numMaxWorkers: 256,
    llapIoEnabled: false,
    useSoftReference: false,
    tezIoSortMb: 1040,
    tezUnorderedOutputBufferSizeInMb: 307,
    noConditionalTaskSize: 4000000000,
    maxReducers: 1009,
    javaHeapFraction: 0.7,
    numShuffleHandlersPerWorker: clusterConf.numShuffleHandlersPerWorker,
    useShuffleHandlerProcess: true,
    numThreadsPerShuffleHandler: clusterConf.numThreadsPerShuffleHandler,
    enableShuffleSsl: false
  };
}

function getRanger(clusterConf: cluster.T, appsConf: apps.T): ranger.RangerInternal {
  assert(clusterConf.rangerResources !== undefined);

  return {
    kind: "internal",
    resources: clusterConf.rangerResources,
    service: appsConf.service,
    dbFlavor: appsConf.dbFlavor,
    dbRootUser: appsConf.dbRootUser,
    dbRootPassword: appsConf.dbRootPassword,
    dbHost: appsConf.dbHost,
    dbPassword: appsConf.dbPassword,
    enableRangerDatabaseSsl: appsConf.enableRangerDatabaseSsl,
    adminPassword: appsConf.adminPassword,
    authentication: "NONE"
  };
}

function getTimeline(clusterConf: cluster.T, appsConf: apps.T): timeline.T {
  assert(clusterConf.prometheusResources !== undefined);
  assert(clusterConf.timelineServerResources !== undefined);
  assert(clusterConf.jettyResources !== undefined);
  assert(clusterConf.grafanaResources !== undefined);

  return {
    timelineEnabled: true,
    apacheResources: clusterConf.apacheResources,
    prometheusResources: clusterConf.prometheusResources,
    timelineServerResources: clusterConf.timelineServerResources,
    jettyResources: clusterConf.jettyResources,
    grafanaResources: clusterConf.grafanaResources,
    enableKerberos: false,
    enableTaskView: appsConf.enableTaskView !== undefined ? appsConf.enableTaskView : false
  };
}

function getSuperset(clusterConf: cluster.T, appsConf: apps.T): superset.T {
  assert(clusterConf.supersetResources !== undefined);

  return {
    supersetEnabled: true,
    resources: clusterConf.supersetResources,
    enableSsl: false
  };
}

function getSpark(clusterConf: cluster.T, appsConf: apps.T): spark.T {
  return {
    driverNameStr: appsConf.driverNameStr
  };
}

function getSparkmr3(clusterConf: cluster.T, appsConf: apps.T): sparkmr3.T {
  assert(clusterConf.sparkmr3Resources !== undefined);
  assert(clusterConf.mr3MasterCpuLimitMultiplier !== undefined);
  assert(clusterConf.sparkWorkerMemoryInMb !== undefined);
  assert(clusterConf.sparkWorkerMemoryOverheadInMb !== undefined);
  assert(clusterConf.sparkWorkerCores !== undefined);
  assert(clusterConf.sparkNumTasksInWorker !== undefined);

  return {
    resources: clusterConf.sparkmr3Resources, 
    mr3MasterCpuLimitMultiplier: clusterConf.mr3MasterCpuLimitMultiplier,
    workerMemoryInMb: clusterConf.sparkWorkerMemoryInMb,
    workerMemoryOverheadInMb: clusterConf.sparkWorkerMemoryOverheadInMb,
    workerCores: clusterConf.sparkWorkerCores,
    numTasksInWorker: clusterConf.sparkNumTasksInWorker,
    numMaxWorkers: 256,
    useShuffleHandlerProcess: true,
    concurrencyLevel: 32,
    containerSchedulerScheme: "fair",
    dagQueueScheme: "common",
    dagPriorityScheme: "fifo",
    numTaskAttempts: 3,
    speculativeThresholdPercent: 99,
    workerIdleTimeoutInMinutes: 60,
    autoscalingEnabled: true,
    scaleOutThreshold: appsConf.scaleOutThreshold !== undefined ? appsConf.scaleOutThreshold : 50,
    scaleInThreshold: appsConf.scaleInThreshold !== undefined ? appsConf.scaleInThreshold : 10,
    scaleOutInitialContainers: appsConf.scaleOutInitialContainers !== undefined ? appsConf.scaleOutInitialContainers : 4,
    scaleOutIncrement: appsConf.scaleOutIncrement !== undefined ? appsConf.scaleOutIncrement : 1,
    scaleInDecrementHosts: appsConf.scaleInDecrementHosts !== undefined ? appsConf.scaleInDecrementHosts : 1,
    scaleInMinHosts: appsConf.scaleInMinHosts !== undefined ? appsConf.scaleInMinHosts : 1
  };
}

function getSecret(clusterConf: cluster.T, appsConf: apps.T): secret.T {
  return {
    kerberosSecret: appsConf.kerberosSecret,
    ssl: appsConf.ssl,
    secretEnvVars: appsConf.secretEnvVars
  };
}

function getDocker(clusterConf: cluster.T, appsConf: apps.T): docker.T {
  return docker.initial();
}

function getConfig(clusterConf: cluster.T, appsConf: apps.T): config.T {
  return config.initial();
}

const convertMap: { src: string | string[]; dest: string | string[]; }[] = [
  { src: ['persistentVolumeClaim', 'storageInGb'], dest: 'persistentVolumeClaimStorageInGb' }
];

export function applyConvertMap(src: string | string[]): string | string[] {
  const srcJson = JSON.stringify(src);
  for (var map of convertMap) {
    if (srcJson === JSON.stringify(map.src)) {
      return map.dest;
    }
  }
  return src;
}

// Invariant: clusterConf and serviceConf should be created with validate()
export function getRunEnvForCloudCommon(
    clusterConf: cluster.T,
    serviceConf: service.T,
    appsConf: apps.T): RunEnv {
  const basicsEnv = getBasics(clusterConf, serviceConf, appsConf);
  const metastoreEnv = getMetastore(clusterConf, appsConf);
  const hiveEnv = getHive(clusterConf, appsConf);
  const masterEnv = getMaster(clusterConf, appsConf);
  const workerEnv = getWorker(clusterConf, appsConf);
  const rangerEnv = getRanger(clusterConf, appsConf);
  const timelineEnv = getTimeline(clusterConf, appsConf);
  const supersetEnv = getSuperset(clusterConf, appsConf);
  const sparkEnv = getSpark(clusterConf, appsConf);
  const sparkmr3Env = getSparkmr3(clusterConf, appsConf);
  const secretEnv = getSecret(clusterConf, appsConf);
  const dockerEnv = getDocker(clusterConf, appsConf);
  const configEnv = getConfig(clusterConf, appsConf);

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
    configEnv: configEnv
  }
  return runEnv;
}
