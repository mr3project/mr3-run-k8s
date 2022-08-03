import * as fs from 'fs';

import * as gke from './validate/gke';
import * as service from './validate/service';
import * as apps from './validate/apps';

import { getRunEnvGcp } from '../gcp-run-env';
import * as server from '../server/server-fs';

export function build(gkeInput: gke.T, serviceInput: service.T, appsInput: apps.T): string[] {
  const gkeConf: gke.T = gke.validate(gkeInput);
  const serviceConf: service.T = service.validate(serviceInput);
  const appsConf: apps.T = apps.validate(appsInput, gkeConf, serviceConf);

  const runEnv = getRunEnvGcp(gkeConf, serviceConf, appsConf);

  const result = server.buildYamlsFromRunEnv(runEnv);
  return result;
}

export async function run(gkeInput: gke.T, serviceInput: service.T, appsInput: apps.T) {
  try {
    const result = build(gkeInput, serviceInput, appsInput);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync("apps.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
      throw e;
  }
}
