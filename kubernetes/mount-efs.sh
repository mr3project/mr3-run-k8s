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
EFS_DIR=$BASE_DIR/efs

source $BASE_DIR/config-run.sh
source $BASE_DIR/env.sh 

# 1. create EFS and set Security Groups
# 2. update in efs/manifest.yaml
#   data/file.system.id: fs-0440de65
#   data/aws.region: ap-northeast-2
#   volumes/nfs/server: fs-0440de65.efs.ap-northeast-2.amazonaws.com
# Cf. https://github.com/kubernetes-incubator/external-storage/tree/master/aws/efs

kubectl create namespace $MR3_NAMESPACE

kubectl create -f $EFS_DIR/service-account.yaml
kubectl create -f $EFS_DIR/rbac.yaml
kubectl create -f $EFS_DIR/manifest.yaml
kubectl create -f $EFS_DIR/workdir-pvc.yaml

