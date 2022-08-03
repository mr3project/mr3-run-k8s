import { T, regionNames, zoneNames, masterInstanceTypes, workerInstanceTypes } from '../api/eks';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, checkNonEmpty, OptionalFields, trimString, isEmptyString } from '../../helper';

export const regionOptions: { key: string; text: string; value: string }[] = regionNames.map((item) => {
  return { key: item, text: item, value: item };
});

export function zoneOptions(region: string | undefined): { key: string; text: string; value: string }[] {
  if (isEmptyString(region)) {
    return [];
  } else {
    assert(region !== undefined);
    return zoneNames
      .filter(x => x.startsWith(region))
      .map((item) => { return { key: item, text: item, value: item }; });
  }
}

export const masterInstanceTypeOptions: { key: string; text: string; value: string }[] = masterInstanceTypes.map((item) => {
  return { key: item, text: item, value: item };
});

export const workerInstanceTypeOptions: { key: string; text: string; value: string }[] = workerInstanceTypes.map((item) => {
  return { key: item, text: item, value: item };
});

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];
  let eks: T = input as T;

  checkNonEmpty(accum, eks.name, 'name', 'Name');
  checkNonEmpty(accum, eks.region, 'region', 'Region');
  checkNonEmpty(accum, eks.zone, 'zone', 'Availability Zone');
  checkNonEmpty(accum, eks.masterNodeGroup, 'masterNodeGroup', 'Master Node Group');
  checkNonEmpty(accum, eks.masterInstanceType, 'masterInstanceType', 'Instance Type');
  checkNonEmpty(accum, eks.masterLabelRoles, 'masterLabelRoles', 'Master Label Role');
  checkNonEmpty(accum, eks.workerNodeGroup, 'workerNodeGroup', 'Worker Node Group');
  checkNonEmpty(accum, eks.workerInstanceType, 'workerInstanceType', 'Instance Type');
  checkNonEmpty(accum, eks.workerLabelRoles, 'workerLabelRoles', 'Worker Label Role');
  checkNonEmpty(accum, eks.autoscalingWorkerPolicy, 'autoscalingWorkerPolicy', 'Autoscaling Policy ARN');
  checkNonEmpty(accum, eks.accessS3Policy, 'accessS3Policy', 'S3 Access Policy ARN');

  if (!isEmptyString(eks.region)) {
    accumAssert(accum, regionNames.includes(eks.region),
      "Invalid region name: " + eks.region, 'region');
  }

  if (!isEmptyString(eks.zone)) {
    accumAssert(accum, zoneNames.includes(eks.zone),
      "Invalid zone name: " + eks.zone, 'zone');
  }

  accumAssert(accum, eks.masterCapacity >= 2,
    "Instance Capacity should be no smaller than 2.", 'masterCapacity');

  accumAssert(accum, eks.workerMinCapacityOnDemand >= 0,
    "Min # of On-Demand Instances should be >= 0.", 'workerMinCapacityOnDemand');
  accumAssert(accum, eks.workerMaxCapacityOnDemand >= 0,
    "Max # of On-Demand Instances should >= 0.", 'workerMaxCapacityOnDemand');
  accumAssert(accum, eks.workerMaxCapacityTotal > 0,
    "Total # of Instances should be great than 0.", 'workerMaxCapacityTotal');

  accumAssert(accum, eks.workerMinCapacityOnDemand <= eks.workerMaxCapacityOnDemand,
    "Max # should be no smaller than Min #.", 'workerMaxCapacityOnDemand');
  accumAssert(accum, eks.workerMaxCapacityOnDemand <= eks.workerMaxCapacityTotal,
    "Total # should be no smaller than Max #.", 'workerMaxCapacityTotal');

  if (!isEmptyString(eks.autoscalingWorkerPolicy)) {
    accumAssert(accum,
      eks.autoscalingWorkerPolicy.trim().startsWith("arn:aws:iam::") &&
      eks.autoscalingWorkerPolicy.trim().includes(":policy/"),
      "Autoscaling Policy ARN should be properly set.", 'autoscalingWorkerPolicy');
  }
  if (!isEmptyString(eks.accessS3Policy)) {
    accumAssert(accum,
      eks.accessS3Policy.trim().startsWith("arn:aws:iam::") &&
      eks.accessS3Policy.trim().includes(":policy/"),
      "S3 Access Policy ARN should be properly set.", 'accessS3Policy');
  }

  return accum;
}

export function validate(input: T): T {
  const checkResult = check(input);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ...input };
  trimString(copy);   // still, split(",") should be followed by trim()

  copy.zones = zoneNames.filter(x => x.startsWith(copy.region.trim()));

  copy.onDemandPercentageAboveBaseCapacity =
    Math.floor(copy.workerMaxCapacityOnDemand / copy.workerMaxCapacityTotal * 100);

  copy.preBootstrapCommands = [
    "IDX=1; for DEV in /dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_*-ns-1; do mkfs.xfs ${DEV}; mkdir -p /ephemeral${IDX}; echo ${DEV} /ephemeral${IDX} xfs defaults,noatime 1 2 >> /etc/fstab; IDX=$((${IDX} + 1)); done",
    "mount -a",
    "IDX=1; for DEV in /dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_*-ns-1; do chown ec2-user:ec2-user /ephemeral${IDX}; IDX=$((${IDX} + 1)); done",
  ];

  switch (copy.workerInstanceType) {
    case "m5d.2xlarge":
      copy.mountDirs = ["/ephemeral1"];
      break;
    case "m5d.4xlarge":
      copy.mountDirs = ["/ephemeral1", "/ephemeral2"];
      break;
  }

  copy.apacheResources =          { cpu: 0.25, memoryInMb: 0.5 * 1024 };
  copy.prometheusResources =      { cpu: 0.25, memoryInMb: 3 * 1024 };
  copy.timelineServerResources =  { cpu: 0.25, memoryInMb: 1 * 1024 };
  copy.jettyResources =           { cpu: 0.25, memoryInMb: 0.5 * 1024 };
  copy.grafanaResources =         { cpu: 0.25, memoryInMb: 0.5 * 1024 };

  assert(copy.masterCapacity >= 2);
  // assume 14 CPUs and 52GB on each node conservatively
  // hiveResources is used twice: hive.yaml and hive-internal.yaml
  // mr3MasterResources in the worst case =
  //   min of:
  //     1. (14 CPUs, 52GB) - 2 * hiveResources
  //     2. (14 CPUs, 52GB) - hiveResources - rangerResource - supersetResource
  copy.hiveResources =      { cpu: 4,    memoryInMb: 16 * 1024 };
  copy.metastoreResources = { cpu: 4,    memoryInMb: 16 * 1024 };
  copy.mr3MasterResources = { cpu: 6,    memoryInMb: 20 * 1024 };
  copy.rangerResources =    { cpu: 2,    memoryInMb: 6 * 1024 };
  copy.supersetResources =  { cpu: 2,    memoryInMb: 10 * 1024 };
  // sparkmr3Resource is taken after the first Spark driver starts
  copy.sparkmr3Resources =  { cpu: 6,    memoryInMb: 20 * 1024 };

  copy.mr3MasterCpuLimitMultiplier = 2.0;

  copy.hiveNumInstances = 1;

  switch (copy.workerInstanceType) {
    case "m5d.2xlarge":
      copy.workerMemoryInMb = 29750;        // max 30320MB
      copy.workerCores = 7.5;               // max 7,785m = 7910m - 100m - 25m
      copy.numTasksInWorker = 5;
      copy.numShuffleHandlersPerWorker = 4;
      copy.numThreadsPerShuffleHandler = 10;

      copy.sparkWorkerMemoryInMb = 24500;
      copy.sparkWorkerMemoryOverheadInMb= 5250;
      copy.sparkWorkerCores = 7;
      copy.sparkNumTasksInWorker = 5;
      break;
    case "m5d.4xlarge":
      copy.workerMemoryInMb = 59250;        // max 59917MB
      copy.workerCores = 15.5;              // max 15,765m = 15890m - 100m - 25m
      copy.numTasksInWorker = 10;
      copy.numShuffleHandlersPerWorker = 8;
      copy.numThreadsPerShuffleHandler = 10;

      copy.sparkWorkerMemoryInMb = 50000;
      copy.sparkWorkerMemoryOverheadInMb= 9250;
      copy.sparkWorkerCores = 15;
      copy.sparkNumTasksInWorker = 10;
      break;
  }

  return copy;
}

export function initial(): T {
  return {
    name: "hive-mr3",
    region: "ap-northeast-1",
    zone: "ap-northeast-1a",
  
    masterNodeGroup: "hive-mr3-master",
    masterInstanceType: "m5.4xlarge",
    masterLabelRoles: "masters",
    masterCapacity: 2,
  
    workerNodeGroup: "hive-mr3-worker",
    workerInstanceType: "m5d.4xlarge",
    workerLabelRoles: "workers",
    workerMinCapacityOnDemand: 0,
    workerMaxCapacityOnDemand: 0,
    workerMaxCapacityTotal: 8,
  
    autoscalingWorkerPolicy: "arn:aws:iam::",
    accessS3Policy: "arn:aws:iam::"
  };
}
