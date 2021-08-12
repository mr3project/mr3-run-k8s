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

REMOTE_BASE_DIR=/opt/mr3-run
SPARK_REMOTE_WORK_DIR=$REMOTE_BASE_DIR/spark
CONF_DIR_MOUNT_DIR=$REMOTE_BASE_DIR/conf
# for mr3.k8s.keytab.mount.dir
KEYTAB_MOUNT_DIR=$REMOTE_BASE_DIR/key

# required if mr3.dag.recovery.enabled=true in mr3-site.xml
#WORK_DIR_PERSISTENT_VOLUME_CLAIM=workdir-pvc
#WORK_DIR_PERSISTENT_VOLUME_CLAIM_MOUNT_DIR=/opt/mr3-run/work-dir

RUN_AWS_EKS=false
CREATE_SERVICE_ACCOUNTS=true

#
# Step 1. Building a Docker image
#

DOCKER_SPARK_IMG=${DOCKER_SPARK_IMG:-10.1.90.9:5000/spark3:latest}
DOCKER_SPARK_FILE=${DOCKER_SPARK_FILE:-Dockerfile}

# do not use a composite name like spark@RED, spark/red0@RED (which results in NPE in ContainerWorker)
SPARK_DOCKER_USER=root

#
# Step 2. Configuring Pods
#

SPARK_MR3_NAMESPACE=sparkmr3
SPARK_MR3_SERVICE_ACCOUNT=spark-service-account
SPARK_CONF_DIR_CONFIGMAP=sparkmr3-conf-configmap

MASTER_SERVICE_ACCOUNT=master-service-account
WORKER_SERVICE_ACCOUNT=worker-service-account

# CREATE_KEYTAB_SECRET specifies whether or not to create a Secret from key/*.
# set to true when running the Spark driver with Kerberos inside Kubernetes 
CREATE_KEYTAB_SECRET=false
SPARK_KEYTAB_SECRET=sparkmr3-keytab-secret

#
# Step 6. Additional settings
#

CREATE_PROMETHEUS_SERVICE=false

# See conf/log4j.properties to update the logging configuration (for Spark driver, DAGAppMaster, ContainerWorker)

#
# Additional environment variables
#
# Here the user can define additional environment variables using 'EXPORT', e.g.:
#   export FOO=bar
#

# SPARK_HOME is automatically set by spark-setup.sh if Spark-MR3 is executed
unset SPARK_HOME

