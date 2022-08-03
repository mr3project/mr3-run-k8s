#!/bin/bash

gcloud container clusters create ${gke.clusterName} \
    --release-channel=None \
    --zone=${gke.computeZone} \
    --node-locations=${gke.computeZone} \
    --machine-type=${gke.masterMachineType} \
    --num-nodes=1 \
    --node-labels=roles=${gke.masterLabelRoles} \
    --service-account=${gke.iamServiceAccount} \
    --workload-pool=${gke.projectId}.svc.id.goog

gcloud container node-pools create ${gke.workerPoolName} \
    --cluster=${gke.clusterName} \
    --machine-type=${gke.workerMachineType} \
    --node-labels=roles=${gke.masterLabelRoles} \
    --service-account=${gke.iamServiceAccount} \
    --local-ssd-count=${gke.localSsdCount} \
    --enable-autoscaling \
    --max-nodes=${gke.numWorkerNodes} \
    --min-nodes=0 \
    --num-nodes=0 \
    --spot \
    --workload-metadata=GKE_METADATA

