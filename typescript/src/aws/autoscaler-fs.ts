import * as fs from 'fs';

import * as env from './env';
import * as eks from './validate/eks';
import * as autoscaler from './validate/autoscaler';

import * as autoscaler_service_account from './yaml/autoscaler/autoscaler-service-account.yaml';
import * as autoscaler_deployment from './yaml/autoscaler/autoscaler-deployment.yaml';
import * as autoscaler_cluster_role from './yaml/autoscaler/autoscaler-cluster-role.yaml';
import * as autoscaler_cluster_role_binding from './yaml/autoscaler/autoscaler-cluster-role-binding.yaml';
import * as autoscaler_role from './yaml/autoscaler/autoscaler-role.yaml';
import * as autoscaler_role_binding from './yaml/autoscaler/autoscaler-role-binding.yaml';

export function build(eksInput: eks.T, autoscalerInput: autoscaler.T): string[] {
  const eksConf: eks.T = eks.validate(eksInput);
  const autoscalerConf: autoscaler.T = autoscaler.validate(autoscalerInput);
  const envConf: env.T = {
    eks: eksConf,
    autoscaler: autoscalerConf
  };

  let result: string[] = [];
  result.push(env.buildYamlFromEnv(autoscaler_service_account, envConf));
  result.push(env.buildYamlFromEnv(autoscaler_deployment, envConf));
  result.push(env.buildYamlFromEnv(autoscaler_cluster_role, envConf));
  result.push(env.buildYamlFromEnv(autoscaler_cluster_role_binding , envConf));
  result.push(env.buildYamlFromEnv(autoscaler_role, envConf));
  result.push(env.buildYamlFromEnv(autoscaler_role_binding, envConf));
  return result;
}

export async function run(eksInput: eks.T, autoscalerInput: autoscaler.T) {
  let result: string[]; 
  let outputYaml: string;

  try {
    const result = build(eksInput, autoscalerInput);
    outputYaml = result.join("\n---\n");
    fs.writeFileSync("autoscaler.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
  }
}
