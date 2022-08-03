import { T } from '../api/service';
export type { T };
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, checkNonEmpty, OptionalFields, trimString } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];
  let service: T = input as T;

  checkNonEmpty(accum, service.namespace, 'namespace', "Namespace");

  if (service.useHttps) {
    checkNonEmpty(accum, service.serviceSecretName, 'serviceSecretName', "SSL secret Nname");
    checkNonEmpty(accum, service.serviceDomain, 'serviceDomain', "SSL secret domain");
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
    namespace: "hivemr3",

    useHttps: false,
    serviceSecretName: "",
    serviceDomain: ""
  };
}
