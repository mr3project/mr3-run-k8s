#!/bin/bash

MR3_NAMESPACE=${env.basics.namespace}

REMOTE_BASE_DIR=${env.consts.dir.base}
REMOTE_WORK_DIR=${env.consts.dir.hive}
CONF_DIR_MOUNT_DIR=${env.consts.dir.conf}
KEYTAB_MOUNT_DIR=${env.consts.dir.keytab}
WORK_DIR_PERSISTENT_VOLUME_CLAIM=${env.consts.name.persistentVolumeClaim}
WORK_DIR_PERSISTENT_VOLUME_CLAIM_MOUNT_DIR=${env.consts.dir.work}

DOCKER_HIVE_IMG=${env.docker.docker.image}
DOCKER_HIVE_WORKER_IMG=${env.docker.docker.containerWorkerImage}
DOCKER_USER=${env.docker.docker.user}

MR3_SERVICE_ACCOUNT=${env.consts.name.hive.serviceAccount}
MASTER_SERVICE_ACCOUNT=${env.consts.name.mr3.masterServiceAccount}
WORKER_SERVICE_ACCOUNT=${env.consts.name.mr3.workerServiceAccount}
CONF_DIR_CONFIGMAP=${env.consts.name.hive.configMap}

CREATE_KEYTAB_SECRET=${env.secret.createSecret}
KEYTAB_SECRET=${env.consts.name.hive.secret}

CREATE_WORKER_SECRET=${env.secret.createSecret}
WORKER_SECRET=${env.consts.name.hive.workerSecret}

HIVE_WAREHOUSE_DIR=${env.basics.warehouseDir}

HIVE_DATABASE_HOST=${env.metastore.databaseHost === undefined ? '' : env.metastore.databaseHost}
HIVE_DATABASE_NAME=${env.metastore.databaseName === undefined ? '' : env.metastore.databaseName}
HIVE_METASTORE_DB_TYPE=${env.metastore.dbType === undefined ? '' : env.metastore.dbType.toLowerCase()}

HIVE_METASTORE_HOST=${env.metastore.kind === "internal" ? env.consts.name.metastore.service + '.' + env.basics.namespace + '.svc.cluster.local' : env.metastore.host}
HIVE_METASTORE_PORT=${env.metastore.kind === "internal" ? env.consts.metastore.port : env.metastore.port}
HIVE_METASTORE_HEAPSIZE=${env.metastore.resources.memoryInMb}

HIVE_SERVER2_HOST=$HOSTNAME
HIVE_SERVER2_PORT=${env.consts.hive.port}
HIVE_SERVER2_HTTP_PORT=${env.consts.hive.httpport}
HIVE_SERVER2_HEAPSIZE=${env.hive.resources.memoryInMb}

METASTORE_SECURE_MODE=${env.hive.secureModeMetastore}
HIVE_SERVER2_AUTHENTICATION=${env.hive.authentication}

HIVE_METASTORE_KERBEROS_KEYTAB=${env.hive.secureModeMetastore ? env.consts.dir.keytab + '/' + env.secret.kerberosSecret.server.keytabInternal : ''}
HIVE_METASTORE_KERBEROS_PRINCIPAL=${env.hive.secureModeMetastore ? env.secret.kerberosSecret.server.principalInternal : ''}

HIVE_SERVER2_KERBEROS_KEYTAB=${env.hive.secureMode ? env.consts.dir.keytab + '/' + env.secret.kerberosSecret.server.keytab : ''}
HIVE_SERVER2_KERBEROS_PRINCIPAL=${env.hive.secureMode ? env.secret.kerberosSecret.server.principal : ''}

USER_KEYTAB=${env.hive.secureMode && env.secret.kerberosSecret.user !== undefined ? env.consts.dir.keytab + '/' + env.secret.kerberosSecret.user.keytab : ''}
USER_PRINCIPAL=${env.hive.secureMode && env.secret.kerberosSecret.user !== undefined ? env.secret.kerberosSecret.user.principal : ''}

TOKEN_RENEWAL_HIVE_ENABLED=false
TOKEN_RENEWAL_HDFS_ENABLED=false

HIVE_SERVER2_SSL_TRUSTSTORE=${env.secret.truststorePath}
HIVE_SERVER2_SSL_TRUSTSTORETYPE=${env.secret.truststoreType}

LOG_LEVEL=${env.consts.logLevel}

HIVE_CLIENT_HEAPSIZE=2048

#export HADOOP_OPTS="$HADOOP_OPTS -Dsun.security.krb5.rcache=none"

unset SPARK_HOME

