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

FROM centos:7.6.1810
MAINTAINER Sungwoo Park "glapark@gmail.com"

USER root

RUN yum install -y java-1.8.0-openjdk \
    && echo "securerandom.source=file:/dev/urandom" >> /usr/lib/jvm/jre/lib/security/java.security \
    && yum install -y which \
    && yum clean all \
    && rm -rf \
          /usr/lib/jvm/jre/plugin \
          /usr/lib/jvm/jre/bin/javaws \
          /usr/lib/jvm/jre/bin/jjs \
          /usr/lib/jvm/jre/bin/orbd \
          /usr/lib/jvm/jre/bin/pack200 \
          /usr/lib/jvm/jre/bin/policytool \
          /usr/lib/jvm/jre/bin/rmid \
          /usr/lib/jvm/jre/bin/rmiregistry \
          /usr/lib/jvm/jre/bin/servertool \
          /usr/lib/jvm/jre/bin/tnameserv \
          /usr/lib/jvm/jre/bin/unpack200 \
          /usr/lib/jvm/jre/lib/javaws.jar \
          /usr/lib/jvm/jre/lib/deploy* \
          /usr/lib/jvm/jre/lib/desktop \
          /usr/lib/jvm/jre/lib/*javafx* \
          /usr/lib/jvm/jre/lib/*jfx* \
          /usr/lib/jvm/jre/lib/amd64/libdecora_sse.so \
          /usr/lib/jvm/jre/lib/amd64/libprism_*.so \
          /usr/lib/jvm/jre/lib/amd64/libfxplugins.so \
          /usr/lib/jvm/jre/lib/amd64/libglass.so \
          /usr/lib/jvm/jre/lib/amd64/libgstreamer-lite.so \
          /usr/lib/jvm/jre/lib/amd64/libjavafx*.so \
          /usr/lib/jvm/jre/lib/amd64/libjfx*.so \
          /usr/lib/jvm/jre/lib/ext/jfxrt.jar \
          /usr/lib/jvm/jre/lib/ext/nashorn.jar \
          /usr/lib/jvm/jre/lib/oblique-fonts \
          /usr/lib/jvm/jre/lib/plugin.jar \
          /usr/lib/jvm/jre/man/

ENV JAVA_HOME /etc/alternatives/jre
ENV PATH="/etc/alternatives/jre/bin:${PATH}"

# create directories under /opt/mr3-run

RUN mkdir -p /opt/mr3-run && \
    mkdir -p /opt/mr3-run/scratch-dir && \
    mkdir -p /opt/mr3-run/work-dir && \
    mkdir -p /opt/mr3-run/work-local-dir && \
    mkdir -p /opt/mr3-run/key && \
    mkdir -p /opt/mr3-run/conf && \
    mkdir -p /opt/mr3-run/hive/tmp && \
    mkdir -p /opt/mr3-run/hive/run-result && \
    mkdir -p /opt/mr3-run/host-lib

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
RUN adduser --no-create-home -s /sbin/nologin -U -u $UID hive && \
    chown hive /opt/mr3-run/scratch-dir && \
    chown hive /opt/mr3-run/work-dir && \
    chown hive /opt/mr3-run/work-local-dir && \
    chown hive /opt/mr3-run/hive && \
    chown hive /opt/mr3-run/hive/tmp && \
    chown hive /opt/mr3-run/hive/run-result

USER hive

