import * as cluster from './public/api/cluster';
import * as service from './public/api/service';
import * as apps from './public/api/apps';

import { CheckResult } from './helper';

import * as consts from './consts';

import * as basics from './server/validate/basics';
import * as hive from './server/validate/hive';
import * as metastore from './server/validate/metastore';
import * as master from './server/validate/master';
import * as worker from './server/validate/worker';
import * as ranger from './server/validate/ranger';
import * as timeline from './server/validate/timeline';
import * as superset from './server/validate/superset';
import * as secret from './server/validate/secret';
import * as docker from './server/validate/docker';
import * as spark from './server/validate/spark';
import * as sparkmr3 from './server/validate/sparkmr3';

import { RunEnv } from './server/run-env';
import { getRunEnvForCloudCommon } from './run-env';

export function getRunEnvAws(
    eksConf: cluster.T,
    serviceConf: service.T,
    appsConf: apps.T): RunEnv {
  const runEnv = getRunEnvForCloudCommon(eksConf, serviceConf, appsConf);

  runEnv.basicsEnv.persistentVolumeClaim =
    { annotations: {
        key: "volume.beta.kubernetes.io/storage-class",
        value: "aws-efs"
      },
      storageInGb: appsConf.persistentVolumeClaimStorageInGb,
      storageClass: "aws-efs"
    };
  runEnv.basicsEnv.s3aCredentialProvider = "InstanceProfile";
  runEnv.basicsEnv.externalIp = "0.0.0.0";  // use LoadBalancer

  return runEnv;
}

// Invariant: eksConf and serviceConf should be created with validate()
export function checkServer(
    eksConf: cluster.T,
    serviceConf: service.T,
    appsConf: apps.T): CheckResult[] {
  let accum: CheckResult[] = [];
  const runEnv = getRunEnvAws(eksConf, serviceConf, appsConf);

  accum.push(...basics.check(runEnv.basicsEnv));
  accum.push(...metastore.check(runEnv.metastoreEnv));
  accum.push(...hive.check(runEnv.hiveEnv, runEnv.basicsEnv));
  accum.push(...master.check(runEnv.masterEnv));
  accum.push(...worker.check(runEnv.workerEnv));
  accum.push(...ranger.check(runEnv.rangerEnv, runEnv.hiveEnv));
  accum.push(...timeline.check(runEnv.timelineEnv, runEnv.basicsEnv));
  accum.push(...superset.check(runEnv.supersetEnv, runEnv.hiveEnv));
  accum.push(...spark.check(runEnv.sparkEnv, consts.config));
  accum.push(...sparkmr3.check(runEnv.sparkmr3Env));
  accum.push(...docker.check(runEnv.dockerEnv,
    runEnv.hiveEnv, runEnv.timelineEnv, runEnv.supersetEnv));
  accum.push(...secret.check(runEnv.secretEnv, consts.config,
    runEnv.basicsEnv, runEnv.metastoreEnv, runEnv.hiveEnv, runEnv.workerEnv, runEnv.rangerEnv,
    runEnv.timelineEnv, runEnv.supersetEnv, runEnv.dockerEnv));

  return accum;
}
