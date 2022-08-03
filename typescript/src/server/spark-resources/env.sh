#!/bin/bash

SPARK_MR3_NAMESPACE=${env.basics.namespace}

REMOTE_BASE_DIR=${env.consts.dir.base}
SPARK_REMOTE_WORK_DIR=${env.consts.dir.spark}
CONF_DIR_MOUNT_DIR=${env.consts.dir.conf}
KEYTAB_MOUNT_DIR=${env.consts.dir.keytab}
WORK_DIR_PERSISTENT_VOLUME_CLAIM=${env.consts.name.persistentVolumeClaim}
WORK_DIR_PERSISTENT_VOLUME_CLAIM_MOUNT_DIR=${env.consts.dir.work}

DOCKER_SPARK_IMG=${env.docker.docker.sparkImage}
SPARK_DOCKER_USER=${env.docker.docker.sparkUser}

SPARK_MR3_SERVICE_ACCOUNT=${env.consts.name.spark.serviceAccount}
MASTER_SERVICE_ACCOUNT=${env.consts.name.mr3.sparkMasterServiceAccount}
WORKER_SERVICE_ACCOUNT=${env.consts.name.mr3.sparkWorkerServiceAccount}
SPARK_CONF_DIR_CONFIGMAP=${env.consts.name.spark.configMap}

CREATE_KEYTAB_SECRET=${env.secret.createSecret}
SPARK_KEYTAB_SECRET=${env.consts.name.spark.secret}

CREATE_WORKER_SECRET=${env.secret.createSecret}
SPARK_WORKER_SECRET=${env.consts.name.spark.workerSecret}

SPARK_DRIVER_PORT=${env.consts.spark.port}
SPARK_UI_PORT=${env.consts.spark.uiPort}

PROXY_BASE=${env.basics.apacheServiceUrl}

SPARK_METASTORE_WAREHOUSE=${env.basics.warehouseDir}
SPARK_METASTORE_HOST=${env.metastore.kind === "internal" ? env.consts.name.metastore.service + '.' + env.basics.namespace + '.svc.cluster.local' : env.metastore.host}
SPARK_METASTORE_PORT=${env.metastore.kind === "internal" ? env.consts.metastore.port : env.metastore.port}

HIVE_METASTORE_SECURE_MODE=${env.hive.secureModeMetastore}
HIVE_METASTORE_KERBEROS_KEYTAB=${env.hive.secureModeMetastore ? env.consts.dir.keytab + '/' + env.secret.kerberosSecret.server.keytabInternal : ''}
HIVE_METASTORE_KERBEROS_PRINCIPAL=${env.hive.secureModeMetastore ? env.secret.kerberosSecret.server.principalInternal : ''}

SPARK_KERBEROS_KEYTAB=${env.secret.spark !== undefined ? env.consts.dir.keytab + '/' + env.secret.spark.keytab : ''}
SPARK_KERBEROS_PRINCIPAL=${env.secret.spark !== undefined ? env.secret.spark.principal : ''}
SPARK_KERBEROS_USER=${env.secret.spark !== undefined ? env.secret.sparkUser : ''}

SPARK_SSL_TRUSTSTORE=${env.secret.truststorePath}
SPARK_SSL_TRUSTSTORETYPE=${env.secret.truststoreType}

unset SPARK_HOME

