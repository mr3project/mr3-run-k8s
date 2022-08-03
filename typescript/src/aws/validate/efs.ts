import { T } from '../api/efs';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, checkNonEmpty, isEmptyString, OptionalFields, trimString } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];
  let efs: T = input as T;

  checkNonEmpty(accum, efs.efsId, 'efsId', 'EFS ID');
  if (!isEmptyString(efs.efsId)) {
    accumAssert(accum,
      efs.efsId.trim().startsWith("fs-") &&
      efs.efsId.trim().length >= 11,
      "EFS ID should be properly set.", 'efsId');
  }

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
    efsId: "fs-"
  };
}
