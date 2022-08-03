export interface T {
  // workers
  workerMemoryInMb: number;
  workerCores: number;            // allows floating point numbers
  numTasksInWorker: number;
  numMaxWorkers: number;
  // LLAP IO
  llapIoEnabled: boolean;         // hive.llap.io.enabled
  llapIo?: {
    memoryInGb: number;           // hive.llap.io.memory.size
    memoryMapped: boolean;        // hive.llap.io.allocator.mmap
    memoryMappedPath?: string;    // hive.llap.io.allocator.mmap.path
  };
  // Performance
  useSoftReference: boolean;                  // tez.runtime.pipelined.sorter.use.soft.reference
  tezIoSortMb: number;                        // tez.runtime.io.sort.mb
  tezUnorderedOutputBufferSizeInMb: number;   // tez.runtime.unordered.output.buffer.size-mb 
  noConditionalTaskSize: number;              // hive.auto.convert.join.noconditionaltask.size
  maxReducers: number;                        // hive.exec.reducers.max
  javaHeapFraction: number;                   // hive.mr3.container.max.java.heap.fraction
  // shuffle handlers
  numShuffleHandlersPerWorker: number;        // hive.mr3.use.daemon.shufflehandler, mr3.k8s.shuffle.process.ports
  useShuffleHandlerProcess: boolean;          // mr3.k8s.shuffle.process.ports
  numThreadsPerShuffleHandler: number;        // tez.shuffle.max.threads
  enableShuffleSsl: boolean;                  // tez.runtime.shuffle.ssl.enable
  //
  // set in validate()
  //
  maxWorkerMemoryGb?: number,         // mr3.k8s.worker.total.max.memory.gb
  maxWorkerCores?: number,            // mr3.k8s.worker.total.max.cpu.cores
  coresDivisor?: number,              // hive.mr3.resource.vcores.divisor
  taskMemoryMb?: number,              // hive.mr3.map.task.memory.mb, hive.mr3.reduce.task.memory.mb
  taskCores?: number,                 // hive.mr3.map.task.vcores, hive.mr3.reduce.task.vcores
  memoryMappedPath?: string,          // hive.llap.io.allocator.mmap.path, mr3.k8s.pod.worker.additional.hostpaths
  useDaemonShuffleHandler?: number,   // hive.mr3.use.daemon.shufflehandler
  shuffleProcessPorts?: string        // mr3.k8s.shuffle.process.ports
  //
  // only for validate()
  //
}
