import { T } from '../api/driver';
export type { T };
import * as spark from '../api/spark';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidPositiveNumber, trimString, resetKeyValueUndefined, containsEmptyStringOnly } from '../../helper';

export function check(input: OptionalFields<T>, spark: spark.T): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T, spark); 

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T) {
}

function checkStringTuple(accum: CheckResult[], input: T) {
}

function checkInvariants(accum: CheckResult[], input: T, spark: spark.T) {
  const driverNames = 
    spark.driverNameStr === undefined ? [] :
    spark.driverNameStr.trim().split(",").map(x => x.trim()).filter(x => !isEmptyString(x));
  accumAssert(accum,
    !isEmptyString(input.name) && driverNames.includes(input.name.trim()),
    "A valid name should be chosen for the Spark driver Pod: " + driverNames.join(",") + ". ",
    'name');

  accumAssert(accum,
    isValidPositiveNumber(input.resources.cpu),
    "A valid value should be specified for the number of CPUs. ",
    ['resources', 'cpu']);

  accumAssert(accum,
    isValidPositiveNumber(input.resources.memoryInMb) && input.resources.memoryInMb >= 1024,
    "The memory size should be valid and at least 1024MB. ",
    ['resources', 'memoryInMb']);
}

export function validate(input: T, spark: spark.T): T {
  const checkResult = check(input, spark);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ... input };
  trimString(copy);

  copy.sparkDriverCores = Math.max(1, Math.floor(input.resources.cpu));
  copy.sparkDriverMemoryInMb = Math.floor(input.resources.memoryInMb * 0.8);

  return copy;
}

export function initial(): T {
  return {
    name: "",
    resources: {
      cpu: 0,
      memoryInMb: 0
    }
  };
}
