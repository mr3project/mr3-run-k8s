import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.driver !== undefined);

  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: env.driver.name,
      namespace: env.basics.namespace
    },
    spec: {
      clusterIP: "None",
      selector: {
        sparkmr3_app: env.driver.name
      },
      ports: [
        { name: "driver",
          port: env.consts.spark.port,
          targetPort: env.consts.spark.port },
        { name: "webui",
          port: env.consts.spark.uiPort,
          targetPort: env.consts.spark.uiPort }
      ]
    }
  }
}
