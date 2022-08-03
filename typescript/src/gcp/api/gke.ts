import * as cluster from '../../public/api/cluster';

export interface T extends cluster.T {
  projectId: string;
  computeZone: string;

  clusterName: string;
  masterMachineType: "n2-standard-16",

  workerPoolName: string;
  workerMachineType: "n2-standard-16";
  numWorkerNodes: number;
  localSsdCount: number;

  iamServiceAccount: string;

  //
  // to be set in validate()
  //
}
