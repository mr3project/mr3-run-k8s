import * as fs from 'fs';

import * as env from './env';
import * as eks from './validate/eks';

import * as eks_cluster from './yaml/eks/cluster.yaml';

export function build(eksInput: eks.T): string[] {
  const eksConf: eks.T = eks.validate(eksInput);
  const envConf: env.T = {
    eks: eksConf
  };

  let result: string[] = [];
  result.push(env.buildYamlFromEnv(eks_cluster, envConf));
  return result;
}

export async function run(eksInput: eks.T) {
  try {
    const result = build(eksInput);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync("eks-cluster.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
  }
}
