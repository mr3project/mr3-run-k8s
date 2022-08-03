import * as state from '../state';
import { strict as assert } from 'assert';

export function build(s: state.T) {
  const env = s.env;
  assert(env.basics.createPersistentVolume !== undefined);
  const persistentVolume = env.basics.createPersistentVolume; 

  let spec: any = {
    capacity: {
      storage: `${persistentVolume.storageInGb}Gi`
    },
    volumeMode: persistentVolume.volumeMode !== undefined ? persistentVolume.volumeMode : "Filesystem",
    accessModes: [
      "ReadWriteMany"
    ],
    persistentVolumeReclaimPolicy: persistentVolume.reclaimPolicy !== undefined ? persistentVolume.reclaimPolicy : "Delete",
    storageClassName: persistentVolume.storageClass
  };
  if (persistentVolume.nfs !== undefined) {
    spec.nfs = persistentVolume.nfs;
  } 
  if (persistentVolume.csi !== undefined) {
    spec.csi = persistentVolume.csi;
  } 
  if (persistentVolume.hostPath !== undefined) {
    spec.hostPath = persistentVolume.hostPath;
  }

  return {
    apiVersion: "v1",
    kind: "PersistentVolume",
    metadata: {
      name: env.consts.name.persistentVolume,
      namespace: env.basics.namespace
    },
    spec: spec
  };
}
