import * as fs from 'fs';

import * as eks from './validate/eks';
import * as service from './validate/service';
import * as apps from './validate/apps';

import { getRunEnvAws } from '../aws-run-env';
import * as server from '../server/server-fs';

export function build(eksInput: eks.T, serviceInput: service.T, appsInput: apps.T): string[] {
  const eksConf: eks.T = eks.validate(eksInput);
  const serviceConf: service.T = service.validate(serviceInput);
  const appsConf: apps.T = apps.validate(appsInput, eksConf, serviceConf);

  const runEnv = getRunEnvAws(eksConf, serviceConf, appsConf);

  const result = server.buildYamlsFromRunEnv(runEnv);
  return result;
}

export async function run(eksInput: eks.T, serviceInput: service.T, appsInput: apps.T) {
  try {
    const result = build(eksInput, serviceInput, appsInput);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync("apps.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
      throw e;
  }
}
