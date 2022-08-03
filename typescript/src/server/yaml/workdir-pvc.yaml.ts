import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.basics.persistentVolumeClaim !== undefined);
  const persistentVolumeClaim = env.basics.persistentVolumeClaim;

  const annotations =
    persistentVolumeClaim.annotations !== undefined ?   // on EKS
    { [persistentVolumeClaim.annotations.key]: persistentVolumeClaim.annotations.value } :
    {};
  const selector = 
    persistentVolumeClaim.matchLabels !== undefined ?
    { matchLabels: {
        [persistentVolumeClaim.matchLabels.key]: persistentVolumeClaim.matchLabels.value
      } } :
    {};
  const spec = 
    persistentVolumeClaim.annotations !== undefined ?   // on EKS
    { resources: { requests: { storage: `${persistentVolumeClaim.storageInGb}Gi` } },
      accessModes: [ "ReadWriteMany" ]
    } :
    { resources: { requests: { storage: `${persistentVolumeClaim.storageInGb}Gi` } },
      accessModes: [ "ReadWriteMany" ],
      volumeName: persistentVolumeClaim.volumeName !== undefined ? persistentVolumeClaim.volumeName : "",
      storageClassName: persistentVolumeClaim.storageClass,
      selector: selector
    };
  return {
    apiVersion: "v1",
    kind: "PersistentVolumeClaim",
    metadata: {
      name: env.consts.name.persistentVolumeClaim,
      namespace: env.basics.namespace,
      annotations: annotations
    },
    spec: spec
  };
}