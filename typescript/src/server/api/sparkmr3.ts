export interface T {
  // master Pod
  resources: {
    cpu: number; 
    memoryInMb: number;
  };
  mr3MasterCpuLimitMultiplier: number;        // mr3.k8s.master.pod.cpu.limit.multiplier
  // workers
  workerMemoryInMb: number;
  workerMemoryOverheadInMb: number;
  workerCores: number;
  numTasksInWorker: number;
  numMaxWorkers: number;
  // shuffle handlers
  useShuffleHandlerProcess: boolean;          // spark.shuffle.service.enabled
  // scheduling
  concurrencyLevel: number;                   // mr3.am.max.num.concurrent.dags
  containerSchedulerScheme: "none" | "fifo" | "fair";   // mr3.container.scheduler.scheme
  dagQueueScheme: "common" | "individual";    // mr3.dag.queue.scheme
  dagPriorityScheme: "fifo" | "concurrent";   // mr3.dag.priority.scheme
  numTaskAttempts: number;                    // mr3.am.task.max.failed.attempts
  speculativeThresholdPercent: number;        // mr3.am.task.concurrent.run.threshold.percent
  // autoscaling
  workerIdleTimeoutInMinutes: number,         // mr3.container.idle.timeout.ms
  autoscalingEnabled: boolean,                // mr3.enable.auto.scaling
  scaleOutThreshold?: number;                 // mr3.auto.scale.out.threshold.percent
  scaleInThreshold?: number;                  // mr3.auto.scale.in.threshold.percent
  scaleOutInitialContainers?: number;         // mr3.auto.scale.out.num.initial.containers
  scaleOutIncrement?: number;                 // mr3.auto.scale.out.num.increment.containers
  scaleInDecrementHosts?: number;             // mr3.auto.scale.in.num.decrement.hosts
  scaleInMinHosts?: number;                   // mr3.auto.scale.in.min.hosts
  //
  // set in validate()
  //
  sparkWorkerCores?: number;
  sparkTaskCpus?: number ;            // spark.task.cpus
  maxWorkerMemoryGb?: number;         // mr3.k8s.worker.total.max.memory.gb
  maxWorkerCores?: number;            // mr3.k8s.worker.total.max.cpu.cores
  useDaemonShuffleHandler?: number;   // mr3.use.daemon.shufflehandler (0 if useShuffleHandlerProcess == true)
}
