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
    mkdir -p /opt/mr3-run/work-dir && \
    mkdir -p /opt/mr3-run/work-local-dir && \
    mkdir -p /opt/mr3-run/key && \
    mkdir -p /opt/mr3-run/conf && \
    mkdir -p /opt/mr3-run/spark/lib && \
    mkdir -p /opt/mr3-run/spark/spark-submit-result && \
    mkdir -p /opt/mr3-run/spark/spark-shell-result

RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

# copy files 

COPY common-setup.sh /opt/mr3-run/
COPY mr3/mr3-setup.sh /opt/mr3-run/mr3/
COPY spark/*.sh /opt/mr3-run/spark/

COPY lib /opt/mr3-run/lib
COPY mr3/mr3lib /opt/mr3-run/mr3/mr3lib
COPY spark/bin /opt/mr3-run/spark/bin
COPY spark/jars /opt/mr3-run/spark/jars
COPY spark/sparkmr3 /opt/mr3-run/spark/sparkmr3

# set environments

WORKDIR /opt/mr3-run/spark

