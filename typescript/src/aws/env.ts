import * as jsyaml from 'js-yaml';

import * as consts from './../consts';
import * as eks from './validate/eks';
import * as autoscaler from './validate/autoscaler';
import * as service from './validate/service';
import * as efs from './validate/efs';
import * as env from './env';

export interface T {
  consts?: consts.T;
  eks?: eks.T;
  autoscaler?: autoscaler.T;
  service?: service.T;
  efs?: efs.T;
}

export function buildYamlFromEnv(module: any, env: env.T): string {
  try {
    const yaml = module.build(env);
    return jsyaml.dump(yaml, { noArrayIndent: true, quotingType: "'" });
  } catch(e) {
    return `ERROR: ${e}`;
  }
}
