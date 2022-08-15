export interface T {
  resources: {
    cpu: number; 
    memoryInMb: number;
  };
  mr3MasterCpuLimitMultiplier: number;        // mr3.k8s.master.pod.cpu.limit.multiplier
  // scheduling
  concurrencyLevel: number;                   // mr3.am.max.num.concurrent.dags
  dagQueueScheme: "common" | "individual" | "capacity";   // mr3.dag.queue.scheme
  dagPriorityScheme: "fifo" | "concurrent";   // mr3.dag.priority.scheme
  numTaskAttempts: number;                    // hive.mr3.am.task.max.failed.attempts
  speculativeThresholdPercent: number;        // hive.mr3.am.task.concurrent.run.threshold.percent
  // autoscaling
  workerIdleTimeoutInMinutes: number;         // mr3.container.idle.timeout.ms
  autoscalingEnabled: boolean;                // mr3.enable.auto.scaling
  scaleOutThreshold?: number;                 // mr3.auto.scale.out.threshold.percent
  scaleInThreshold?: number;                  // mr3.auto.scale.in.threshold.percent
  scaleOutInitialContainers?: number;         // mr3.auto.scale.out.num.initial.containers
  scaleOutIncrement?: number;                 // mr3.auto.scale.out.num.increment.containers
  scaleInDecrementHosts?: number;             // mr3.auto.scale.in.num.decrement.hosts
  scaleInMinHosts?: number;                   // mr3.auto.scale.in.min.hosts
  //
  // only for validate()
  //
}
