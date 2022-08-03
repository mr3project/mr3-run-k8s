import * as fs from 'fs';

import * as consts from './../consts';
import * as env from './env';
import * as service from './validate/service';

import * as namespace from './yaml/service/namespace.yaml';
import * as apache_nodeport from './yaml/service/apache-nodeport.yaml';
import * as ingress from './yaml/service/ingress.yaml';
import * as hiveserver2_service from './yaml/service/hiveserver2-service.yaml';

export function build(serviceInput: service.T): string[] {
  const constsConf: consts.T = consts.config;
  const serviceConf: service.T = service.validate(serviceInput);
  const envConf: env.T = {
    consts: constsConf,
    service: serviceConf
  };

  let result: string[] = [];
  result.push(env.buildYamlFromEnv(namespace, envConf));
  result.push(env.buildYamlFromEnv(apache_nodeport, envConf));
  result.push(env.buildYamlFromEnv(ingress, envConf));
  result.push(env.buildYamlFromEnv(hiveserver2_service, envConf));
  return result;
}

export async function run(serviceInput: service.T) {
  try {
    const result =  build(serviceInput);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync("service.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
  }
}
