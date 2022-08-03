import { T } from '../api/spark';
export type { T };
import { strict as assert } from 'assert';
import * as basics from '../api/basics';
import * as consts from '../../consts';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber, trimString, resetKeyValueUndefined, containsEmptyStringOnly } from '../../helper';

export function check(input: OptionalFields<T>,
    consts: consts.T): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T, consts); 

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T) {
}

function checkStringTuple(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(input.serviceAccountAnnotations !== undefined) ||
    !(isEmptyString(input.serviceAccountAnnotations.key) &&
      !isEmptyString(input.serviceAccountAnnotations.value)),
    "Service Account Annotation key should also be specified.",
    ['serviceAccountAnnotations', 'key']);

  accumAssert(accum,
    !(input.serviceAccountAnnotations !== undefined) ||
    !(!isEmptyString(input.serviceAccountAnnotations.key) &&
      isEmptyString(input.serviceAccountAnnotations.value)),
    "Service Account Annotation value should also be specified.",
    ['serviceAccountAnnotations', 'value']);
}

function checkInvariants(accum: CheckResult[], input: T, consts: consts.T) {
  if (input.driverNameStr !== undefined) {
    // check lower case and existing service names
    const invalidNames = 
      input.driverNameStr.trim().split(",")
        .filter(x => !isEmptyString(x)).map(x => x.trim()).filter(x => !(
          x.toLowerCase() == x &&
          !([consts.name.metastore.service,
            consts.name.hive.service,
            consts.name.hive.serviceInternal,
            consts.name.ranger.service,
            consts.name.timeline.service,
            consts.name.superset.service,
            ].includes(x))));
    accumAssert(accum,
      invalidNames.length == 0,
      "A wrong driver name (with uppercase letters or identical to an existing service) is included: " + invalidNames.join(","),
      'driverNameStr');

    accumAssert(accum,
      input.driverNameStr.trim().split(",").map(x => x.trim()).filter(x => !isEmptyString(x)).length > 0,
      "Valid driver names should be specified.",
      'driverNameStr');
  }
}

export function validate(input: T, consts: consts.T, basics: basics.T): T {
  const checkResult = check(input, consts);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ... input };
  trimString(copy);

  resetKeyValueUndefined(copy, 'serviceAccountAnnotations');

  copy.driverNames = copy.driverNameStr.trim().split(",").map(x => x.trim()).filter(x => !isEmptyString(x));

  copy.uiProxyPassRules = "";
  for (var i = 0; i < copy.driverNames.length; i++) {
    const service = copy.driverNames[i];
    const address = service + '.' + basics.namespace + '.svc.cluster.local';
    const httpUrl = `http://${address}:${consts.spark.uiPort}`;
    copy.uiProxyPassRules += `  ProxyPass /${service} ${httpUrl}\n`;
    copy.uiProxyPassRules += `  ProxyPassReverse /${service} ${httpUrl}\n`;
  }

  return copy;
}

export function initial(): T {
  return {
    driverNameStr: "spark1,spark2,spark3,spark4"
  };
}
