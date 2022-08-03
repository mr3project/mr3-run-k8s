import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  assert(s.env.timeline.timelineEnabled); 
  const env = s.env;

  let data: { [key: string]: string } = {};
  if (env.timeline.enableKerberos && env.secret.kerberosSecret !== undefined) {
    data[env.secret.kerberosSecret.server.keytabInternal] = env.secret.kerberosSecret.server.dataInternal;
  }

  return {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: env.consts.name.timeline.secret,
      namespace: env.basics.namespace
    },
    type: "Opaque",
    data: data
  };
}
