import { T } from '../api/autoscaler';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, checkNonEmpty, OptionalFields, trimString } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];
  let autoscaler: T = input as T;

  accumAssert(accum, autoscaler.autoscalingScaleDownDelayAfterAddMin >= 1,
    "Delay After Scale-In should be be greater than 0.", 'autoscalingScaleDownDelayAfterAddMin');
  accumAssert(accum, autoscaler.autoscalingScaleDownUnneededTimeMin >= 1,
    "Unneeded Time should be greater than 0.", 'autoscalingScaleDownUnneededTimeMin');

  return accum;
}

export function validate(input: T): T {
  const checkResult = check(input);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ...input };
  trimString(copy);   // still, split(",") should be followed by trim()

  return copy;
}

export function initial(): T {
  return {
    autoscalingScaleDownDelayAfterAddMin: 5,
    autoscalingScaleDownUnneededTimeMin: 1
  };
}
