import * as cluster from '../../public/api/cluster';

export const regionNames = [
  "ap-northeast-1", 
  "ap-northeast-2", 
  "ap-northeast-3", 
  "ap-south-1", 
  "ap-southeast-1", 
  "ap-southeast-2", 
  "ca-central-1", 
  "eu-central-1", 
  "eu-north-1", 
  "eu-west-1", 
  "eu-west-2", 
  "eu-west-3", 
  "sa-east-1", 
  "us-east-1", 
  "us-east-2", 
  "us-west-1", 
  "us-west-2"
];

export const zoneNames = [
  "ap-northeast-1a",
  "ap-northeast-1c",
  "ap-northeast-1d",
  "ap-northeast-2a",
  "ap-northeast-2b",
  "ap-northeast-2c",
  "ap-northeast-2d",
  "ap-northeast-3a",
  "ap-northeast-3b",
  "ap-northeast-3c",
  "ap-south-1a",
  "ap-south-1b",
  "ap-south-1c",
  "ap-southeast-1a",
  "ap-southeast-1b",
  "ap-southeast-1c",
  "ap-southeast-2a",
  "ap-southeast-2b",
  "ap-southeast-2c",
  "ca-central-1a",
  "ca-central-1b",
  "ca-central-1d",
  "eu-central-1a",
  "eu-central-1b",
  "eu-central-1c",
  "eu-north-1a",
  "eu-north-1b",
  "eu-north-1c",
  "eu-west-1a",
  "eu-west-1b",
  "eu-west-1c",
  "eu-west-2a",
  "eu-west-2b",
  "eu-west-2c",
  "eu-west-3a",
  "eu-west-3b",
  "eu-west-3c",
  "sa-east-1a",
  "sa-east-1b",
  "sa-east-1c",
  "us-east-1a",
  "us-east-1b",
  "us-east-1c",
  "us-east-1d",
  "us-east-1e",
  "us-east-1f",
  "us-east-2a",
  "us-east-2b",
  "us-east-2c",
  "us-west-1b",
  "us-west-1c",
  "us-west-2a",
  "us-west-2b",
  "us-west-2c",
  "us-west-2d"
];

export const masterInstanceTypes = [
  "m5.4xlarge"  // 16 CPU, 64GB
];

export const workerInstanceTypes = [
  "m5d.2xlarge",
  "m5d.4xlarge"
];

export interface T extends cluster.T {
  name: string;
  region: string;
  zone: string;

  masterNodeGroup: string;
  masterInstanceType: string;
  masterCapacity: number;

  workerNodeGroup: string;
  workerInstanceType: string;
  workerMinCapacityOnDemand: number;
  workerMaxCapacityOnDemand: number;
  workerMaxCapacityTotal: number;

  autoscalingWorkerPolicy: string;  // arn:aws:iam::111111111111:policy/AutoScalingPolicy
  accessS3Policy: string;           // arn:aws:iam::111111111111:policy/S3AccessPolicy

  //
  // to be set in validate()
  //

  zones?: string[];
  onDemandPercentageAboveBaseCapacity?: number;
  preBootstrapCommands?: string[];
}
