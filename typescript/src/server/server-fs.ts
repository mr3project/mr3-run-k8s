import * as jsyaml from 'js-yaml';
import { strict as assert } from 'assert';

import { buildStateFromRunEnv, buildStateFromRunEnvDriver, RunEnv } from './run-env';

import * as state from './state';

// YAML

import * as cluster_role from './yaml/cluster-role.yaml';

import * as workdir_pv from './yaml/workdir-pv.yaml';
import * as workdir_pvc from './yaml/workdir-pvc.yaml';

import * as env_secret from './yaml/env-secret.yaml';
import * as env_secret_spark from './yaml/env-secret-spark.yaml';
import * as hive_secret from './yaml/hive-secret.yaml';
import * as worker_secret from './yaml/worker-secret.yaml';
import * as spark_secret from './yaml/spark-secret.yaml';
import * as spark_worker_secret from './yaml/spark-worker-secret.yaml';

import * as env_configmap from './yaml/env-configmap.yaml';
import * as env_configmap_internal from './yaml/env-configmap-internal.yaml';
import * as env_configmap_metastore from './yaml/env-configmap-metastore.yaml';
import * as env_configmap_spark from './yaml/env-configmap-spark.yaml';

import * as hive_configmap from './yaml/hive-configmap.yaml';
import * as hive_configmap_internal from './yaml/hive-configmap-internal.yaml';
import * as hive_configmap_metastore from './yaml/hive-configmap-metastore.yaml';
import * as spark_configmap from './yaml/spark-configmap.yaml';

import * as client_am_config from './yaml/client-am-config.yaml';
import * as client_am_config_spark from './yaml/client-am-config-spark.yaml';

import * as hive_role from './yaml/hive-role.yaml';
import * as master_role from './yaml/master-role.yaml';
import * as worker_role from './yaml/worker-role.yaml';
import * as spark_role from './yaml/spark-role.yaml';

import * as hive_service_account from './yaml/hive-service-account.yaml';
import * as master_service_account from './yaml/master-service-account.yaml';
import * as worker_service_account from './yaml/worker-service-account.yaml';
import * as spark_service_account from './yaml/spark-service-account.yaml';
import * as spark_master_service_account from './yaml/spark-master-service-account.yaml';
import * as spark_worker_service_account from './yaml/spark-worker-service-account.yaml';

import * as cluster_role_binding from './yaml/cluster-role-binding.yaml';
import * as spark_cluster_role_binding from './yaml/spark-cluster-role-binding.yaml';
import * as master_cluster_role_binding from './yaml/master-cluster-role-binding.yaml';
import * as spark_master_cluster_role_binding from './yaml/spark-master-cluster-role-binding.yaml';

import * as hive_role_binding from './yaml/hive-role-binding.yaml';
import * as master_role_binding from './yaml/master-role-binding.yaml';
import * as worker_role_binding from './yaml/worker-role-binding.yaml';
import * as spark_role_binding from './yaml/spark-role-binding.yaml';
import * as spark_master_role_binding from './yaml/spark-master-role-binding.yaml';
import * as spark_worker_role_binding from './yaml/spark-worker-role-binding.yaml';

import * as metastore_yaml from './yaml/metastore.yaml';
import * as metastore_service from './yaml/metastore-service.yaml';

import * as hive_yaml from './yaml/hive.yaml';

import * as hive_internal_yaml from './yaml/hive-internal.yaml';
import * as hiveserver2_internal_service from './yaml/hiveserver2-internal-service.yaml';

import * as ranger_configmap from './yaml/ranger-configmap.yaml';
import * as ranger_secret from './yaml/ranger-secret.yaml';
import * as ranger_yaml from './yaml/ranger.yaml';
import * as ranger_service from './yaml/ranger-service.yaml';

import * as ats_env_secret from './yaml/ats-env-secret.yaml';
import * as ats_configmap from './yaml/ats-configmap.yaml';
import * as ats_secret from './yaml/ats-secret.yaml';
import * as ats_yaml from './yaml/ats.yaml';
import * as ats_service from './yaml/ats-service.yaml';

import * as superset_configmap_yaml from './yaml/superset-configmap.yaml';
import * as superset_secret_yaml from './yaml/superset-secret.yaml';
import * as superset_yaml from './yaml/superset.yaml';
import * as superset_service_yaml from './yaml/superset-service.yaml';

import * as apache_configmap_yaml from './yaml/apache-configmap.yaml';
import * as apache_yaml from './yaml/apache.yaml';

import * as spark_driver_service_yaml from './yaml/spark-driver-service.yaml';
import * as spark_driver_pod_yaml from './yaml/spark-driver-pod.yaml';

export function buildYaml(module: any, state: state.T): string {
  try {
    const yaml = module.build(state);
    return jsyaml.dump(yaml, { noArrayIndent: true, quotingType: "'" });
  } catch(e) {
    return `ERROR: ${e}`;
  }
}

function buildYamlsFromState(stateConf: state.T): string[] {
  let result: string[] = [];

  result.push(buildYaml(cluster_role, stateConf));

  if (stateConf.env.basics.createPersistentVolume !== undefined) {
    result.push(buildYaml(workdir_pv, stateConf));
  }
  if (stateConf.env.basics.persistentVolumeClaim !== undefined) {
    result.push(buildYaml(workdir_pvc, stateConf));
  }

  result.push(buildYaml(env_secret, stateConf));
  result.push(buildYaml(env_secret_spark, stateConf));
  result.push(buildYaml(hive_secret, stateConf));
  result.push(buildYaml(worker_secret, stateConf));
  result.push(buildYaml(spark_secret, stateConf));
  result.push(buildYaml(spark_worker_secret, stateConf));

  result.push(buildYaml(env_configmap, stateConf));
  result.push(buildYaml(env_configmap_internal, stateConf));
  result.push(buildYaml(env_configmap_metastore, stateConf));
  result.push(buildYaml(env_configmap_spark, stateConf));

  result.push(buildYaml(hive_configmap, stateConf));
  result.push(buildYaml(hive_configmap_internal, stateConf));
  result.push(buildYaml(hive_configmap_metastore, stateConf));
  result.push(buildYaml(spark_configmap, stateConf));

  result.push(buildYaml(client_am_config, stateConf));
  result.push(buildYaml(client_am_config_spark, stateConf));

  result.push(buildYaml(hive_role, stateConf));
  result.push(buildYaml(master_role, stateConf));
  result.push(buildYaml(worker_role, stateConf));
  result.push(buildYaml(spark_role, stateConf));

  result.push(buildYaml(hive_service_account, stateConf));
  result.push(buildYaml(master_service_account, stateConf));
  result.push(buildYaml(worker_service_account, stateConf));
  result.push(buildYaml(spark_service_account, stateConf));
  result.push(buildYaml(spark_master_service_account, stateConf));
  result.push(buildYaml(spark_worker_service_account, stateConf));

  result.push(buildYaml(cluster_role_binding, stateConf));
  result.push(buildYaml(spark_cluster_role_binding, stateConf));
  result.push(buildYaml(master_cluster_role_binding, stateConf));
  result.push(buildYaml(spark_master_cluster_role_binding, stateConf));

  result.push(buildYaml(hive_role_binding, stateConf));
  result.push(buildYaml(master_role_binding, stateConf));
  result.push(buildYaml(worker_role_binding, stateConf));
  result.push(buildYaml(spark_role_binding, stateConf));
  result.push(buildYaml(spark_master_role_binding, stateConf));
  result.push(buildYaml(spark_worker_role_binding, stateConf));

  result.push(buildYaml(metastore_yaml, stateConf));
  result.push(buildYaml(metastore_service, stateConf));

  result.push(buildYaml(hive_yaml, stateConf));

  if (stateConf.env.superset.supersetEnabled) {
    result.push(buildYaml(hive_internal_yaml, stateConf));
    result.push(buildYaml(hiveserver2_internal_service, stateConf));
  }

  if (stateConf.env.hive.authorization === "RangerHiveAuthorizerFactory") {
    result.push(buildYaml(ranger_configmap, stateConf));
    result.push(buildYaml(ranger_secret, stateConf));
    result.push(buildYaml(ranger_service, stateConf));
    result.push(buildYaml(ranger_yaml, stateConf));
  }

  if (stateConf.env.timeline.timelineEnabled) {
    result.push(buildYaml(ats_env_secret, stateConf));
    result.push(buildYaml(ats_configmap, stateConf));
    result.push(buildYaml(ats_secret, stateConf));
    result.push(buildYaml(ats_service, stateConf));
    result.push(buildYaml(ats_yaml, stateConf));
  }

  if (stateConf.env.superset.supersetEnabled) {
    result.push(buildYaml(superset_configmap_yaml, stateConf));
    result.push(buildYaml(superset_secret_yaml, stateConf));
    result.push(buildYaml(superset_service_yaml, stateConf));
    result.push(buildYaml(superset_yaml, stateConf));
  }

  result.push(buildYaml(apache_configmap_yaml, stateConf));
  result.push(buildYaml(apache_yaml, stateConf));

  return result;
}

function buildSparkDriverYamlsFromState(stateConf: state.T): string[] {
  let result: string[] = [];

  result.push(buildYaml(spark_driver_service_yaml , stateConf));
  result.push(buildYaml(spark_driver_pod_yaml , stateConf));

  return result;
}
//
// api
//

export function buildYamlsFromRunEnv(input: RunEnv): string[] {
  const stateConf = buildStateFromRunEnv(input);
  const result = buildYamlsFromState(stateConf);
  return result;
}

export function buildSparkDriverYamlsFromRunEnv(input: RunEnv): string[] {
  const stateConf = buildStateFromRunEnvDriver(input);
  assert(stateConf.env.driver !== undefined);

  const result = buildSparkDriverYamlsFromState(stateConf);
  return result;
}
