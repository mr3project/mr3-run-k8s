#!/bin/bash

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#
# All settings which should be consistent with Dockerfile and ../spark-yaml/spark-submit.yaml.
#

# JAVA_HOME and PATH are set either by run-spark-setup.sh outside K8s or by the container inside K8s.

#
# Basic settings
# 

SPARK_MR3_NAMESPACE=sparkmr3

REMOTE_BASE_DIR=/opt/mr3-run
SPARK_REMOTE_WORK_DIR=$REMOTE_BASE_DIR/spark
CONF_DIR_MOUNT_DIR=$REMOTE_BASE_DIR/conf
# for mr3.k8s.keytab.mount.dir
KEYTAB_MOUNT_DIR=$REMOTE_BASE_DIR/key

CREATE_PERSISTENT_VOLUME=false
CREATE_SERVICE_ACCOUNTS=true

# required if mr3.dag.recovery.enabled=true in mr3-site.xml
WORK_DIR_PERSISTENT_VOLUME_CLAIM=
WORK_DIR_PERSISTENT_VOLUME_CLAIM_MOUNT_DIR=

#
# Step 1. Building a Docker image
#

DOCKER_SPARK_IMG=${DOCKER_SPARK_IMG:-mr3project/spark3:3.2.2}
DOCKER_SPARK_FILE=${DOCKER_SPARK_FILE:-Dockerfile}

# do not use a composite name like spark@RED, spark/red0@RED (which results in NPE in ContainerWorker)
SPARK_DOCKER_USER=spark

#
# Step 2. Configuring Pods
#

SPARK_MR3_SERVICE_ACCOUNT=spark-service-account
MASTER_SERVICE_ACCOUNT=master-service-account
WORKER_SERVICE_ACCOUNT=worker-service-account
SPARK_CONF_DIR_CONFIGMAP=sparkmr3-conf-configmap

# CREATE_KEYTAB_SECRET specifies whether or not to create a Secret from key/*.
# set to true when running the Spark driver with Kerberos inside Kubernetes 
CREATE_KEYTAB_SECRET=false
SPARK_KEYTAB_SECRET=sparkmr3-keytab-secret

# CREATE_WORKER_SECRET specifies whether or not to create a Secret for ContainerWorkers from $WORKER_SECRET_DIR.
# CREATE_WORKER_SECRET is irrelevant to token renewal, and WORKER_SECRET_DIR is not requird to contain keytab files.
# CREATE_WORKER_SECRET should be set to true if:
#   - SSL is enabled
CREATE_WORKER_SECRET=false
SPARK_WORKER_SECRET=sparkmr3-worker-secret
WORKER_SECRET_DIR=$BASE_DIR/spark/key/

SPARK_DRIVER_PORT=9850
SPARK_UI_PORT=4040

# by default, spark.ui.proxyBase is set to ${PROXY_BASE}/${DRIVER_NAME}
PROXY_BASE=http://red0:8080

# SparkSQL

SPARK_METASTORE_WAREHOUSE=s3a://hivemr3/warehouse
SPARK_METASTORE_HOST=metastore.hivemr3.svc.cluster.local
SPARK_METASTORE_PORT=9851

# for connecting to Metastore with Kerberos
HIVE_METASTORE_SECURE_MODE=false
HIVE_METASTORE_KERBEROS_KEYTAB=$KEYTAB_MOUNT_DIR/hive-hiveserver2-internal.hivemr3.svc.cluster.local.keytab
HIVE_METASTORE_KERBEROS_PRINCIPAL=hive/hiveserver2-internal.hivemr3.svc.cluster.local@RED

SPARK_KERBEROS_KEYTAB=$KEYTAB_MOUNT_DIR/spark.keytab
SPARK_KERBEROS_PRINCIPAL=spark@RED
SPARK_KERBEROS_USER=spark

#
# Step 5. Configuring Spark driver
#

# Truststore for Spark driver
SPARK_SSL_TRUSTSTORE=$KEYTAB_MOUNT_DIR/sparkmr3-ssl-certificate.jks
SPARK_SSL_TRUSTSTORETYPE=jks
# We do not need the password for accessing S3 with SSL.

#
# Step 6. Additional settings
#

# See conf/log4j.properties to update the logging configuration (for Spark driver, DAGAppMaster, ContainerWorker)

#
# Additional environment variables
#
# Here the user can define additional environment variables using 'EXPORT', e.g.:
#   export FOO=bar
#

export AWS_ACCESS_KEY_ID=_your_aws_access_key_id_
export AWS_SECRET_ACCESS_KEY=_your_aws_secret_secret_key_

# SPARK_HOME is automatically set by spark-setup.sh if Spark-MR3 is executed
unset SPARK_HOME

