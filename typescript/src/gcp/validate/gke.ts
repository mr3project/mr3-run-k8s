import { T } from '../api/gke';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, checkNonEmpty, OptionalFields, trimString } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];
  let gke: T = input as T;

  checkNonEmpty(accum, gke.projectId, 'projectId', "Project ID");
  checkNonEmpty(accum, gke.computeZone, 'computeZone', "Compute Zone");

  checkNonEmpty(accum, gke.clusterName, 'clusterName', "Cluster Name");
  checkNonEmpty(accum, gke.masterMachineType, 'masterMachineType', "Master Machine Type");
  checkNonEmpty(accum, gke.masterLabelRoles, 'masterLabelRoles', "Master Node Label");

  checkNonEmpty(accum, gke.workerPoolName, 'workerPoolName', "Worker Pool Name");
  checkNonEmpty(accum, gke.workerMachineType, 'workerMachineType', "Worker Machine Type");
  checkNonEmpty(accum, gke.workerLabelRoles, 'workerLabelRoles', "Worker Node Label");

  checkNonEmpty(accum, gke.iamServiceAccount, 'iamServiceAccount', "IAM Service Account");

  accumAssert(accum, gke.numWorkerNodes > 0, 'NUM_WORKER_NODES should be greater than 0.', "NUM_WORKER_NODES ");
  accumAssert(accum, gke.localSsdCount > 0, 'LOCAL_SSD_COUNT should be greater than 0.', "LOCAL_SSD_COUNT ");

  return accum;
}

export function validate(input: T): T {
  const checkResult = check(input);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ...input };
  trimString(copy);   // still, split(",") should be followed by trim()

  copy.mountDirs = [];
  for (var i = 0; i < copy.localSsdCount; i++) {
    copy.mountDirs.push("/mnt/disks/ssd" + i);
  }

  copy.apacheResources =          { cpu: 0.25, memoryInMb: 0.5 * 1024 };
  copy.prometheusResources =      { cpu: 0.25, memoryInMb: 3 * 1024 };
  copy.timelineServerResources =  { cpu: 0.25, memoryInMb: 1 * 1024 };
  copy.jettyResources =           { cpu: 0.25, memoryInMb: 0.5 * 1024 };
  copy.grafanaResources =         { cpu: 0.25, memoryInMb: 0.5 * 1024 };

  copy.hiveResources =            { cpu: 2.5,  memoryInMb: 10 * 1024 };
  copy.metastoreResources =       { cpu: 2,    memoryInMb: 6 * 1024 };
  copy.mr3MasterResources =       { cpu: 5,    memoryInMb: 12 * 1024 };
  copy.rangerResources =          { cpu: 1,    memoryInMb: 4 * 1024 };
  copy.supersetResources =        { cpu: 1,    memoryInMb: 10 * 1024 };

  copy.mr3MasterCpuLimitMultiplier = 1.5;

  copy.hiveNumInstances = 1;

  switch (copy.workerMachineType) {
    case "n2-standard-16":
      copy.workerMemoryInMb = 59500;        // max 59917MB
      copy.workerCores = 15.75;             // max 15,765m = 15890m - 100m - 25m
      copy.numTasksInWorker = 10;
      copy.numShuffleHandlersPerWorker = 8;
      copy.numThreadsPerShuffleHandler = 10;
      break;
  }

  return copy;
}

export function initial(): T {
  return {
    projectId: "",
    computeZone: "asia-northeast3-a",

    clusterName: "hivemr3",
    masterMachineType: "n2-standard-16",
    masterLabelRoles: "masters",

    workerPoolName: "workersPool",
    workerMachineType: "n2-standard-16",
    numWorkerNodes: 4,
    localSsdCount: 1,
    workerLabelRoles: "workers",

    iamServiceAccount: ""
  };
}
