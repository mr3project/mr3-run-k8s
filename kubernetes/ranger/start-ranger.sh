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

function setup_ranger() {
    export RANGER_ADMIN_CONF=/opt/mr3-run/ranger/key

    cp /opt/mr3-run/ranger/conf/krb5.conf /etc/krb5.conf

    pushd $BASE_DIR/ranger-admin > /dev/null
    ./setup.sh
    popd > /dev/null

    cp $BASE_DIR/conf/ranger-admin-site.xml $BASE_DIR/ranger-admin/ews/webapp/WEB-INF/classes/conf/ranger-admin-site.xml
    cp $BASE_DIR/conf/ranger-log4j.properties $BASE_DIR/ranger-admin/ews/webapp/WEB-INF/log4j.properties

    # Dummy HADOOP_HOME prevents an error while org.apache.hadoop.util.Shell
    # initializes its static vairable.
    export HADOOP_HOME=/
}

function start_ranger {
    su ranger -p -c "$BASE_DIR/ranger-admin/ews/ranger-admin-services.sh start"
    sleep infinity
}

function main {
    setup_ranger
    start_ranger
}

main $@
