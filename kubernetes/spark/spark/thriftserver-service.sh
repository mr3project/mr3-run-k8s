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
if [[ -f "$BASE_DIR/env-secret.sh" ]]; then
  source $BASE_DIR/env-secret.sh
fi
source $BASE_DIR/common-setup.sh
source $MR3_BASE_DIR/mr3-setup.sh
source $SPARK_BASE_DIR/spark-setup.sh

function parse_args {
    START_THRIFTSERVER=false
    STOP_THRIFTSERVER=false
    REMAINING_ARGS=""
    while [[ -n $1 ]]; do
        case "$1" in
            start)
                START_THRIFTSERVER=true
                shift
                ;;
            stop)
                STOP_THRIFTSERVER=true
                shift
                ;;
            restart)
                START_THRIFTSERVER=true
                STOP_THRIFTSERVER=true
                shift
                ;;
            *)
                REMAINING_ARGS="$REMAINING_ARGS $1"
                shift
                ;;
        esac
    done
}

function thriftserver_service_init {
    mr3_setup_init
    spark_setup_init

    BASE_OUT=$SPARK_BASE_DIR/thriftserver-service-result
    spark_setup_init_output_dir $BASE_OUT
}

function start_thriftserver {
    thriftserver_service_init

    declare log_dir="$OUT/spark-logs"
    declare out_file="$log_dir/out-spark-shell.txt"

    spark_setup_config_spark_logs $log_dir
    spark_setup_init_run_configs $LOCAL_MODE
    spark_setup_init_driver_opts
    spark_setup_extra_opts

    # Spark thirft server writes log file under SPARK_LOG_DIR
    # cf. sbin/spark-daemon.sh
    export SPARK_LOG_DIR=$log_dir

    # HTTP2_DISABLE=false is now okay with fabric8io/kubernetes-client to 4.9.2+
    export HTTP2_DISABLE=true

    SPARK_DRIVER_OPTS="$SPARK_DRIVER_OPTS -Dhive.server2.thrift.bind.host=$SPARK_THRIFT_SERVER_HOST"
    SPARK_DRIVER_OPTS="$SPARK_DRIVER_OPTS -Dhive.server2.thrift.port=$SPARK_THRIFT_SERVER_PORT"

    # use '--master spark' because '--master mr3' is rejected from Spark 3.0.3
    $SPARK_HOME/sbin/start-thriftserver.sh \
        --driver-java-options "$SPARK_DRIVER_OPTS" \
        --master spark \
        --jars "$SPARK_DRIVER_JARS" \
        --driver-class-path "$SPARK_DRIVER_CP" \
        --conf spark.driver.cores=$SPARK_DRIVER_CORES \
        --conf spark.driver.memory="${SPARK_DRIVER_MEMORY_MB}m" \
        --conf spark.yarn.populateHadoopClasspath=false \
        --conf spark.hadoop.yarn.timeline-service.enabled=false \
        --conf spark.driver.port=$SPARK_DRIVER_PORT \
        --conf spark.ui.port=$SPARK_UI_PORT \
        --conf spark.ui.proxyBase=${PROXY_BASE}/${DRIVER_NAME} \
        --conf spark.driver.bindAddress=0.0.0.0 \
        --conf spark.driver.host=${DRIVER_NAME}.${SPARK_MR3_NAMESPACE}.svc.cluster.local \
        --conf spark.kerberos.keytab=$SPARK_KERBEROS_KEYTAB \
        --conf spark.kerberos.principal=$SPARK_KERBEROS_PRINCIPAL \
        --conf spark.hadoop.yarn.resourcemanager.principal=$SPARK_KERBEROS_USER \
        $REMAINING_ARGS \
        2>&1

    sleep infinity
}

function stop_thriftserver {
    thriftserver_service_init

    $SPARK_HOME/sbin/stop-thriftserver.sh
}

function thriftserver_main {
    spark_setup_parse_args_common $@
    parse_args $REMAINING_ARGS

    if [ $STOP_THRIFTSERVER = true ]; then
        stop_thriftserver
    fi
    if [ $START_THRIFTSERVER = true ]; then
        start_thriftserver
    fi
}

thriftserver_main $@

