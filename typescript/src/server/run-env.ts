import { strict as assert } from 'assert';

import * as consts from '../consts';
import * as credentials from './api/credentials';
import * as randoms from './validate/randoms';
import * as basics from './validate/basics';
import * as hive from './validate/hive';
import * as metastore from './validate/metastore';
import * as master from './validate/master';
import * as worker from './validate/worker';
import * as ranger from './validate/ranger';
import * as timeline from './validate/timeline';
import * as superset from './validate/superset';
import * as spark from './validate/spark';
import * as sparkmr3 from './validate/sparkmr3';
import * as secret from './validate/secret';
import * as docker from './validate/docker';
import * as config from './validate/config';
import * as driver from './validate/driver';

import * as state from './state';

export interface RunEnv {
  basicsEnv: basics.T;
  metastoreEnv: metastore.T;
  hiveEnv: hive.T;
  masterEnv: master.T;
  workerEnv: worker.T;
  rangerEnv: ranger.RangerInternal;
  timelineEnv: timeline.T;
  supersetEnv: superset.T;
  sparkEnv: spark.T;
  sparkmr3Env: sparkmr3.T;
  dockerEnv: docker.T;
  secretEnv: secret.T;
  configEnv: config.T;
  driverEnv?: driver.T;
}

export interface RunEnvCredentials extends RunEnv {
  credentialsEnv: credentials.T;
  mode: "create" | "delete";
}

export function buildStateFromRunEnv(input: RunEnv): state.T {
  const constsEnv = consts.config;
  const randomsEnv = randoms.initial();

  const basicsConf = basics.validate(input.basicsEnv, consts.config);
  const metastoreConf = metastore.validate(input.metastoreEnv, consts.config);
  const hiveConf = hive.validate(input.hiveEnv, basicsConf);
  const masterConf = master.validate(input.masterEnv);
  const workerConf = worker.validate(input.workerEnv, consts.config);
  const rangerConf = ranger.validate(input.rangerEnv, consts.config, basicsConf, hiveConf);
  const timelineConf = timeline.validate(input.timelineEnv, consts.config, basicsConf);
  const supersetConf = superset.validate(input.supersetEnv, consts.config, basicsConf);
  const sparkConf = spark.validate(input.sparkEnv, consts.config, basicsConf);
  const sparkmr3Conf = sparkmr3.validate(input.sparkmr3Env);
  const dockerConf = docker.validate(input.dockerEnv);
  const secretConf = secret.validate(input.secretEnv, consts.config,
      basicsConf, metastoreConf, hiveConf, workerConf, rangerConf, timelineConf, supersetConf, dockerConf);
  const configConf: config.T = input.configEnv;

  return {
    env: {
      consts: constsEnv,
      randoms: randomsEnv,
      basics: basicsConf,
      metastore: metastoreConf,
      hive: hiveConf,
      master: masterConf,
      worker: workerConf,
      ranger: rangerConf,
      timeline: timelineConf,
      superset: supersetConf,
      spark: sparkConf,
      sparkmr3: sparkmr3Conf,
      docker: dockerConf,
      secret: secretConf,
      config: configConf
    }
  }
}

export function buildStateFromRunEnvDriver(input: RunEnv): state.T {
  assert(input.driverEnv !== undefined);

  const state = buildStateFromRunEnv(input);
  state.env.driver = driver.validate(input.driverEnv, state.env.spark);

  return state;
}
