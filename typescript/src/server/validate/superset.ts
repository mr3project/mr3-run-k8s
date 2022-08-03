import { T } from '../api/superset';
export type { T };
import * as consts from '../../consts';
import * as basics from './basics';
import * as hive from './hive';
import { CheckResult, accumAssert, OptionalFields, isValidPositiveNumber } from '../../helper';

export function check(input: OptionalFields<T>, hive: hive.T): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T, hive);

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T) {
}

function checkStringTuple(accum: CheckResult[], input: T) {
}

function checkInvariants(accum: CheckResult[], input: T, hive: hive.T) {
  accumAssert(accum,
    !input.supersetEnabled ||
      !hive.enableSslInternal,
    "Currently Superset does not support Hive with SSL encryption",
    'supersetEnabled');

  accumAssert(accum,
    !input.supersetEnabled ||
      isValidPositiveNumber(input.resources?.cpu),
    "A valid value should be specified for the number of CPUs.",
    ['resources', 'cpu']);
  accumAssert(accum,
    !input.supersetEnabled ||
      isValidPositiveNumber(input.resources?.memoryInMb) &&
      (input.resources !== undefined && input.resources.memoryInMb >= 4096),
    "The memory size should be valid and at least 4096MB.",
    ['resources', 'memoryInMb']);

}

export function validate(input: T, consts: consts.T, basics: basics.T): T {
  const copy = { ... input };

  const address = consts.name.superset.service + '.' + basics.namespace + '.svc.cluster.local';
  copy.httpUrl = `http://${address}:8088`;

  return copy;
}

export function initial(): T {
  return {
    supersetEnabled: true,
    resources: {
      cpu: 0,
      memoryInMb: 0
    },
    enableSsl: false
  };
}
