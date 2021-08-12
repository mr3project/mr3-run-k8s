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

# echo commands to the terminal output
set -x

LOCAL_CONF_DIR_MOUNT_DIR=$BASE_DIR/conf

MR3_BASE_DIR=$BASE_DIR/mr3
SPARK_BASE_DIR=$BASE_DIR/spark

function common_setup_print_usage_common_options {
    echo " -h/--help                              Print the usage."    
}

function common_setup_update_conf_dir {
    conf_dir=$1

    # copy only files from $conf_dir and do not copy from subdirectories
    cp $LOCAL_CONF_DIR_MOUNT_DIR/* $conf_dir 
}

function common_setup_cleanup {
  trap cleanup_child EXIT
}

function cleanup_child {
    local pid=`jobs -p`
    if [[ "$pid" != "" ]]; then
        kill $pid 
        while ps -p $pid; do echo "Waiting for process $pid to stop..."; sleep 1; done;
        echo "Process $pid stopped."
    fi
}

function common_setup_log {
    function_name=$1
    message=$2
    script_name="$(basename "$0")"

    echo -e "$script_name:$function_name() $message"
}

function common_setup_log_warning {
   function_name=$1 
   message=$2

   common_setup_log $function_name "WARNING: $message"
}

function common_setup_log_error {
    function_name=$1 
    message=$2

    common_setup_log $function_name "ERROR: $message"
}

# get the current time
# optionally takes a time in seconds from epoch and returns a formatted time
function common_setup_get_time {
    declare epoch_time=$1

    date +"%Y-%m-%d-%H-%M-%S" ${epoch_time:+"-d @$epoch_time"}
}

