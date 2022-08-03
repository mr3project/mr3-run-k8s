import * as jsyaml from 'js-yaml';

import * as consts from './../consts';
import * as gke from './validate/gke';
import * as service from './validate/service';

export interface T {
  consts?: consts.T;
  gke?: gke.T;
  service?: service.T;
}

export function buildYamlFromEnv(module: any, env: T): string {
  try {
    const yaml = module.build(env);
    return jsyaml.dump(yaml, { noArrayIndent: true, quotingType: "'" });
  } catch(e) {
    return `ERROR: ${e}`;
  }
}
