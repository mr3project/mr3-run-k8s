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
BASE_DIR=$(readlink -f $DIR)

source $BASE_DIR/env.sh

#
# Configuration
#

DOCKER_MR3UI_IMG=mr3project/mr3ui:1.5
GRAFANA_WORK_DIR=/home/hive/grafana

LOCAL_HOST=192.168.10.101
LOCAL_PORT_GRAFANA_HTTP=3000

sudo docker run \
  --rm \
  --name docker-grafana \
  --publish $LOCAL_HOST:$LOCAL_PORT_GRAFANA_HTTP:3000 \
  --volume $BASE_DIR/timeline-conf:/opt/mr3-run/ats/conf:ro \
  --volume $GRAFANA_WORK_DIR:/opt/mr3-run/ats/grafana/data \
  $DOCKER_MR3UI_IMG \
  sh -c "/opt/mr3-run/ats/grafana.sh"

