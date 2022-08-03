import { T } from '../api/timeline';
export type { T };
import * as basics from '../api/basics';
import * as consts from '../../consts';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber } from '../../helper';

export function check(
    input: OptionalFields<T>, basics: basics.T): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T, basics);

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T) {
}

function checkStringTuple(accum: CheckResult[], input: T) {
}

function checkInvariants(accum: CheckResult[], input: T, basics: basics.T) {
  accumAssert(accum,
    !input.timelineEnabled ||
    ((isValidPositiveNumber(input.resources?.cpu) &&
      input.resources !== undefined &&
      input.resources.cpu >= 1) ||
     (isValidPositiveNumber(input.prometheusResources?.cpu) &&
      isValidPositiveNumber(input.timelineServerResources?.cpu) &&
      isValidPositiveNumber(input.jettyResources?.cpu) &&
      isValidPositiveNumber(input.grafanaResources?.cpu))
    ),
    "A valid value should be specified for the number of CPUs.",
    ['resources', 'cpu']);
  accumAssert(accum,
    !input.timelineEnabled ||
    ((isValidPositiveNumber(input.resources?.memoryInMb) &&
      input.resources !== undefined &&
      input.resources.memoryInMb >= 4096) ||
     (isValidPositiveNumber(input.prometheusResources?.memoryInMb) &&
      isValidPositiveNumber(input.timelineServerResources?.memoryInMb) &&
      isValidPositiveNumber(input.jettyResources?.memoryInMb) &&
      isValidPositiveNumber(input.grafanaResources?.memoryInMb))
    ),
    "The memory size should be valid and at least 4096MB.",
    ['resources', 'memoryInMb']);

  accumAssert(accum,
    !(input.timelineEnabled && (
      basics.kerberos === undefined ||
      (isEmptyString(basics.kerberos.realm) ||
       isEmptyString(basics.kerberos.adminServer) ||
       isEmptyString(basics.kerberos.kdc))
      )) ||
      !input.enableKerberos,
    "Kerberos cannot be used because Kerberos is not available in the System page.",
    'enableKerberos');
}

export function validate(input: T, consts: consts.T, basics: basics.T): T {
  const checkResult = check(input, basics);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ... input };

  if (copy.apacheResources === undefined) {
    copy.apacheResources = { cpu: 0.25, memoryInMb: 0.5 * 1024 };
  }

  if (copy.prometheusResources === undefined ||
      copy.timelineServerResources === undefined ||
      copy.jettyResources === undefined ||
      copy.grafanaResources === undefined) {
    assert(copy.resources !== undefined);
    copy.prometheusResources =      { cpu: copy.resources.cpu - 0.75, memoryInMb: copy.resources.memoryInMb - 2 * 1024 };
    copy.timelineServerResources =  { cpu: 0.25, memoryInMb: 1 * 1024 };
    copy.jettyResources =           { cpu: 0.25, memoryInMb: 0.5 * 1024 };
    copy.grafanaResources =         { cpu: 0.25, memoryInMb: 0.5 * 1024 };
  }

  const enableSsl = false;
  copy.httpPolicy = (copy.timelineEnabled && enableSsl) ? "HTTPS_ONLY" : "HTTP_ONLY";

  const address = consts.name.timeline.service + '.' + basics.namespace + '.svc.cluster.local';

  copy.timelineHost = address;
  const header = enableSsl ? "https" : "http";
  const port = enableSsl ? consts.timeline.httpsPort : consts.timeline.httpPort;

  copy.timelineUrl = `${header}://${address}:${port}`;
  copy.timelineAddressHttp = `${address}:${consts.timeline.httpPort}`;
  copy.timelineAddressHttps = `${address}:${consts.timeline.httpsPort}`;

  copy.jettyHttpUrl = `http://${address}:8080`;  // points to Jetty server
  copy.grafanaHttpUrl = `http://${address}:${consts.timeline.grafanaPort}`;

  return copy;
}

export function initial(): T {
  return {
    timelineEnabled: true,
    resources: {
      cpu: 0,
      memoryInMb: 0
    },
    enableKerberos: false,
    enableTaskView: false
  };
}
