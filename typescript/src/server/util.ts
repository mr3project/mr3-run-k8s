import * as state from './state';
import * as config from './api/config';
import { strict as assert } from 'assert';
import { isValidPositiveNumber } from '../helper';

// return 0 if Web-UI port should not be used
export function getWebUiPort(config: config.T): number {
  const webPort = config.hive['hive.server2.webui.port'];
  const hs2WebPort = 
    typeof webPort == "string" ? parseInt(webPort) : 
    typeof webPort == "boolean" ? 0 :
    webPort;
  return isValidPositiveNumber(hs2WebPort) ? hs2WebPort : 0;
}

export function createMasterNodeSelector(s: state.T) {
  const env = s.env;
  const masterNodeSelector = 
    env.basics.masterNodeSelector !== undefined ?
    { [env.basics.masterNodeSelector.key]: env.basics.masterNodeSelector.value } :
    {};
  return masterNodeSelector;
}

// used for hive-service-account, master-service-account, worker-service-account
export function createHiveServiceAccountAnnotations(s: state.T) {
  const env = s.env;
  const hiveServiceAccountAnnotations =
    env.hive.serviceAccountAnnotations !== undefined ?
    { [env.hive.serviceAccountAnnotations.key]: env.hive.serviceAccountAnnotations.value } :
    {};
  return hiveServiceAccountAnnotations;
}

// used for spark-service-account, spark-master-service-account, spark-worker-service-account
export function createSparkServiceAccountAnnotations(s: state.T) {
  const env = s.env;
  const sparkServiceAccountAnnotations =
    env.spark.serviceAccountAnnotations !== undefined ?
    { [env.spark.serviceAccountAnnotations.key]: env.spark.serviceAccountAnnotations.value } :
    {};
  return sparkServiceAccountAnnotations;
}

type EnvVarsT = {
  name: string;
  valueFrom: {
    configMapKeyRef: {
      name: string;
      key: string;
    }
  } 
}[]

export function createEnvVarsFromRandoms(s: state.T): EnvVarsT {
  const env = s.env;
  let envVars = [];
  for (let key in env.randoms.amConfig) {
    const envVar = {
      name: key,
      valueFrom: {
        configMapKeyRef: {
          name: env.consts.name.amConfigMap,
          key: key
        }
      } 
    };
    envVars.push(envVar);
  }
  return envVars;
}

export function createPodAffinity(key: string, label: string) {
  return {
    podAffinity: {
      preferredDuringSchedulingIgnoredDuringExecution: [
        { weight: 100,
          podAffinityTerm: {
            topologyKey: "kubernetes.io/hostname",
            labelSelector: {
              matchLabels: {
                [key]: label
              }
            }
          } 
        }
      ]
    }
  };
}

export function createRequestsLimits(resources: { cpu: number; memoryInMb: number; }) {
  return {
    requests: {
      cpu: resources.cpu,
      memory: `${resources.memoryInMb}Mi`
    },
    limits: {
      cpu: resources.cpu,
      memory: `${resources.memoryInMb}Mi`
    }
  };
}

//
// VolumeMounts
//

const envK8sVolume = "env-k8s-volume";
const envSecretK8sVolume = "env-secret-k8s-volume";
const confK8sVolume = "conf-k8s-volume";
const keyK8sVolume = "key-k8s-volume";
const workDirVolume = "work-dir-volume";

const amLocalVolume = "am-local-volume";
const hiveserver2ScratchVolume = "hivesever2-scratch-volume";
const hiveserver2RangerPolicyVolume = "hiveserver2-ranger-policy-volume";
const hiveserver2ResultVolume = "hiveserver2-result-volume";

const rangerWorkDirVolume = "ranger-work-dir-volume";
const timelineWorkDirVolume = "timeline-work-dir-volume";

const supersetConfigScriptK8sVolume = "superset-config-py-k8s-volume";
const supersetWorkDirVolume = "superset-work-dir-volume";

const apacheHttpdVolume = "apache-httpd-volume";
const apacheLogDirVolume = "apache-log-dir-volume";

const sparkWorkDirVolume = "spark-work-dir-volume";

function createCommonVolumeMounts(s: state.T): Array<any> {
  const env = s.env;

  return [
    { name: envK8sVolume,
      mountPath: `${env.consts.dir.base}/${env.consts.name.envScript}`,
      subPath: env.consts.name.envScript
    },
    { name: envSecretK8sVolume,
      mountPath: `${env.consts.dir.base}/${env.consts.name.envSecretScript}`,
      subPath: env.consts.name.envSecretScript
    },
    { name: confK8sVolume,
      mountPath: env.consts.dir.conf,
      readOnly: true
    },
    { name: keyK8sVolume,
      mountPath: env.consts.dir.keytab,
      readOnly: true
    }
  ];
}

function addPersistentVolumeMount(s: state.T, volumeMounts: Array<any>, volumeName: string, mountPath: string) {
  const env = s.env;

  const persistentVolumeMount = {
    name: volumeName,
    mountPath: mountPath
  };

  volumeMounts.push(persistentVolumeMount); 
}

export function createVolumeMounts(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = createCommonVolumeMounts(s);
  addPersistentVolumeMount(s, volumeMounts, workDirVolume, env.consts.dir.work);

  return volumeMounts; 
}

export function createVolumeMountsForMetastore(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = createCommonVolumeMounts(s);

  return volumeMounts;
}

export function createVolumeMountsForHiveServer2(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = createVolumeMounts(s);

  const extraVolumeMounts = [
    { name: amLocalVolume,
      mountPath: env.consts.dir.amLocal
    },
    { name: hiveserver2ScratchVolume,
      mountPath: env.consts.dir.scratch
    },
    { name: hiveserver2RangerPolicyVolume, 
      mountPath: env.consts.dir.rangerPolicyCache
    },
    { name: hiveserver2ResultVolume, 
      mountPath: env.consts.dir.hiveResult
    }
  ];
  volumeMounts.push(...extraVolumeMounts); 

  return volumeMounts; 
}

export function createVolumeMountsForRanger(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: confK8sVolume,
      mountPath: env.consts.dir.rangerConf,
      readOnly: true
    },
    { name: keyK8sVolume,
      mountPath: env.consts.dir.rangerKeytab,
      readOnly: true
    }
  ];
  addPersistentVolumeMount(s, volumeMounts, rangerWorkDirVolume, env.consts.dir.rangerWork);

  return volumeMounts;
}

export function createVolumeMountsForTimeline(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: confK8sVolume,
      mountPath: env.consts.dir.timelineConf,
      readOnly: true
    },
    { name: keyK8sVolume,
      mountPath: env.consts.dir.timelineKeytab,
      readOnly: true
    },
    { name: envSecretK8sVolume,
      mountPath: `${env.consts.dir.timeline}/${env.consts.name.envSecretScript}`,
      subPath: env.consts.name.envSecretScript
    },
  ];
  addPersistentVolumeMount(s, volumeMounts, timelineWorkDirVolume, env.consts.dir.timelineWork);

  return volumeMounts;
}

export function createVolumeMountsForJetty(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: confK8sVolume,
      mountPath: env.consts.dir.timelineConf,
      readOnly: true
    }
  ];

  return volumeMounts;
}

export function createVolumeMountsForPrometheus(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: confK8sVolume,
      mountPath: env.consts.dir.timelineConf,
      readOnly: true
    }
  ];
  addPersistentVolumeMount(s, volumeMounts, timelineWorkDirVolume, env.consts.dir.prometheusWork);

  return volumeMounts;
}

export function createVolumeMountsForGrafana(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: confK8sVolume,
      mountPath: env.consts.dir.timelineConf,
      readOnly: true
    }
  ];
  addPersistentVolumeMount(s, volumeMounts, timelineWorkDirVolume, env.consts.dir.grafanaWork);

  return volumeMounts;
}

export function createVolumeMountsForSuperset(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: keyK8sVolume,
      mountPath: env.consts.dir.supersetKeytab,
      readOnly: true
    },
    { name: confK8sVolume,
      mountPath: env.consts.dir.supersetConf,
      readOnly: true
    },
    { name: supersetConfigScriptK8sVolume,
      mountPath: `${env.consts.dir.superset}/${env.consts.name.superset.configScript}`,
      subPath: env.consts.name.superset.configScript
    },
  ];
  addPersistentVolumeMount(s, volumeMounts, supersetWorkDirVolume, env.consts.dir.supersetWork);

  return volumeMounts;
}

export function createVolumeMountsForApache(s: state.T): Array<any> {
  const env = s.env;

  let volumeMounts = [
    { name: apacheHttpdVolume,
      mountPath: `${env.consts.apache.apacheConfDir}`,
    },
  ];
  addPersistentVolumeMount(s, volumeMounts, apacheLogDirVolume, env.consts.apache.accessLogDir);

  return volumeMounts;
}

export function createVolumeMountsForSpark(s: state.T): Array<any> {
  const env = s.env;
  assert(env.basics.mr3WorkerHostPaths !== undefined);

  let volumeMounts: any[] = [
    { name: envK8sVolume,
      mountPath: `${env.consts.dir.base}/${env.consts.name.envScript}`,
      subPath: env.consts.name.envScript
    },
    { name: envSecretK8sVolume,
      mountPath: `${env.consts.dir.base}/${env.consts.name.envSecretScript}`,
      subPath: env.consts.name.envSecretScript
    },
    { name: confK8sVolume,
      mountPath: env.consts.dir.conf,
      readOnly: true
    },
    { name: keyK8sVolume,
      mountPath: env.consts.dir.keytab,
      readOnly: true
    }
  ];
  let hostPathVolumeMounts: any[] = env.basics.mr3WorkerHostPaths.split(",").map((p, i) => {
    return { 
      name: 'hostpath-' + i,
      mountPath: p
    };
  });
  let allVolumeMounts = volumeMounts.concat(hostPathVolumeMounts);
  addPersistentVolumeMount(s, allVolumeMounts, sparkWorkDirVolume, env.consts.dir.work);

  return allVolumeMounts;
}

//
// Volumes
//

function createCommonVolumes(s: state.T, isInternal: boolean): Array<any> {
  const env = s.env;

  return [
    // /opt/mr3-run/env.sh
    { name: envK8sVolume,
      configMap: {
        name: isInternal ? env.consts.name.envConfigMapInternal : env.consts.name.envConfigMap
      }
    },
    // /opt/mr3-run/env-secret.sh
    { name: envSecretK8sVolume,
      secret: {
        secretName: env.consts.name.envSecret
      }
    },
    // /opt/mr3-run/conf/*
    { name: confK8sVolume,
      configMap: {
        name: isInternal ? env.consts.name.hive.configMapInternal : env.consts.name.hive.configMap
      }
    },
    // /opt/mr3-run/key/*
    { name: keyK8sVolume,
      secret: {
        secretName: env.consts.name.hive.secret
      }
    }
  ];
}

function createCommonVolumesMetastore(s: state.T): Array<any> {
  const env = s.env;

  return [
    // /opt/mr3-run/env.sh
    { name: envK8sVolume,
      configMap: {
        name: env.consts.name.envConfigMapMetastore
      }
    },
    // /opt/mr3-run/env-secret.sh
    { name: envSecretK8sVolume,
      secret: {
        secretName: env.consts.name.envSecret
      }
    },
    // /opt/mr3-run/conf/*
    { name: confK8sVolume,
      configMap: {
        name: env.consts.name.hive.configMapMetastore
      }
    },
    // /opt/mr3-run/key/*
    { name: keyK8sVolume,
      secret: {
        secretName: env.consts.name.hive.secret
      }
    }
  ];
}

function addPersistentVolume(s: state.T, volumes: Array<any>, volumeName: string) {
  const env = s.env;

  // /opt/mr3-run/work-dir, /opt/mr3-run/ranger/work-dir, /opt/mr3-run/ranger/work-local-dir, /opt/mr3-run/superset/work-dir
  const volume = 
    (env.basics.persistentVolumeClaim !== undefined) ?
    { name: volumeName,
      persistentVolumeClaim: {
        claimName: env.consts.name.persistentVolumeClaim
      }
    } :
    { name: volumeName,
      emptyDir: {}
    };
  volumes.push(volume); 
}

export function createVolumes(s: state.T, isInternal: boolean): Array<any> {
  const env = s.env;

  let volumes = createCommonVolumes(s, isInternal);
  addPersistentVolume(s, volumes, workDirVolume);

  return volumes; 
}

export function createVolumesForMetastore(s: state.T): Array<any> {
  const env = s.env;

  let volumes = createCommonVolumesMetastore(s);

  return volumes;
}

export function createVolumesForHiveServer2(s: state.T, isInternal: boolean): Array<any> {
  const env = s.env;

  let volumes = createVolumes(s, isInternal);
  const extraVolumes = [
    // /opt/mr3-run/am-local-dir
    { name: amLocalVolume,
      emptyDir: {}
    },
    // /opt/mr3-run/scratch-dir
    { name: hiveserver2ScratchVolume,
      emptyDir: {}
    },
    // /opt/mr3-run/hiveserver2-ranger-policycache
    { name: hiveserver2RangerPolicyVolume,
      emptyDir: {}
    },
    // /opt/mr3-run/hive/run-result
    { name: hiveserver2ResultVolume,
      emptyDir: {}
    }
  ];
  volumes.push(...extraVolumes);

  return volumes; 
}

export function createVolumesForRanger(s: state.T): Array<any> {
  const env = s.env;

  let volumes = [
    // /opt/mr3-run/ranger/conf
    { name: confK8sVolume,
      configMap: {
        name: env.consts.name.ranger.configMap
      }
    },
    // /opt/mr3-run/ranger/key
    { name: keyK8sVolume,
      secret: {
        secretName: env.consts.name.ranger.secret
      }
    }
  ];
  addPersistentVolume(s, volumes, rangerWorkDirVolume);

  return volumes;
}

export function createVolumesForTimeline(s: state.T): Array<any> {
  const env = s.env;

  let volumes = [
    // /opt/mr3-run/timeline/conf
    { name: confK8sVolume,
      configMap: {
        name: env.consts.name.timeline.configMap
      }
    },
    // /opt/mr3-run/timeline/key
    { name: keyK8sVolume,
      secret: {
        secretName: env.consts.name.timeline.secret
      }
    },
    // /opt/mr3-run/timeline/env-secret.sh
    { name: envSecretK8sVolume,
      secret: {
        secretName: env.consts.name.timeline.envSecret
      }
    }
  ];
  addPersistentVolume(s, volumes, timelineWorkDirVolume);

  return volumes;
}

export function createVolumesForSuperset(s: state.T): Array<any> {
  const env = s.env;

  let volumes = [
    // /opt/mr3-run/superset/key/*
    { name: keyK8sVolume,
      secret: {
        secretName: env.consts.name.hive.secret
      }
    },
    // /opt/mr3-run/superset/conf
    { name: confK8sVolume,
      configMap: {
        name: env.consts.name.superset.configMap
      }
    },
    // superset_config.py
    { name: supersetConfigScriptK8sVolume,
      secret: {
        secretName: env.consts.name.superset.secret
      }
    }
  ];
  addPersistentVolume(s, volumes, supersetWorkDirVolume);

  return volumes;
}

export function createVolumesForApache(s: state.T): Array<any> {
  const env = s.env;

  let volumes = [
    // /usr/local/apache2/conf/httpd.conf
    { name: apacheHttpdVolume, 
      configMap: {
        name: env.consts.apache.apacheConfigMap
      }
    }
  ];
  addPersistentVolume(s, volumes, apacheLogDirVolume);

  return volumes;
}

export function createVolumesForSpark(s: state.T): Array<any> {
  const env = s.env;
  assert(env.basics.mr3WorkerHostPaths !== undefined);

  let volumes: any[] = [
    { name: envK8sVolume,
      configMap: {
        name: env.consts.name.spark.envConfigMap
      }
    },
    { name: envSecretK8sVolume,
      secret: {
        secretName: env.consts.name.spark.envSecret
      }
    },
    { name: confK8sVolume,
      configMap: {
        name: env.consts.name.spark.configMap
      }
    },
    { name: keyK8sVolume,
      secret: {
        secretName: env.consts.name.spark.secret
      }
    }
  ];
  let hostPathVolumes: any[] = env.basics.mr3WorkerHostPaths.split(",").map((p, i) => {
    return { 
      name: 'hostpath-' + i,
      hostPath: {
        path: p,
        type: "Directory"
      }
    };
  });
  let allVolumes = volumes.concat(hostPathVolumes);
  addPersistentVolume(s, allVolumes, sparkWorkDirVolume);

  return allVolumes;
}