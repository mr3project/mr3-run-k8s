import * as consts from '../consts';
import * as randoms from './validate/randoms';
import * as basics from './validate/basics';
import * as metastore from './validate/metastore';
import * as hive from './validate/hive';
import * as master from './validate/master';
import * as worker from './validate/worker';
import * as ranger from './validate/ranger';
import * as timeline from './validate/timeline';
import * as superset from './validate/superset';
import * as spark from './validate/spark';
import * as sparkmr3 from './validate/sparkmr3';
import * as docker from './validate/docker';
import * as secret from './validate/secret';
import * as config from './validate/config';
import * as driver from './validate/driver';

export interface T {
  env: {
    consts: consts.T;
    randoms: randoms.T;
    basics: basics.T;
    metastore: metastore.T;
    hive: hive.T;
    master: master.T;
    worker: worker.T;
    ranger: ranger.T;
    timeline: timeline.T;
    superset: superset.T;
    spark: spark.T;
    sparkmr3: sparkmr3.T;
    docker: docker.T;
    secret: secret.T;
    config: config.T;
    driver?: driver.T;
  };
}
