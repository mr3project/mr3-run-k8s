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

####################################################
#  Requirements: Java, Hadoop, keytool, openssl    #
####################################################

if [ -z $JAVA_HOME ]; then
    echo "JAVA_HOME is not set -- install Java and set JAVA_HOME"
    exit
fi

if [ -z $HADOOP_HOME ]; then
    echo "HADOOP_HOME is not set -- download a Hadoop binary distribution and set HADOOP_HOME"
    echo "Example:"
    echo "  wget https://archive.apache.org/dist/hadoop/common/hadoop-3.1.2/hadoop-3.1.2.tar.gz"
    echo "  gunzip -c hadoop-3.1.2.tar.gz | tar xvf -;"
    echo "  export HADOOP_HOME=$PWD/hadoop-3.1.2"
    exit
fi 

if ! command -v keytool &> /dev/null
then
    echo "Command 'keytool' could not be found -- install 'keytool'"
    exit
fi

if ! command -v openssl &> /dev/null
then
    echo "Command 'openssl' could not be found -- install 'openssl'"
    exit
fi

####################################################
#   Required Parameters to be set by the user      #
####################################################

# basics.namespace
NAMESPACE=hivemr3

# Host name corresponding to basics.externalIp when hive.enableSsl == true
HOST=orange1

# Period in which the certificate is valid
VALID_DAYS=365

# Beeline keystore password
# This password (along with beeline-ssl.jks) is distributed to end users running Beeline.
BEELINE_KEYSTORE_PASSWORD=beelinepassword

####################################################
#   Optional Parameters to be set by the user      #
####################################################

# Keystore password
# Set to a random string if not set
PASSWORD=MySslPassword123

# Password for connecting to Metastore database
# If set, javax.jdo.option.ConnectionPassword can be set to '_'.
METASTORE_DATABASE_PASSWORD=passwd

# Host name for Metastore database when metastore.enableDatabaseSsl == true
METASTORE_DATABASE_HOST=orange1
# Certificate for connecting to Metastore database when metastore.enableDatabaseSsl == true
METASTORE_MYSQL_CERTIFICATE=mr3-metastore-database.cert

# Host name for Ranger database when ranger.enableDatabaseSsl == true
RANGER_DATABASE_HOST=orange1
# Certificate for connecting to Ranger server database when ranger.enableDatabaseSsl == true
RANGER_MYSQL_CERTIFICATE=mr3-ranger-database.cert

# Certificate for connecting to S3 when basics.s3aEnableSsl == true
S3_CERTIFICATE=s3-public.cert

# Host name in the service principal secret.kerberos.server.principal (e.g., foo in hive/foo@BAR)
# Required for using Python clients when connecting to HiveServer2 with Kerberos enabled
# Set to the default value of 'hive' if not set
COMMON_NAME=orange1

####################################################
#        Derived or fixed Parameters               #
####################################################

HIVE_SERVER2_HOST=$HOST
ATS_HOST=$HOST
RANGER_HOST=$HOST

HIVE_METASTORE_HOST=metastore.${NAMESPACE}.svc.cluster.local

# Keystore file for MR3 components (HiveServer2, Timeline Server, Ranger, Metastore)
# The administrator can extract a certificate and distribute it to users.
MR3_SSL_KEYSTORE=mr3-ssl.jks
MR3_SSL_CREDENTIAL_PROVIDER=mr3-ssl.jceks
MR3_SSL_CREDENTIAL_PROVIDER_CHECKSUM=.mr3-ssl.jceks.crc

DEST_KEYSTORE=hivemr3-ssl-certificate.jks
DEST_CREDENTIAL_PROVIDER=hivemr3-ssl-certificate.jceks
DEST_CREDENTIAL_PROVIDER_CHECKSUM=.hivemr3-ssl-certificate.jceks.crc

MR3_SSL_PEM=mr3-ssl.pem

MR3_BEELINE_KEYSTORE=beeline-ssl.jks

SHUFFLE_COMMON_NAME=*.service-worker.${NAMESPACE}.svc.cluster.local
SHUFFLE_KEYSTORE=mr3-keystore.jks
SHUFFLE_TRUSTSTORE=mr3-truststore.jks

SUPERSET_KEY=superset.key
SUPERSET_CRT=superset.crt

####################################################
#        Main code                                 #
####################################################

function check_if_output_files_already_exist {
    output_files="$MR3_SSL_KEYSTORE $MR3_SSL_CREDENTIAL_PROVIDER $MR3_SSL_CREDENTIAL_PROVIDER_CHECKSUM"
    for output_file in $output_files; do
      if [ -e $output_file ]; then
        echo -e "\n$output_file already exists" >&2
        exit 1;
      fi
    done
}

function set_default {
    if [ -z $PASSWORD ]; then 
      PASSWORD=$(cat /proc/sys/kernel/random/uuid)
    fi 
    export HADOOP_CREDSTORE_PASSWORD=$PASSWORD
    echo -e "Keystore password: $PASSWORD" >&2

    if [ -z $COMMON_NAME ]; then
      COMMON_NAME=MR3
      echo -e "Using the default value for Common Name: $COMMON_NAME" >&2
    fi
}

function generate_subject_alternative_name {
    declare -A host_to_service

    if [ ! -z $HIVE_SERVER2_HOST ]; then
      host_to_service[$HIVE_SERVER2_HOST]="${host_to_service[$HIVE_SERVER2_HOST]} HiveServer2"
    fi 
    if [ ! -z $RANGER_HOST ]; then
      host_to_service[$RANGER_HOST]="${host_to_service[$RANGER_HOST]} Ranger"
    fi 
    if [ ! -z $ATS_HOST ]; then
      host_to_service[$ATS_HOST]="${host_to_service[$ATS_HOST]} TimelineServer"
    fi 
    if [ ! -z $HIVE_METASTORE_HOST ]; then
      host_to_service[$HIVE_METASTORE_HOST]="${host_to_service[$HIVE_METASTORE_HOST]} Metastore"
    fi
    if [ ! -z $METASTORE_DATABASE_HOST ]; then
      host_to_service[$METASTORE_DATABASE_HOST]="${host_to_service[$METASTORE_DATABASE_HOST]} MetastoreDatabase"
    fi
    if [ ! -z $RANGER_DATABASE_HOST ]; then
      host_to_service[$RANGER_DATABASE_HOST]="${host_to_service[$RANGER_DATABASE_HOST]} RangerDatabase"
    fi

    echo -e "Hosts to add to the certificate to generate:" >&2
    for host in ${!host_to_service[@]}; do
      echo -e " $host:${host_to_service[$host]}"
    done

    SUBJECT_ALTERNATIVE_NAME=""
    for host in ${!host_to_service[@]}; do
      SUBJECT_ALTERNATIVE_NAME="$SUBJECT_ALTERNATIVE_NAME,DNS:$host"
    done
    SUBJECT_ALTERNATIVE_NAME=${SUBJECT_ALTERNATIVE_NAME:1}
}

function generate_keystore {
    echo -e "\n# Generating a keystore ($MR3_SSL_KEYSTORE) #" >&2

    keytool -genkeypair -alias ssl-private-key -keyalg RSA -dname "CN=$COMMON_NAME" -keypass $PASSWORD \
      -ext san=$SUBJECT_ALTERNATIVE_NAME -validity $VALID_DAYS -storetype jks -keystore $MR3_SSL_KEYSTORE \
      -storepass $PASSWORD
}

function generate_keystore_credential_file {
    echo -e "\n# Generating a credential file ($MR3_SSL_CREDENTIAL_PROVIDER) #" >&2

    entries="ssl.server.keystore.password ssl.server.truststore.password ssl.server.keystore.keypassword \
ssl.client.truststore.password \
keyStoreAlias trustStoreAlias keyStoreCredentialAlias sslKeyStore sslTrustStore \
solr.jetty.keystore.password solr.jetty.truststore.password \
hive.server2.keystore.password hive.metastore.keystore.password hive.metastore.truststore.password"
    for entry in $entries; do
      $HADOOP_HOME/bin/hadoop credential create $entry \
        -provider jceks://file/$PWD/$MR3_SSL_CREDENTIAL_PROVIDER \
        -value $PASSWORD
    done

    if [ ! -z $METASTORE_DATABASE_PASSWORD ]; then
      $HADOOP_HOME/bin/hadoop credential create javax.jdo.option.ConnectionPassword \
        -provider jceks://file/$PWD/$MR3_SSL_CREDENTIAL_PROVIDER \
        -value $METASTORE_DATABASE_PASSWORD
    fi 
}

function create_hivemr3_ssl_certificate {
    echo -e "\n# Generating $DEST_KEYSTORE and $DEST_CREDENTIAL_PROVIDER #" >&2

    cp $MR3_SSL_KEYSTORE $DEST_KEYSTORE
    cp $MR3_SSL_CREDENTIAL_PROVIDER $DEST_CREDENTIAL_PROVIDER
    cp $MR3_SSL_CREDENTIAL_PROVIDER_CHECKSUM $DEST_CREDENTIAL_PROVIDER_CHECKSUM
    import_certificates $DEST_KEYSTORE
}

function import_certificate {
    keystore=$1
    certificate=$2
    alias=$3

    echo -e "\nImporting $certificate..." >&2
    keytool -importcert -alias $alias -file $certificate -noprompt -storetype jks -keystore $keystore \
      -storepass $PASSWORD
}

function import_certificates {
    keystore=$1

    certificates="$RANGER_MYSQL_CERTIFICATE $METASTORE_MYSQL_CERTIFICATE $S3_CERTIFICATE"
    index=0
    for certificate in $certificates; do
      if [ -f $certificate ]; then
        alias=trusted-cert-$index
        import_certificate $keystore $certificate $alias
        index=$(($index + 1))
      fi
    done
}

function create_shuffle_certificate {
  echo -e "\n# Generating $SHUFFLE_KEYSTORE and $SHUFFLE_TRUSTSTORE #" >&2

  keytool -genkey -alias mr3-shuffle -keyalg RSA -keysize 2048 -dname "CN=$SHUFFLE_COMMON_NAME" -keypass $PASSWORD -keystore $SHUFFLE_KEYSTORE -storepass $PASSWORD -validity $VALID_DAYS
  keytool -keystore $SHUFFLE_KEYSTORE -storepass $PASSWORD -alias mr3-shuffle -certreq -file mr3-shuffle.csr
  openssl genrsa -out mr3.key 2048
  openssl req -new -x509 -key mr3.key -out mr3.crt
  openssl x509 -req -in mr3-shuffle.csr -CA mr3.crt -CAkey mr3.key -CAcreateserial -out mr3-shuffle.crt
  keytool -import -alias mr3-shuffle -file mr3-shuffle.crt -keystore mr3-shuffle.jks -storepass $PASSWORD 
  keytool -importcert -alias mr3-shuffle -file mr3-shuffle.crt -keystore $SHUFFLE_TRUSTSTORE -storepass $PASSWORD
}

function main {
    echo -e "\nCreating SSL certificates..." >&2

    check_if_output_files_already_exist
    set_default

    # mr3-ssl.jceks
    # mr3-ssl.jks
    # .mr3-ssl.jceks.crc
    generate_subject_alternative_name
    generate_keystore
    generate_keystore_credential_file

    # hivemr3-ssl-certificate.jceks
    # hivemr3-ssl-certificate.jks
    # .hivemr3-ssl-certificate.jceks.crc
    create_hivemr3_ssl_certificate

    # mr3-ssl.pem
    # -- mr3-ssl.cert
    echo -e "\n# Generating $MR3_SSL_PEM #" >&2
    keytool -export -keystore $MR3_SSL_KEYSTORE -alias ssl-private-key -file mr3-ssl.cert -storepass $PASSWORD
    openssl x509 -inform der -in mr3-ssl.cert -out $MR3_SSL_PEM
    rm -f mr3-ssl.cert

    # beeline-ssl.jks
    echo -e "\n# Generating $MR3_BEELINE_KEYSTORE #" >&2
    keytool -genkeypair -alias beeline-ssl-key -keyalg RSA -dname "CN=beeline-ssl" -keypass $BEELINE_KEYSTORE_PASSWORD -validity $VALID_DAYS -keystore $MR3_BEELINE_KEYSTORE -storepass $BEELINE_KEYSTORE_PASSWORD
    keytool -importcert -alias trusted-cert-hivemr3 -file $MR3_SSL_PEM -noprompt -keystore $MR3_BEELINE_KEYSTORE -storepass $BEELINE_KEYSTORE_PASSWORD

    # mr3-keystore.jks
    # mr3-truststore.jks
    create_shuffle_certificate
    rm -f mr3.crt mr3.key mr3.srl mr3-shuffle.crt mr3-shuffle.csr mr3-shuffle.jks

    # superset.key
    # superset.crt
    echo -e "\n# Generating $SUPERSET_KEY and $SUPERSET_CRT #" >&2
    openssl req -x509 -sha256 -nodes -days $VALID_DAYS -newkey rsa:2048 -keyout $SUPERSET_KEY -out $SUPERSET_CRT

    rm -f mr3-ssl.jceks mr3-ssl.jks .mr3-ssl.jceks.crc
}

main $@
