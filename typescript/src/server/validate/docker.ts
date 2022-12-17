import { T as spark } from '../api/docker';
export type { spark as T };
import * as hive from './hive';
import * as timeline from './timeline';
import * as superset from './superset';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, trimString, resetStringUndefined } from '../../helper';

export function check(input: OptionalFields<spark>,
    hive: hive.T, timeline: timeline.T, superset: superset.T): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as spark, hive, timeline, superset);
  checkStringTuple(accum, input as spark);
  checkInvariants(accum, input as spark);

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<spark>) {
}

function checkEmptyString(accum: CheckResult[], input: spark,
  hive: hive.T, timeline: timeline.T, superset: superset.T) {
  accumAssert(accum,
    !isEmptyString(input.docker.image),
    "Docker image for Hive, Metastore, and MR3 Master is mandatory.",
    ['docker', 'image']);

  accumAssert(accum,
    !isEmptyString(input.docker.containerWorkerImage),
    "Docker image for MR3 Worker is mandatory.",
    ['docker', 'containerWorkerImage']);

  accumAssert(accum,
    !(hive.authorization === "RangerHiveAuthorizerFactory") ||
      !isEmptyString(input.docker.rangerImage),
    "Docker image for Ranger is mandatory because Hive uses Ranger for authorization.",
    ['docker', 'rangerImage']);

  accumAssert(accum,
    !timeline.timelineEnabled ||
      !isEmptyString(input.docker.atsImage),
    "Docker image for Grafana, MR3-UI is mandatory.",
    ['docker', 'atsImage']);

  accumAssert(accum,
    !superset.supersetEnabled ||
      !isEmptyString(input.docker.supersetImage),
    "Docker image for Superset is mandatory.",
    ['docker', 'supersetImage']);

  accumAssert(accum,
    !isEmptyString(input.docker.user),
    "Docker User (for Hive, Metastore, and MR3) is mandatory.",
    ['docker', 'user']);
}

function checkStringTuple(accum: CheckResult[], input: spark) {
}

function checkInvariants(accum: CheckResult[], input: spark) {
}

export function validate(input: spark): spark {
  const copy = { ... input };
  trimString(copy);
  resetStringUndefined(copy, 'imagePullSecrets');

  copy.yamlImagePullSecrets =
    input.docker.imagePullSecrets ? [{ name: input.docker.imagePullSecrets }] : [];

  return copy;
}

export function initial(): spark {
  return {
    docker: {
      image: "mr3project/hive3:1.6",                        // use MR3 version
      containerWorkerImage: "mr3project/hive3:1.6",         // use MR3 version
      rangerImage: "mr3project/ranger:2.1.0",
      atsImage: "mr3project/mr3ui:1.5",                     // use MR3 version
      supersetImage: "mr3project/superset:1.4.2",
      apacheImage: "mr3project/httpd:2.4",
      user: "hive",
      imagePullPolicy: "Always",
      sparkImage: "mr3project/spark3:3.2.2",
      sparkUser: "spark"
    }
  };
}
