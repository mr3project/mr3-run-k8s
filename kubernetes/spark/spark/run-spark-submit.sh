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

function run_spark_submit_init {
    mr3_setup_init
    spark_setup_init

    BASE_OUT=$SPARK_BASE_DIR/spark-submit-result
    spark_setup_init_output_dir $BASE_OUT

    common_setup_cleanup
}

function run_spark_submit_main {
    spark_setup_parse_args_common $@

    run_spark_submit_init

    declare log_dir="$OUT/spark-logs"
    declare out_file="$log_dir/out-spark-submit.txt"

    spark_setup_config_spark_logs $log_dir
    spark_setup_init_run_configs $LOCAL_MODE
    spark_setup_init_driver_opts
    spark_setup_extra_opts

    # HTTP2_DISABLE=false is now okay with fabric8io/kubernetes-client to 4.9.2+
    export HTTP2_DISABLE=true

    # use '--master spark' because '--master mr3' is rejected from Spark 3.0.3
    $SPARK_HOME/bin/spark-submit \
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
        2>&1 | tee $out_file
}

run_spark_submit_main $@
