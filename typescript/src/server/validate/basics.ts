import { T } from '../api/basics';
export type { T };
import * as consts from '../../consts';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber, isValidIpv4Address, trimString, resetStringUndefined, resetKeyValueUndefined, containsEmptyStringOnly } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];

  // example:
  //   foo: "A" | "B"
  //   A?: ...
  //   B?: ...
  // This is necessary because we can call validate() directly from TypeScript code (i.e., not from Web).
  checkRequiredType(accum, input);

  checkProduction(accum, input as T);

  // foo: string
  checkEmptyString(accum, input as T);

  // { key: string, value: string }
  checkStringTuple(accum, input as T);

  checkInvariants(accum, input as T);

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "nfs") ||
      input.createPersistentVolume?.nfs !== undefined,
    "NFS is missing.",
    ['createPersistentVolume', 'pvType']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "csi") ||
      input.createPersistentVolume?.csi !== undefined,
    "CSI is missing.",
    ['createPersistentVolume', 'pvType']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "hostPath") ||
      input.createPersistentVolume?.hostPath !== undefined,
    "HostPath is missing.",
    ['createPersistentVolume', 'pvType']);
}

function checkProduction(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !isEmptyString(input.hostPaths),
    "In production, hostPath Volumes should be used for storing intermediate data.",
    'hostPaths');
}

function checkEmptyString(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !isEmptyString(input.namespace),
    "Namespace is mandatory.",
    'namespace');

  accumAssert(accum,
    !(input.persistentVolume === "do_not_use") ||
      !isEmptyString(input.warehouseDir) &&
      (input.warehouseDir.trim().startsWith("s3a://") ||
       input.warehouseDir.trim().startsWith("gs://") ||
       input.warehouseDir.trim().startsWith("hdfs://")) &&
      (input.warehouseDir.trim() !== "s3a://" &&
       input.warehouseDir.trim() !== "gs://" &&
       input.warehouseDir.trim() !== "hdfs://"),
    "Data Warehouse URL should begin with s3a://, gs://, or hdfs://.",
    'warehouseDir');

  accumAssert(accum,
    !(input.persistentVolume !== "do_not_use") ||
      !isEmptyString(input.warehouseDir) &&
      (input.warehouseDir.trim().startsWith("s3a://") ||
       input.warehouseDir.trim().startsWith("gs://") ||
       input.warehouseDir.trim().startsWith("hdfs://") ||
       input.warehouseDir.trim().startsWith("/opt/mr3-run/work-dir/")) &&
      (input.warehouseDir.trim() !== "s3a://" &&
       input.warehouseDir.trim() !== "gs://" &&
       input.warehouseDir.trim() !== "hdfs://" &&
       input.warehouseDir.trim() !== "/opt/mr3-run/work-dir/"),
    "Data Warehouse URL should begin with s3a://, gs://, hdfs://, or /opt/mr3-run/work-dir/.",
    'warehouseDir');

  accumAssert(accum,
    !(input.persistentVolume === "create_new") ||
      input.createPersistentVolume?.pvType !== undefined,
    "PersistentVolumeType is mandatory.",
    ['createPersistentVolume', 'pvType']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "nfs") ||
      !isEmptyString(input.createPersistentVolume.nfs?.server),
    "NFS server is mandatory.",
    ['createPersistentVolume', 'nfs', 'server']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "nfs") ||
      !isEmptyString(input.createPersistentVolume.nfs?.path),
    "NFS path is mandatory.",
    ['createPersistentVolume', 'nfs', 'path']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "csi") ||
      !isEmptyString(input.createPersistentVolume.csi?.driver),
    "CSI Driver is mandatory.",
    ['createPersistentVolume', 'csi', 'driver']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "csi") ||
      !isEmptyString(input.createPersistentVolume.csi?.volumeHandle),
    "CSI Handle is mandatory.",
    ['createPersistentVolume', 'csi', 'volumeHandle']);

  accumAssert(accum,
    !(input.persistentVolume === "create_new" &&
      input.createPersistentVolume?.pvType === "hostPath") ||
      !isEmptyString(input.createPersistentVolume.hostPath?.path),
    "Directory for HostPath Volume is mandatory.",
    ['createPersistentVolume', 'hostPath', 'path']);

  accumAssert(accum,
    !(!isEmptyString(input.externalIp)) || (input.externalIp !== undefined && isValidIpv4Address(input.externalIp)),
    "A valid IP address should be specified for Service IP.",
    'externalIp');

  accumAssert(accum,
    !isEmptyString(input.externalIpHostname),
    "A valid host name should be specified for Service IP.",
    'externalIpHostname');

  accumAssert(accum,
    !isEmptyString(input.hiveserver2Ip) && isValidIpv4Address(input.hiveserver2Ip),
    "A valid IP address should be specified for HiveServer2 IP.",
    'hiveserver2Ip');

  accumAssert(accum,
    !isEmptyString(input.hiveserver2IpHostname),
    "A valid host name should be specified for HiveServer2 IP.",
    'hiveserver2IpHostname');
}

function checkStringTuple(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !((input.persistentVolume === "use_existing" || input.persistentVolume === "create_new") &&
      input.persistentVolumeClaim?.annotations !== undefined) ||
      !(isEmptyString(input.persistentVolumeClaim.annotations.key) && 
        !isEmptyString(input.persistentVolumeClaim.annotations.value)),
    "Key for PersistentVolumeClaim annotation should also be specified.",
    ['persistentVolumeClaim', 'annotations', 'key']);
  accumAssert(accum,
    !((input.persistentVolume === "use_existing" || input.persistentVolume === "create_new") &&
      input.persistentVolumeClaim?.annotations !== undefined) ||
      !(!isEmptyString(input.persistentVolumeClaim.annotations.key) && 
        isEmptyString(input.persistentVolumeClaim.annotations.value)),
    "Value for PersistentVolumeClaim annotation should also be specified.",
    ['persistentVolumeClaim', 'annotations', 'value']);

  accumAssert(accum,
    !((input.persistentVolume === "use_existing" || input.persistentVolume === "create_new") &&
      input.persistentVolumeClaim?.matchLabels !== undefined) ||
      !(isEmptyString(input.persistentVolumeClaim.matchLabels.key) && 
        !isEmptyString(input.persistentVolumeClaim.matchLabels.value)),
    "Key for PersistentVolumeClaim match label should also be specified.",
    ['persistentVolumeClaim', 'matchLabels', 'key']);
  accumAssert(accum,
    !((input.persistentVolume === "use_existing" || input.persistentVolume === "create_new") &&
      input.persistentVolumeClaim?.matchLabels !== undefined) ||
      !(!isEmptyString(input.persistentVolumeClaim.matchLabels.key) && 
        isEmptyString(input.persistentVolumeClaim.matchLabels.value)),
    "Value for PersistentVolumeClaim match label should also be specified.",
    ['persistentVolumeClaim', 'matchLabels', 'value']);

  accumAssert(accum,
    !(input.kerberos !== undefined && 
      (!isEmptyString(input.kerberos.realm) || !isEmptyString(input.kerberos.adminServer) || !isEmptyString(input.kerberos.kdc))) ||
      !isEmptyString(input.kerberos.realm),   
    "A name should also be specified for Realm.",
    ['kerberos', 'realm']);
  accumAssert(accum,
    !(input.kerberos !== undefined && 
      (!isEmptyString(input.kerberos.realm) || !isEmptyString(input.kerberos.adminServer) || !isEmptyString(input.kerberos.kdc))) ||
      !isEmptyString(input.kerberos.adminServer),   
    "A valid address should also be specified for Admin Server.",
    ['kerberos', 'adminServer']);
  accumAssert(accum,
    !(input.kerberos !== undefined && 
      (!isEmptyString(input.kerberos.realm) || !isEmptyString(input.kerberos.adminServer) || !isEmptyString(input.kerberos.kdc))) ||
      !isEmptyString(input.kerberos.kdc),   
    "A valid address should also be specified for KDC.",
    ['kerberos', 'kdc']);

  accumAssert(accum,
    !(input.masterNodeSelector !== undefined) ||
      !(isEmptyString(input.masterNodeSelector.key) && 
        !isEmptyString(input.masterNodeSelector.value)),
    "NodeSelector key for master Pods should also be specified.",
    ['masterNodeSelector', 'key']);
  accumAssert(accum,
    !(input.masterNodeSelector !== undefined) ||
      !(!isEmptyString(input.masterNodeSelector.key) && 
        isEmptyString(input.masterNodeSelector.value)),
    "NodeSelector value for master Pods should also be specified.",
    ['masterNodeSelector', 'value']);

  accumAssert(accum,
    !(input.workerNodeSelector !== undefined) ||
      !(isEmptyString(input.workerNodeSelector.key) && 
        !isEmptyString(input.workerNodeSelector.value)),
    "NodeSelector key for worker Pods should also be specified.",
    ['workerNodeSelector', 'key']);
  accumAssert(accum,
    !(input.workerNodeSelector !== undefined) ||
      !(!isEmptyString(input.workerNodeSelector.key) && 
        isEmptyString(input.workerNodeSelector.value)),
    "NodeSelector value for worker Pods should also be specified.",
    ['workerNodeSelector', 'value']);
}

function checkInvariants(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(!isEmptyString(input.hostPaths)) ||
      input.hostPaths.trim().split(",").every(x =>
        x.trim() !== "" && x.trim().startsWith("/")),
    "HostPath Volumes should be specified with a comma-separated list of paths starting with /.",
    'hostPaths');

  accumAssert(accum,
    !(input.persistentVolume === "do_not_use") ||
      !isEmptyString(input.workDir),
    "Work Directory is mandatory because we do not use PersistentVolume.",
    'workDir');

  accumAssert(accum,
    !(input.persistentVolume === "do_not_use" &&
      !isEmptyString(input.workDir) &&
      input.warehouseDir.trim().startsWith("s3a://") &&
      input.workDir !== undefined) ||
      (input.workDir.trim().startsWith("s3a://") &&
       input.workDir.trim() !== "s3a://"),
    'Work Directory should begin with s3a://.',
    'workDir');

  accumAssert(accum,
    !(input.persistentVolume === "do_not_use" &&
      !isEmptyString(input.workDir) &&
      input.warehouseDir.trim().startsWith("hdfs://") &&
      input.workDir !== undefined) ||
      (input.workDir.trim().startsWith("hdfs://") &&
       input.workDir.trim() !== "hdfs://"),
    'Work Directory should begin with hdfs://.',
    'workDir');

  accumAssert(accum,
    !(input.persistentVolume === "create_new") ||
      isValidPositiveNumber(input.createPersistentVolume?.storageInGb),
    "A valid storage size for PersistentVolume should be specified.",
    ['createPersistentVolume', 'storageInGb']);

  accumAssert(accum,
    !(input.persistentVolume === "use_existing" || input.persistentVolume === "create_new") ||
      isValidPositiveNumber(input.persistentVolumeClaim?.storageInGb),
    "A valid storage size for PersistentVolumeClaim should be specified.",
    ['persistentVolumeClaim', 'storageInGb']);

  accumAssert(accum,
    !(input.kerberos === undefined ||
      (isEmptyString(input.kerberos.realm) &&
       isEmptyString(input.kerberos.adminServer) &&
       isEmptyString(input.kerberos.kdc))) ||
      isEmptyString(input.hdfsKeyProvider),
    "HDFS key provider should not be specified because we do not use Kerberos.",
    'hdfsKeyProvider');

  if (input.hostAliases !== undefined) {
    input.hostAliases.forEach((hostAlias, index) => {
      accumAssert(accum,
        !isEmptyString(hostAlias?.ip),
        "An IP address is mandatory.",
        ['hostAliases', index.toString(), 'ip']);
      accumAssert(accum,
        !(!isEmptyString(hostAlias?.ip)) ||
          isValidIpv4Address(hostAlias.ip),
        "A valid IP address should be specified: " + hostAlias.ip + ".",
        ['hostAliases', index.toString(), 'ip']);
      accumAssert(accum,
        !isEmptyString(hostAlias?.hostnames) &&
          hostAlias.hostnames.split(",").map(x => x.trim()).filter(x => x).length > 0,
        "A comma-separated list of host names should be specified.",
        ['hostAliases', index.toString(), 'hostnames']);
      accumAssert(accum,
        !(isEmptyString(hostAlias?.hostnames)) ||
          hostAlias.hostnames.split(",").map(x => x.trim()).filter(x => isEmptyString(x)).length > 0,
        "A empty host name is given: " + hostAlias.hostnames + ".",
        ['hostAliases', index.toString(), 'hostnames']);
    });
  }

  accumAssert(accum,
    !((!isEmptyString(input.warehouseDir) &&
       input.warehouseDir.trim().startsWith("s3a://")) ||
      (input.persistentVolume === "do_not_use" &&
       input.workDir !== undefined &&   // this condition is already verified
       input.workDir.trim().startsWith("s3a://"))
      ) ||
      input.s3aCredentialProvider !== "DoNotUseS3",
    "Credential Provider should be specified because data warehouse or work directory uses S3.",
    's3aCredentialProvider');
}

export function validate(input: T, consts: consts.T): T {
  const checkResult = check(input);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ...input };
  trimString(copy);   // still, split(",") should be followed by trim()

  // workdir-pv.yaml.ts checks only if nfs/csi/hostPath is undefined
  if (input.createPersistentVolume?.nfs !== undefined &&
      input.createPersistentVolume.pvType !== "nfs") {
    input.createPersistentVolume.nfs = undefined;
  }
  if (input.createPersistentVolume?.csi !== undefined &&
      input.createPersistentVolume.pvType !== "csi") {
    input.createPersistentVolume.csi = undefined;
  }
  if (input.createPersistentVolume?.hostPath !== undefined &&
      input.createPersistentVolume.pvType !== "hostPath") {
    input.createPersistentVolume.hostPath = undefined;
  }
  if (input.kerberos !== undefined &&
      containsEmptyStringOnly(input.kerberos)) {
    input.kerberos = undefined;
  }

  resetStringUndefined(copy.createPersistentVolume, 'storageClass');
  resetStringUndefined(copy.persistentVolumeClaim, 'volumeName');
  resetStringUndefined(copy, 'workDir');
  resetStringUndefined(copy, 's3aEndpoint');
  resetStringUndefined(copy, 'hdfsKeyProvider');
  resetKeyValueUndefined(copy.persistentVolumeClaim, 'annotations');
  resetKeyValueUndefined(copy.persistentVolumeClaim, 'matchLabels');
  resetKeyValueUndefined(copy, 'masterNodeSelector');
  resetKeyValueUndefined(copy, 'workerNodeSelector');

  copy.hostAliasesExpanded = copy.hostAliases.map(function (element) {
    return {
      ip: element.ip,
      hostnames: element.hostnames.split(",").map(x => x.trim()).filter(x => x)
    };
  });

  if (copy.persistentVolume === "do_not_use") {
    copy.execScratchDir = copy.workDir;
  } else {
    copy.execScratchDir = consts.dir.work + "/${user.name}";
  }

  if (copy.warehouseDir.startsWith("hdfs")) {
    copy.credentialsSource = copy.warehouseDir;
  } else {
    copy.credentialsSource = "";
  }

  if (copy.warehouseDir.startsWith("hdfs")) {
    copy.useFileIdPath = true;
  } else {
    copy.useFileIdPath = false;
  }

  const hostPathsExpanded = copy.hostPaths.split(",").map(x => x.trim()).filter(x => x);
  copy.mr3WorkerHostPaths = hostPathsExpanded.join(",");
  copy.mr3WorkerEmptyDirs = copy.mr3WorkerHostPaths === "" ? consts.dir.workLocal : "";

  copy.mr3MasterNodeSelector =
    copy.masterNodeSelector === undefined ? "" : `${copy.masterNodeSelector.key}=${copy.masterNodeSelector.value}`;
  copy.mr3WorkerNodeSelector = 
    copy.workerNodeSelector === undefined ? "" : `${copy.workerNodeSelector.key}=${copy.workerNodeSelector.value}`;

  let mr3HostAliases: string[] = [];
  copy.hostAliasesExpanded.forEach(function (element) {
    const ip = element.ip;
    element.hostnames.forEach(function (hostname) {
      mr3HostAliases.push(`${hostname}=${ip}`);
    })
  });
  copy.mr3HostAliases = mr3HostAliases.join(",");

  if (copy.s3aCredentialProvider === "DoNotUseS3") {
    copy.s3aCredentialProviderClass = "";
  }
  if (copy.s3aCredentialProvider === "EnvironmentVariable") {
    copy.s3aCredentialProviderClass = "com.amazonaws.auth.EnvironmentVariableCredentialsProvider";
  }
  if (copy.s3aCredentialProvider === "InstanceProfile") {
    copy.s3aCredentialProviderClass = "com.amazonaws.auth.InstanceProfileCredentialsProvider";
  }
  if (copy.s3aCredentialProvider === "WebIdentityToken") {
    copy.s3aCredentialProviderClass = "com.amazonaws.auth.WebIdentityTokenCredentialsProvider";
  }

  if (isEmptyString(copy.externalIp)) {
    // use Ingress - port is fixed
    copy.apacheServiceUrl = copy.useHttpsService ?
      `https://${copy.externalIpHostname}` :
      `http://${copy.externalIpHostname}`
  } else {
    // use LoadBalancer
    copy.apacheServiceUrl = copy.useHttpsService ?
      `https://${copy.externalIpHostname}` :  // HTTPS port is fixed
      `http://${copy.externalIpHostname}:${consts.apache.httpPort}`
  }
  return copy;
}

export function initial(): T {
  return {
    namespace: "hivemr3",
    warehouseDir: "",
    persistentVolume: "create_new",
    createPersistentVolume: {
      storageInGb: 0,
      pvType: "nfs"
    },
    persistentVolumeClaim: {
      storageInGb: 0,
      storageClass: ""
    },
    workDir: "",
    s3aEndpoint: "",
    s3aEnableSsl: false,
    s3aCredentialProvider: "DoNotUseS3",
    hostPaths: "",
    externalIp: "",
    externalIpHostname: "",
    hiveserver2Ip: "",
    hiveserver2IpHostname: "",
    hostAliases: [],
    useHttpsService: false
  };
}
