import * as fs from 'fs';

import * as env from './env';
import * as eks from './validate/eks';
import * as service from './validate/service';
import * as efs from './validate/efs';

import * as efs_service_account from './yaml/efs/efs-service-account.yaml';
import * as manifest_configmap from './yaml/efs/manifest-configmap.yaml';
import * as manifest_deployment from './yaml/efs/manifest-deployment.yaml';
import * as manifest_storageclass from './yaml/efs/manifest-storageclass.yaml';
import * as rbac_cluster_role from './yaml/efs/rbac-cluster-role.yaml';
import * as rbac_cluster_role_binding from './yaml/efs/rbac-cluster-role-binding.yaml';
import * as rbac_role from './yaml/efs/rbac-role.yaml';
import * as rbac_role_binding from './yaml/efs/rbac-role-binding.yaml';

export function build(eksInput: eks.T, serviceInput: service.T, efsInput: efs.T): string[] {
  const eksConf: eks.T = eks.validate(eksInput);
  const serviceConf: service.T = service.validate(serviceInput);
  const efsConf: efs.T = efs.validate(efsInput);
  const envConf: env.T = {
    eks: eksConf,
    service: serviceConf,
    efs: efsConf
  };

  let result: string[] = [];
  result.push(env.buildYamlFromEnv(efs_service_account, envConf));
  result.push(env.buildYamlFromEnv(manifest_configmap, envConf));
  result.push(env.buildYamlFromEnv(manifest_deployment, envConf));
  result.push(env.buildYamlFromEnv(manifest_storageclass, envConf));
  result.push(env.buildYamlFromEnv(rbac_cluster_role, envConf));
  result.push(env.buildYamlFromEnv(rbac_cluster_role_binding, envConf));
  result.push(env.buildYamlFromEnv(rbac_role, envConf));
  result.push(env.buildYamlFromEnv(rbac_role_binding, envConf));
  return result;
}

export async function run(eksInput: eks.T, serviceInput: service.T, efsInput: efs.T) {
  try {
    const result = build(eksInput, serviceInput, efsInput);
    const outputYaml = result.join("\n---\n");
    fs.writeFileSync("efs.yaml", outputYaml, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
  }
}
