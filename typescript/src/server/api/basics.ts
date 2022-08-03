export interface T {
  namespace: string;
  warehouseDir: string;
  persistentVolume: "do_not_use" | "use_existing" | "create_new"
  // although createPersistentVolume and persistentVolumeClaim are optional,
  // define both fields when initializing basics.T in order to simplify invariant checks
  createPersistentVolume?: {
    storageInGb: number,
    volumeMode?: "Filesystem" | "Block",
    reclaimPolicy?: "Retain" | "Delete",
    storageClass?: string,
    pvType: "nfs" | "csi" | "hostPath",
    nfs?: { server: string, path: string },
    csi?: { driver: string, volumeHandle: string },
    hostPath?: { path: string }
  };
  persistentVolumeClaim?: {
    // e.g., annotations = volume.beta.kubernetes.io/storage-class: "aws-efs"
    annotations?: { key: string, value: string },
    storageInGb: number,
    volumeName?: string,
    storageClass: string,   // empty string is okay
    matchLabels?: { key: string, value: string }
  };
  workDir?: string;         // if undefined, we use PersistentVolume for the work directory
  s3aEndpoint?: string;     // fs.s3a.endpoint; should be undefined for accessing AWS S3
  s3aEnableSsl?: boolean;   // fs.s3a.connection.ssl.enabled
  s3aCredentialProvider: "DoNotUseS3" | "EnvironmentVariable" | "InstanceProfile" | "WebIdentityToken";
  hostPaths: string;        // empty string is okay

  // if using Ingress, DO NOT set externalIp
  // if using LoadBalancer, DO set externalIp
  // i.e., isEmptyString(externalIp) == whether or not we use Ingress
  // apacheServiceUrl depends on whether externalIp is set or not
  externalIp?: string;
  externalIpHostname: string;

  hiveserver2Ip: string;
  hiveserver2IpHostname: string;    // alias for hiveserver2Ip
  kerberos?: {
    realm: string;
    adminServer: string;
    kdc: string;
  };
  hdfsKeyProvider?: string;
  masterNodeSelector?: { key: string; value: string; };
  workerNodeSelector?: { key: string; value: string; };
  // include a mapping for hiveserver2Ip if hive.enableSsl is true
  hostAliases: { ip: string; hostnames: string; }[];
  useHttpsService: boolean;
  //
  // to be set in validate()
  //
  hostAliasesExpanded?: { ip: string; hostnames: string[]; }[];
  execScratchDir?: string;
  credentialsSource?: string;
  useFileIdPath?: boolean;
  mr3WorkerHostPaths?: string;
  mr3WorkerEmptyDirs?: string;
  mr3MasterNodeSelector?: string;
  mr3WorkerNodeSelector?: string;
  mr3HostAliases?: string;
  s3aCredentialProviderClass?: string;
  apacheServiceUrl?: string;
  //
  // only for validate()
  //
}
