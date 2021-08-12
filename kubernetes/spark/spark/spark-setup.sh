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

function spark_setup_parse_args_common {
    LOCAL_MODE="kubernetes"
    EXTRA_DRIVER_OPTIONS=""
    EXTRA_DRIVER_CLASS_PATH=""
    EXTRA_JARS=""

    while [[ -n $1 ]]; do
        case "$1" in
            --localthread)
                LOCAL_MODE="local-thread"
                shift
                ;;
            --localprocess)
                LOCAL_MODE="local-process"
                shift
                ;;
            --kubernetes)
                LOCAL_MODE="kubernetes"
                shift
                ;;
            --master)
                shift 2
                ;;
            --driver-java-options)
                EXTRA_DRIVER_OPTIONS=$2
                shift 2
                ;;
            --driver-class-path)
                EXTRA_DRIVER_CLASS_PATH=$2
                shift 2
                ;;
            --jars)
                EXTRA_JARS=$2
                shift 2
                ;;
            *)
                REMAINING_ARGS="$REMAINING_ARGS $1"
                shift
                ;;
        esac
    done
}

#
# for running jobs
#

function spark_setup_init {
    SPARK_MR3_LIB_DIR=$SPARK_BASE_DIR/sparkmr3
    SPARK_MR3_ASSEMBLY_JAR=spark-mr3-assembly.jar

    COMMON_LIB_DIR=$BASE_DIR/lib
    SPARK_PV_LIB_DIR=$SPARK_BASE_DIR/lib

    export SPARK_HOME=$SPARK_BASE_DIR
    export SPARK_CONF_DIR=$LOCAL_CONF_DIR_MOUNT_DIR   # CONF_DIR_MOUNT_DIR does not work outside Kubernetes

    SPARK_CLASSPATH=$SPARK_BASE_DIR/jars/*
}

function spark_setup_init_output_dir {
    declare output_dir=$1

    mkdir -p $output_dir > /dev/null 2>&1

    spark_setup_create_output_dir $output_dir

    OUT_CONF=$OUT/conf
    mkdir -p $OUT_CONF > /dev/null 2>&1

    cp $BASE_DIR/env.sh $OUT_CONF
    common_setup_update_conf_dir $OUT_CONF
}

function spark_setup_create_output_dir {
    declare base_dir=$1

    SCRIPT_START_TIME=$(date +%s)
    declare time_stamp="$(common_setup_get_time $SCRIPT_START_TIME)"
    export OUT=$base_dir/spark-mr3-$time_stamp-$(uuidgen | awk -F- '{print $1}')
    mkdir -p $OUT > /dev/null 2>&1
    echo -e "Output Directory: \n$OUT\n"
}

function spark_setup_config_spark_logs {
    declare log_dir=$1

    mkdir -p $log_dir
}

function spark_setup_init_run_configs {
    declare local_mode=$1

    mr3_setup_update_hadoop_opts $local_mode
}

# SPARK_DRIVER_CP = jars only for Driver
# SPARK_DRIVER_JARS = jars for both Driver and Executors; automatically downloaded by Executors
#  
# SPARK_DRIVER_JARS should not include MR3_SPARK_ASSEMBLY_JAR and SPARK_MR3_ASSEMBLY_JAR.
#   - MR3_SPARK_ASSEMBLY_JAR is already included in MR3_ADD_CLASSPATH_OPTS
#   - SPARK_MR3_ASSEMBLY_JAR is unnecessary in ContainerWorker Pods

function spark_setup_init_driver_opts {
    SPARK_DRIVER_OPTS="$HADOOP_OPTS"
    SPARK_DRIVER_CP="$MR3_LIB_DIR/$MR3_SPARK_ASSEMBLY_JAR:$SPARK_MR3_LIB_DIR/$SPARK_MR3_ASSEMBLY_JAR"
}

function spark_setup_extra_opts {
    SPARK_DRIVER_OPTS="$EXTRA_DRIVER_OPTIONS $SPARK_DRIVER_OPTS"
    SPARK_DRIVER_CP="$EXTRA_DRIVER_CLASS_PATH:$LOCAL_CONF_DIR_MOUNT_DIR:$SPARK_PV_LIB_DIR:$COMMON_LIB_DIR:$SPARK_DRIVER_CP"
    SPARK_DRIVER_JARS="$EXTRA_JARS"   # SPARK_DRIVER_JARS must not be ":"
}
