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

DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_DIR=$(readlink -f $DIR/..)
source $BASE_DIR/env.sh
source $BASE_DIR/common-setup.sh
source $SPARK_BASE_DIR/spark-setup.sh
source $MR3_BASE_DIR/mr3-setup.sh

LOCAL_MODE="kubernetes"

spark_setup_init
mr3_setup_init

mr3_setup_update_hadoop_opts $LOCAL_MODE

# include SPARK_CLASSPATH in order to properly configure Log4j 2
export CLASSPATH=$BASE_DIR/conf:$MR3_CLASSPATH:$SPARK_CLASSPATH:$CLASSPATH

CLASS=com.datamonad.mr3.client.control.MasterControlK8s

exec $JAVA_HOME/bin/java -Dlog4j.configuration=file:$BASE_DIR/conf/log4j.properties $HADOOP_OPTS $CLASS "$@"

