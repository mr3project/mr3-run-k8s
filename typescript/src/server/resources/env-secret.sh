#!/bin/bash

HIVE_SERVER2_SSL_TRUSTSTOREPASS=${env.secret.sslPassword}
export HADOOP_CREDSTORE_PASSWORD=${env.secret.sslPassword}

${env.secret.envVarDefs}

