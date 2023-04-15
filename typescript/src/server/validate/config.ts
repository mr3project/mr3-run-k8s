import { T } from '../api/config';
export type { T };

export function initial(): T {
  let config: T = {
    s3: {
      'fs.s3a.connection.maximum': 5000,
      'fs.s3.maxConnections': 5000,
      'fs.s3a.threads.max': 250,
      'fs.s3a.threads.core': 250
    },
    hdfs: {
    },
    metastore: {
      'hive.metastore.pre.event.listeners': "",
      'hive.security.metastore.authorization.auth.reads': false,
      'hive.security.metastore.authorization.manager': "org.apache.hadoop.hive.ql.security.authorization.DefaultHiveMetastoreAuthorizationProvider",
      'hive.compactor.initiator.on': true,
      'hive.compactor.worker.threads': 1
    },
    hive: {
      'hive.exec.max.dynamic.partitions': 5000,
      'hive.exec.max.dynamic.partitions.pernode': 2000,
      'hive.exec.orc.split.strategy': "HYBRID",
      'hive.exec.reducers.bytes.per.reducer': 67108864,
      'hive.merge.nway.joins': true,
      'hive.server2.webui.port': 10002,
      'hive.stats.autogather': true,
      'hive.stats.fetch.column.stats': true,
      'hive.server2.enable.doAs': false,
      'hive.query.results.cache.enabled': true,
      'hive.strict.checks.cartesian.product': false,
      'hive.mr3.delete.vertex.local.directory': false,  // may be useful when using Fargate
      'hive.tez.llap.min.reducer.per.executor': "0.2f",
      'hive.cluster.delegation.token.renew-interval': 1,
      'hive.distcp.privileged.doAs': "hive",
      'hive.exec.input.listing.max.threads': 50,
      'hive.orc.compute.splits.num.threads': 20,
      'hive.orc.splits.include.file.footer': false
    },
    mr3: {
      'mr3.am.client.thread-count': 32,
      'mr3.am.permit.custom.user.class': true,
      'mr3.k8s.pod.creation.timeout.ms': 300000,
      'mr3.container.command.num.waits.to.kill': 6,
      'mr3.k8s.pod.master.toleration.specs': "",
      'mr3.k8s.pod.worker.toleration.specs': "",
      'mr3.k8s.readiness.probe.initial.delay.secs': 15,
      'mr3.k8s.readiness.probe.period.secs': 15,
      'mr3.k8s.liveness.probe.initial.delay.secs': 30,
      'mr3.k8s.liveness.probe.period.secs': 30,
      'mr3.container.task.failure.num.sleeps': 0,
      'mr3.k8s.pod.worker.security.context.sysctls': "",
      'mr3.k8s.pod.worker.init.container.image': "busybox",
      'mr3.k8s.shufflehandler.process.memory.mb': 1024
    },
    tez: {
      'tez.counters.max': 10000,
      'tez.counters.max.groups': 3000,
      'tez.runtime.pipelined.sorter.sort.threads': 2,
      'tez.shuffle-vertex-manager.max-src-fraction': 0.4,
      'tez.shuffle-vertex-manager.min-src-fraction': 0.2,
      'tez.runtime.pipelined.sorter.lazy-allocate.memory': false,
      'tez.runtime.shuffle.parallel.copies': 20, 
      'tez.shuffle-vertex-manager.auto-parallel.min.num.tasks': 40,
      'tez.shuffle-vertex-manager.auto-parallel.max.reduction.percentage': 10,
      'tez.shuffle-vertex-manager.use-stats-auto-parallelism': true,
      'tez.shuffle.vertex.manager.auto.parallelism.min.percent': 20,
      'tez.shuffle.connection-keep-alive.enable': true,
      'tez.shuffle.listen.queue.size': 16384,
      'tez.shuffle.mapoutput-info.meta.cache.size': 10000,
      'tez.runtime.shuffle.src-attempt.abort.limit': 10,
      'tez.runtime.shuffle.connect.timeout': 7500,
      'tez.grouping.max-size': 1073741824,
      'tez.grouping.min-size': 16777216,
      'tez.grouping.split-waves': 1.7
    },
    copy: {
    }
  };

  setCopy(config.copy, "hive.metastore.keytab.file");
  setCopy(config.copy, "hive.metastore.principal");
  setCopy(config.copy, "hive.metastore.secure.mode");
  setCopy(config.copy, "hive.metastore.host");
  setCopy(config.copy, "hive.metastore.port");
  setCopy(config.copy, "hive.warehouse.dir");
  setCopy(config.copy, "hive.server2.authentication.mode");
  setCopy(config.copy, "hive.server2.keytab.file");
  setCopy(config.copy, "hive.server2.principal");
  setCopy(config.copy, "hive.server2.http.port");
  setCopy(config.copy, "hive.server2.host");
  setCopy(config.copy, "hive.server2.port");
  setCopy(config.copy, "hive.session.id");
  setCopy(config.copy, "yarn.timeline-service.hostname");
  // from defaults.ini for Grafana
  setCopy(config.copy, "HOSTNAME");

  return config;
}

function setCopy(copy: {[_: string]: string }, key: string) {
  copy[key] = `\${${key}}`;
}
