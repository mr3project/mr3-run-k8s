export interface T {
  masterLabelRoles: string;
  workerLabelRoles: string;

  hiveResources: { cpu: number; memoryInMb: number; };
  metastoreResources: { cpu: number; memoryInMb: number; };
  mr3MasterResources: { cpu: number; memoryInMb: number; };
  rangerResources: { cpu: number; memoryInMb: number; };
  supersetResources: { cpu: number; memoryInMb: number; };
  sparkmr3Resources: { cpu: number; memoryInMb: number; };

  //
  // to be set in validate()
  //

  masterMountDirs?: string[];
  workerMountDirs?: string[];

  apacheResources?: { cpu: number; memoryInMb: number; };
  prometheusResources?: { cpu: number; memoryInMb: number; };
  timelineServerResources?: { cpu: number; memoryInMb: number; };
  jettyResources?: { cpu: number; memoryInMb: number; };
  grafanaResources?: { cpu: number; memoryInMb: number; };

  mr3MasterCpuLimitMultiplier?: number;   // for both master.T and sparkmr3.T

  hiveNumInstances?: number;

  workerMemoryInMb?: number;
  workerCores?: number;             // allows floating point numbers
  numTasksInWorker?: number;
  numShuffleHandlersPerWorker?: number;
  numThreadsPerShuffleHandler?: number;

  sparkWorkerMemoryInMb?: number;
  sparkWorkerMemoryOverheadInMb?: number;
  sparkWorkerCores?: number;        // allows floating point numbers
  sparkNumTasksInWorker?: number;
}
