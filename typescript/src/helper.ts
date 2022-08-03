import { strict as assert } from 'assert';

export interface CheckResult {
  field: string | string[];
  msg: string | string[];
}

export function accumDefined(
    accum: CheckResult[], value: any, msg: string, field: string | string[]) {
  if (value === undefined) {
    accumAssert(accum, false, msg + " -- mandatory.", field);
  }
}

export function accumAssert(
    accum: CheckResult[], cond: boolean, msg: string, field: string | string[]) {
  assert(!(typeof field !== "string") || (field.length > 1), "accumAssert(): " + field);

  if (!cond) {
    // calculating 'index' requires that no field contain ','
    const fieldStr = field.toString();
    const index = accum.findIndex(p => { return p.field.toString() === fieldStr; });
    if (index > -1) {
      const current = accum[index];
      if (typeof current.msg === "string") {
        current.msg = [current.msg, msg];
      } else {
        current.msg.push(msg);
      }
    } else {
      const result: CheckResult = { field: field, msg: msg };
      accum.push(result);
    }
  }
}

export type OptionalFields<T extends object | undefined> = {
  [K in keyof T] ? : T[K] extends object | undefined ? OptionalFields<T[K]> : T[K];
}

export function checkNonEmpty(accum: CheckResult[], value: string | undefined, field: string, desc: string) {
  accumAssert(accum, !isEmptyString(value), desc + " is mandatory.", field);
}

export function isEmptyString(str: string | undefined): boolean {
  return str === undefined || (typeof str === "string" && str.trim() === "");
}

export function isValidNumber(num: any): boolean {
  return (typeof num === "number") && !isNaN(num) && num !== Infinity && num >=0;
}

export function isValidPositiveNumber(num: any): boolean {
  return (typeof num === "number") && !isNaN(num) && num !== Infinity && num > 0;
}

export function isValidPort(num: any): boolean {
  return (typeof num === "number") && !isNaN(num) && num !== Infinity && 0 <= num && num < 256;
}

export function isValidIpv4Address(addr: string): boolean {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(addr);
}

export function trimString(obj: any) {
  for (const [k, v] of Object.entries(obj)) {
    if (Object(v) === v) {
      trimString(v)
    } else if (typeof v === 'string') {
      if (!k.toLowerCase().endsWith("data")) {   // for 'data and '...Data' in secret.ts
        obj[k] = v.trim();
      }
    }
  }
  return obj;
}

export function containsEmptyStringOnly(obj: any): boolean {
  for (const [k, v] of Object.entries(obj)) {
    if (Object(v) === v) {
      const emptyOnly = containsEmptyStringOnly(v);
      if (!emptyOnly) {
        return false;
      }
    } else if (typeof v === 'string') {
      const emptyOnly = isEmptyString(v);
      if (!emptyOnly) {
        return false;
      }
    }
  }
  return true;
}

const kubeConfigLimit = 20000;
const dataLimit = 25000;
const stringLimit = 100;

export function checkString(obj: any) {
  for (const [k, v] of Object.entries(obj)) {
    if (Object(v) === v) {
      checkString(v)
    } else if (typeof v === 'string') {
      if (k.endsWith("kubeConfig")) {
        if (v.length > kubeConfigLimit) {
          throw `Abnormal .kube/config detected (${v.length})`;
        }
      } else if (k.toLowerCase().endsWith("data") || k.toLowerCase().endsWith("datainternal")) {   // for 'data', '...Data', '...dataInternal'
        if (v.length > dataLimit) {
          throw `Abnormal data detected (${k}, ${v.length})`;
        }
      } else {
        if (v.length > stringLimit) {
          throw `Abnormal input detected (${k}, ${v.length})`;
        }
      }
    }
  }
  return obj;
}

// foo?: string
// - if foo === undefined, consider it as 'undefined'
// - if foo !== undefined && foo.trim() === "", consider it as 'undefined'
// - if foo !== undefined && foo.trim() !== "", consider it as 'defined'
// requirement: p.prop?: string
export function resetStringUndefined(p: any, prop: string) {
  if (p !== undefined &&
      // Object.keys(p).includes(prop) &&
      p[prop] !== undefined &&
      isEmptyString(p[prop])) {
    p[prop] = undefined;
  }
}

// requirement: p.prop?: { key: string, value: string }
export function resetKeyValueUndefined(p: any, prop: string) {
  if (p !== undefined &&
      // Object.keys(p).includes(prop) &&
      p[prop] !== undefined &&
      isEmptyString(p[prop].key) &&
      isEmptyString(p[prop].value)) {
    p[prop] = undefined;
  }
}
