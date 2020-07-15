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

FROM openjdk:8-jdk-stretch
MAINTAINER Junseung Hwang "j5hw4n9@gmail.com"

USER root

# create directories under /opt/mr3-run/ats

RUN mkdir -p /opt/mr3-run/ats && \
    mkdir -p /opt/mr3-run/ats/conf && \
    mkdir -p /opt/mr3-run/ats/key && \
    mkdir -p /opt/mr3-run/ats/work-dir

# copy files

COPY timeline-service.sh /opt/mr3-run/ats/
COPY hadoop/apache-hadoop /opt/mr3-run/ats/hadoop/apache-hadoop

# set environments

WORKDIR /opt/mr3-run/ats

ARG USER=ats
ARG GROUP=$USER
ARG UID=1000
ARG GID=1000
RUN groupadd -g $GID $GROUP && \
    useradd --no-log-init -u $UID -g $GID $USER && \
    chown -R $USER:$GROUP /opt/mr3-run/ats
    
USER ats
