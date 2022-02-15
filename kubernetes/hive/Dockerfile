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

FROM openjdk:8-jre-slim

USER root

# create directories under /opt/mr3-run

RUN mkdir -p /opt/mr3-run && \
    mkdir -p /opt/mr3-run/key && \
    mkdir -p /opt/mr3-run/conf && \
    mkdir -p /opt/mr3-run/work-dir && \
    mkdir -p /opt/mr3-run/work-local-dir && \
    mkdir -p /opt/mr3-run/am-local-dir && \
    mkdir -p /opt/mr3-run/scratch-dir && \
    mkdir -p /opt/mr3-run/hiveserver2-ranger-policycache && \
    mkdir -p /opt/mr3-run/hive/run-result && \
    mkdir -p /opt/mr3-run/hive/tmp && \
    mkdir -p /opt/mr3-run/host-lib && \
    mkdir -p /opt/mr3-run/lib

RUN apt-get update && apt-get install -y procps wget && rm -rf /var/lib/apt/lists/*

# copy files 

COPY common-setup.sh /opt/mr3-run/
COPY hadoop/hadoop-setup.sh /opt/mr3-run/hadoop/
COPY hive/*.sh /opt/mr3-run/hive/
COPY mr3/mr3-setup.sh /opt/mr3-run/mr3/
COPY tez/tez-setup.sh /opt/mr3-run/tez/

COPY hadoop/apache-hadoop /opt/mr3-run/hadoop/apache-hadoop
COPY hive/apache-hive /opt/mr3-run/hive/apache-hive
COPY lib /opt/mr3-run/lib
COPY mr3/mr3lib /opt/mr3-run/mr3/mr3lib
COPY tez/tezjar /opt/mr3-run/tez/tezjar

# set environments

WORKDIR /opt/mr3-run/hive

ARG UID=1000
RUN adduser --no-create-home --disabled-login --gecos "" --uid $UID hive && \
    chown hive /opt/mr3-run/scratch-dir && \
    chown hive /opt/mr3-run/work-dir && \
    chown hive /opt/mr3-run/work-local-dir && \
    chown hive /opt/mr3-run/hive && \
    chown hive /opt/mr3-run/hive/tmp && \
    chown hive /opt/mr3-run/hive/run-result && \
    chown hive /opt/mr3-run/lib

USER hive

