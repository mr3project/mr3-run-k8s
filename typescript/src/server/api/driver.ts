export interface T {
  name: string;
  resources: {
    cpu: number; 
    memoryInMb: number;
  };
  //
  // set in validate()
  //
  sparkDriverCores?: number;
  sparkDriverMemoryInMb?: number;
}
