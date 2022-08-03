#!/bin/bash

export HADOOP_CREDSTORE_PASSWORD=${env.secret.sslPassword}

${env.secret.envVarDefs}

