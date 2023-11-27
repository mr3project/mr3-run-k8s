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

source $BASE_DIR/config-run.sh
source $BASE_DIR/env.sh 

#
# Configuration
#

# reuse ATS_SECRET_KEY if already defined; use a random UUID otherwise
RANDOM_ATS_SECRET_KEY=$(cat /proc/sys/kernel/random/uuid)
ATS_SECRET_KEY=${ATS_SECRET_KEY:-$RANDOM_ATS_SECRET_KEY}
echo "ATS_SECRET_KEY=$ATS_SECRET_KEY"

DOCKER_ATS_IMG=mr3project/ats-2.7.7:latest
TIMELINE_WORK_DIR=/home/hive/timeline-docker

LOCAL_HOST=192.168.10.101
LOCAL_PORT_HTTP=8189
LOCAL_PORT_HTTPS=8191

#
#
#

mkdir -p $BASE_DIR/ats-key

if [ $ENABLE_SSL = true ]; then
  create_hivemr3_ssl_certificate $BASE_DIR/ats-key
fi

sudo docker run \
  --rm \
  --name docker-ats \
  --publish $LOCAL_HOST:$LOCAL_PORT_HTTP:8188 \
  --publish $LOCAL_HOST:$LOCAL_PORT_HTTPS:8190 \
  --env ATS_SECRET_KEY=$ATS_SECRET_KEY \
  --volume $BASE_DIR/env.sh:/opt/mr3-run/ats/env.sh:ro \
  --volume $BASE_DIR/ats-conf:/opt/mr3-run/ats/conf:ro \
  --volume $BASE_DIR/ats-key:/opt/mr3-run/ats/key:ro \
  --volume $TIMELINE_WORK_DIR:/opt/mr3-run/ats/work-dir \
  $DOCKER_ATS_IMG \
  /opt/mr3-run/ats/timeline-service.sh

