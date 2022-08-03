import { T } from '../api/master';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isValidNumber, isValidPositiveNumber } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T); 

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
}

function checkEmptyString(accum: CheckResult[], input: T) {
}

function checkStringTuple(accum: CheckResult[], input: T) {
}

function checkInvariants(accum: CheckResult[], input: T) {
  accumAssert(accum,
    isValidPositiveNumber(input.resources.cpu),
    "A valid value should be specified for the number of CPUs.",
    ['resources', 'cpu']);

  accumAssert(accum,
    isValidPositiveNumber(input.resources.memoryInMb) && input.resources.memoryInMb >= 1024,
    "The memory size should be valid and at least 1024MB.",
    ['resources', 'memoryInMb']);

  accumAssert(accum,
    isValidPositiveNumber(input.mr3MasterCpuLimitMultiplier) &&
    input.mr3MasterCpuLimitMultiplier >= 1.0 &&
    input.mr3MasterCpuLimitMultiplier <= 2.0,
    "A valid value between 1.0 and 2.0 should be specified for the CPU limit multiplier.",
    'mr3MasterCpuLimitMultiplier');

  accumAssert(accum,
    isValidPositiveNumber(input.concurrencyLevel),
    "The concurrency level should be valid.",
    'concurrencyLevel');

  accumAssert(accum,
    isValidPositiveNumber(input.numTaskAttempts),
    "A valid value should be specified for the max number of task attempts.",
    'numTaskAttempts');

  accumAssert(accum,
    isValidPositiveNumber(input.speculativeThresholdPercent) &&
      1 <= input.speculativeThresholdPercent && input.speculativeThresholdPercent <= 100,
    "The threshold for speculative execution should be in the range of [1, 100] (in percent).",
    'speculativeThresholdPercent');

  accumAssert(accum,
    isValidPositiveNumber(input.workerIdleTimeoutInMinutes),
    "A valid value should be specified for the timeout of idle workers (in minutes).",
    'workerIdleTimeoutInMinutes');

  if (input.autoscalingEnabled) {
    accumAssert(accum,
      isValidPositiveNumber(input.scaleOutThreshold) &&
        input.scaleOutThreshold !== undefined &&
        1 <= input.scaleOutThreshold && input.scaleOutThreshold <= 100,
      "The scale-out threshold (in percent) should be in the range of [1, 100].",
      'scaleOutThreshold');
    accumAssert(accum,
      isValidNumber(input.scaleInThreshold) &&
        input.scaleOutThreshold !== undefined &&
        input.scaleInThreshold !== undefined &&
        0 <= input.scaleInThreshold && input.scaleInThreshold < input.scaleOutThreshold,
      "The scale-in threshold (in percent) should be in the range of [0, Scale-Out Threshold].",
      'scaleInThreshold');
    accumAssert(accum,
      isValidPositiveNumber(input.scaleOutInitialContainers),
      "A valid value should be specified for the number of initial workers created at the first scale-out event.",
      'scaleOutInitialContainers');
    accumAssert(accum,
      isValidPositiveNumber(input.scaleOutIncrement),
      "A valid value should be specified for the increment in the number of workers at a scale-out event.",
      'scaleOutIncrement');
    accumAssert(accum,
      isValidPositiveNumber(input.scaleInDecrementHosts),
      "A valid value should be specified for the decrement in the number of nodes at a scale-in event.",
      'scaleInDecrementHosts');
    accumAssert(accum,
      isValidPositiveNumber(input.scaleInMinHosts),
      "A valid value should be specified for the minimum number of nodes that should remain after scale-in events.",
      'scaleInMinHosts');
  }
}

export function validate(input: T): T {
  const checkResult = check(input);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ... input };
  // no call to trimString(copy) because there is no string in master

  return copy;
}

export function initial(): T {
  return {
    resources: {
      cpu: 0,
      memoryInMb: 0
    },
    mr3MasterCpuLimitMultiplier: 1.0,
    concurrencyLevel: 32,
    dagQueueScheme: "common",
    dagPriorityScheme: "fifo",
    numTaskAttempts: 3,
    speculativeThresholdPercent: 99,
    workerIdleTimeoutInMinutes: 60,
    autoscalingEnabled: true,
    scaleOutThreshold: 60,
    scaleInThreshold: 30,
    scaleOutInitialContainers: 4,
    scaleOutIncrement: 1,
    scaleInDecrementHosts: 1,
    scaleInMinHosts: 1
  };
}
