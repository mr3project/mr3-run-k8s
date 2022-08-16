import * as env from '../../env';
import { strict as assert } from 'assert';

export function build(env: env.T) {
  assert(env.eks !== undefined);
  assert(env.eks.zones !== undefined);

  return {
    apiVersion: "eksctl.io/v1alpha5",
    kind: "ClusterConfig",
    metadata: {
      name: env.eks.name,
      region: env.eks.region
    },
    vpc: {
      nat: {
        gateway: "Single"
      }
    },
    availabilityZones: env.eks.zones,
    nodeGroups: [
      { name: env.eks.masterNodeGroup,
        availabilityZones: [
          env.eks.zone
        ],
        instanceType: env.eks.masterInstanceType,
        labels: {
          roles: env.eks.masterLabelRoles
        },
        ssh: {
          allow: true
        },
        desiredCapacity: Math.min(env.eks.masterCapacity, 8),
        minSize: Math.min(env.eks.masterCapacity, 8),
        maxSize: 8,
        iam: {
          attachPolicyARNs: [
            "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
            "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
            env.eks.autoscalingWorkerPolicy,
            env.eks.accessS3Policy
          ],
          withAddonPolicies: {
            efs: true
          }
        },
        preBootstrapCommands: env.eks.preBootstrapCommandsMaster
      },
      { name: env.eks.workerNodeGroup,
        availabilityZones: [
          env.eks.zone
        ],
        instanceType: "mixed",
        labels: {
          roles: env.eks.workerLabelRoles
        },
        ssh: {
          allow: true
        },
        minSize: env.eks.workerMinCapacityOnDemand,
        maxSize: env.eks.workerMaxCapacityTotal,
        instancesDistribution: {
          instanceTypes: [
            env.eks.workerInstanceType
          ],
          onDemandBaseCapacity: env.eks.workerMinCapacityOnDemand,
          onDemandPercentageAboveBaseCapacity: env.eks.onDemandPercentageAboveBaseCapacity
        },
        iam: {
          attachPolicyARNs: [
            "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
            "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
            env.eks.autoscalingWorkerPolicy,
            env.eks.accessS3Policy
          ],
          withAddonPolicies: {
            efs: true
          }
        },
        tags: {
          ['k8s.io/cluster-autoscaler/enabled']: "true",
          ['k8s.io/cluster-autoscaler/' + env.eks.name]: "owned",
          ['k8s.io/cluster-autoscaler/node-template/label/' + 'roles']: env.eks.workerLabelRoles
        },
        preBootstrapCommands: env.eks.preBootstrapCommandsWorker
      }
    ]
  };
}
