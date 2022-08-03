import * as fs from 'fs';

import { RunEnv, buildStateFromRunEnv } from '../server/run-env';
import * as server from '../server/server-fs';

import * as namespace from './yaml/service/namespace.yaml';
import * as ingress from './yaml/service/ingress.yaml';
import * as apache_nodeport  from './yaml/service/apache-nodeport.yaml';
import * as apache_service from './yaml/service/apache-service.yaml';
import * as hiveserver2_service from './yaml/service/hiveserver2-service.yaml';
import { isEmptyString } from '../helper';

export function build(runEnv: RunEnv): string[] {
  const state = buildStateFromRunEnv(runEnv);

  let result: string[] = [];
  // namespace should be the first object to create
  result.push(server.buildYaml(namespace, state));

  if (isEmptyString(state.env.basics.externalIp)) {
    // create Ingress
    result.push(server.buildYaml(ingress, state));
    result.push(server.buildYaml(apache_nodeport, state));
  } else {
    // create LoadBalancer
    result.push(server.buildYaml(apache_service, state));
  }

  result.push(server.buildYaml(hiveserver2_service, state));

  result.push(...server.buildYamlsFromRunEnv(runEnv));

  return result;
}

export async function run(runEnv: RunEnv) {
  try {
    const result = build(runEnv);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync("run.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
      throw e;
  }
}
