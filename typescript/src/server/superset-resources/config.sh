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

# executed as superset

mkdir -p ${env.consts.dir.supersetWork}/superset

# execute in Dockerfile: chown superset:superset /etc/krb5.conf
cp ${env.consts.dir.supersetConf}/krb5.conf /etc/krb5.conf
# TODO: set KRB5_CONFIG to ${env.consts.dir.supersetConf}/krb5.conf

KEYTAB=${env.hive.secureModeInternal && env.secret.kerberosSecret !== undefined ? env.consts.dir.supersetKeytab + '/' +  env.secret.kerberosSecret.server.keytabInternal : ''}
PRINCIPAL=${env.hive.secureModeInternal && env.secret.kerberosSecret !== undefined ? env.secret.kerberosSecret.server.principalInternal : ''}

initializeKerberos() {
  echo "Obtaining Kerberos ticket: $PRINCIPAL"
  ${env.hive.secureModeInternal && env.secret.kerberosSecret !== undefined ? '/usr/bin/kinit -kt $KEYTAB $PRINCIPAL' : 'echo "No Kerberos"'}
}

seconds=$((60*60*24))
while true; do initializeKerberos; sleep $seconds; done &

# to be consumed by docker/run-server.sh
export CERTFILE=${env.superset.enableSsl && env.secret.supersetSsl !== undefined ? '--certfile=' + env.consts.dir.supersetKeytab + '/' + env.secret.supersetSsl.certificate : ''}
export KEYFILE=${env.superset.enableSsl && env.secret.supersetSsl !== undefined ? '--keyfile=' + env.consts.dir.supersetKeytab + '/' + env.secret.supersetSsl.keystore : ''}
export SUPERSET_PORT=${env.consts.superset.port}

