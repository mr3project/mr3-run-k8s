export interface T {
  dir: {
    base: string;
    lib: string;
    conf: string;
    keytab: string;
    work: string;
    workLocal: string;
    amLocal: string;
    hive: string;
    scratch: string;
    rangerPolicyCache: string;
    hiveResult: string;
    ranger: string;
    rangerConf: string;
    rangerKeytab: string;
    rangerWork: string;
    timeline: string;
    timelineConf: string;
    timelineKeytab: string;
    timelineWork: string;
    prometheusWork: string;
    grafanaWork: string;
    superset: string;
    supersetConf: string;
    supersetKeytab: string;
    supersetWork: string;
    spark: string;
    sparkAmStagingDir: string;
  };
  name: {
    metastore: {
      metastore: string;
      service: string;
    };
    hive: {
      hiveserver2: string;
      hiveserver2Internal: string;
      service: string;
      serviceInternal: string;
      serviceAccount: string;
      configMap: string;
      configMapInternal: string;
      configMapMetastore: string;
      secret: string;
      workerSecret: string;
    };
    mr3: {
      masterServiceAccount: string;
      workerServiceAccount: string;
      sparkMasterServiceAccount: string;
      sparkWorkerServiceAccount: string;
    };
    ranger: {
      ranger: string;
      service: string;
      configMap: string;
      secret: string;
    };
    timeline: {
      timeline: string;
      service: string;
      configMap: string;
      secret: string;
      envSecret: string;
    };
    superset: {
      superset: string;
      service: string;
      configScript: string;
      configMap: string;
      secret: string;
    };
    spark: {
      serviceAccount: string;
      configMap: string;
      secret: string;
      workerSecret: string;
      envConfigMap: string;
      envSecret: string;
    };
    envConfigMap: string;
    envConfigMapInternal: string;
    envConfigMapMetastore: string;
    envConfigMapSpark: string;
    envSecret: string;
    envSecretSpark: string;
    amConfigMap: string;
    amConfigMapSpark: string;
    persistentVolume: string;
    persistentVolumeClaim: string;
    envScript: string;
    envSecretScript: string;
  };
  create: {
    serviceAccount: boolean;
  };
  metastore: {
    port: number;
    livenessProbe: number;
  };
  hive: {
    port: number;
    httpport: number;
    amMode: string;
    readinessProbe: number;
    livenessProbe: number;
  };
  mr3: {
    shufflePort: number;
  };
  ranger: {
    httpPort: number;
    httpsPort: number;
    auditPort: number;
    livenessProbe: number;
  };
  timeline: {
    httpPort: number;
    httpsPort: number;
    uiPort: number;
    prometheusPort: number;
    grafanaPort: number;
    livenessProbe: number;
  };
  prometheus: {
    port: number;   // to be used in MR3 DAGAppMaster
  };
  superset: {
    port: number;
    livenessProbe: number;
  };
  spark: {
    port: number;
    uiPort: number;
  };
  logLevel: string;
  apache: { 
    apache: string;
    service: string;
    apacheConfigMap: string;
    apacheConf: string;
    apacheConfDir: string;
    httpPort: number;
    httpsPort: number;
    httpdServerPort: number;
    accessLogDir: string;
    livenessProbe: number;
    ingress: string;
  };
}

export const config: T = {
  dir: {
    base: "/opt/mr3-run",
    lib: "/opt/mr3-run/lib",
    conf: "/opt/mr3-run/conf",
    keytab: "/opt/mr3-run/key",
    work: "/opt/mr3-run/work-dir",
    workLocal: "/opt/mr3-run/work-local-dir",
    amLocal: "/opt/mr3-run/am-local-dir",
    // HiveServer2
    hive: "/opt/mr3-run/hive",
    scratch: "/opt/mr3-run/scratch-dir",
    rangerPolicyCache: "/opt/mr3-run/hiveserver2-ranger-policycache",
    hiveResult: "/opt/mr3-run/hive/run-result",
    // Ranger
    ranger: "/opt/mr3-run/ranger",
    rangerConf: "/opt/mr3-run/ranger/conf",
    rangerKeytab: "/opt/mr3-run/ranger/key",
    rangerWork: "/opt/mr3-run/ranger/work-dir",
    // Timeline
    timeline: "/opt/mr3-run/ats",
    timelineConf: "/opt/mr3-run/ats/conf",
    timelineKeytab: "/opt/mr3-run/ats/key",
    timelineWork: "/opt/mr3-run/ats/work-dir",
    // Prometheus
    prometheusWork: "/opt/mr3-run/ats/prometheus/data",
    // Grafana
    grafanaWork: "/opt/mr3-run/ats/grafana/data",
    // Superset
    superset: "/app/pythonpath",  // for superset_config.py
    supersetConf: "/opt/mr3-run/superset/conf",
    supersetKeytab: "/opt/mr3-run/superset/key",
    supersetWork: "/opt/mr3-run/superset/work-dir",
    // Spark
    spark: "/opt/mr3-run/spark",
    sparkAmStagingDir: "/opt/mr3-run/work-dir/spark"  // under consts.dir.work
  },
  name: {
    metastore: {
      metastore: "metastore",
      service: "metastore"
    },
    hive: {
      hiveserver2: "hiveserver2",
      hiveserver2Internal: "hiveserver2-internal",
      service: "hiveserver2",
      serviceInternal: "hiveserver2-internal",
      serviceAccount: "hive-service-account",
      configMap: "hivemr3-conf-configmap",
      configMapInternal: "hivemr3-conf-configmap-internal",
      configMapMetastore: "hivemr3-conf-configmap-metastore",
      secret: "hivemr3-keytab-secret",
      workerSecret: "hivemr3-worker-secret"
    },
    mr3: {
      masterServiceAccount: "master-service-account",
      workerServiceAccount: "worker-service-account",
      sparkMasterServiceAccount: "spark-master-service-account",
      sparkWorkerServiceAccount: "spark-worker-service-account"
    },
    ranger: {
      ranger: "ranger",
      service: "ranger",
      configMap: "ranger-conf-configmap",
      secret: "ranger-keytab-secret",
    },
    timeline: {
      timeline: "timeline",
      service: "timeline",
      configMap: "timeline-conf-configmap",
      secret: "timeline-keytab-secret",
      envSecret: "timeline-env-secret"
    },
    superset: {
      superset: "superset",
      service: "supersetbi",        // 'superset' is reserved by K8s!
      configScript: "superset_config.py",
      configMap: "superset-configmap",
      secret: "superset-secret"
    },
    spark: {
      serviceAccount: "spark-service-account",
      configMap: "sparkmr3-conf-configmap",
      secret: "sparkmr3-keytab-secret",
      workerSecret: "sparkmr3-worker-secret",
      envConfigMap: "env-configmap-spark",
      envSecret: "env-secret-spark"
    },
    envConfigMap: "env-configmap",
    envConfigMapInternal: "env-configmap-internal",
    envConfigMapMetastore: "env-configmap-metastore",
    envConfigMapSpark: "env-configmap-spark",
    envSecret: "env-secret",
    envSecretSpark: "env-secret-spark",
    amConfigMap: "client-am-config",
    amConfigMapSpark: "client-am-config-spark",
    persistentVolume: "workdir-pv",
    persistentVolumeClaim: "workdir-pvc",
    envScript: "env.sh",
    envSecretScript: "env-secret.sh",
  },
  create: {
    serviceAccount: true
  },
  metastore: {
    port: 9851,
    livenessProbe: 60
  },
  hive: {
    port: 9852,
    httpport: 10001,
    amMode: "--kubernetes",
    readinessProbe: 60,
    livenessProbe: 60
  },
  mr3: {
    // TODO: document that ports start at 15500
    shufflePort: 15550,
  },
  ranger: {
    httpPort: 6080,
    httpsPort: 6182,
    auditPort: 6083,
    livenessProbe: 120
  },
  timeline: {
    httpPort: 9188,
    httpsPort: 9190,
    uiPort: 9192,
    prometheusPort: 9090,   // fixed by Prometheus
    grafanaPort: 3000,
    livenessProbe: 120
  },
  prometheus: {
    port: 9890
  },
  superset: {
    port: 8088,
    livenessProbe: 120
  },
  spark: {
    port: 9850,
    uiPort: 4040
  },
  logLevel: "INFO",
  apache: {
    apache: "apache",
    service: "apache",
    apacheConfigMap: "apache-configmap",
    apacheConf: "httpd.conf",
    apacheConfDir: "/usr/local/apache2/conf",
    httpPort: 8080,
    httpsPort: 443,
    httpdServerPort: 8080,
    accessLogDir: "/usr/local/apache2/logs",
    livenessProbe: 120,
    ingress: "apache-ingress"
  }
};
