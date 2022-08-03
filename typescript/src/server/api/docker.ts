export interface T {
  docker: {
    image: string;
    containerWorkerImage: string;
    rangerImage: string;
    atsImage: string;
    supersetImage: string;
    apacheImage: string;
    user: string;
    imagePullPolicy: "IfNotPresent" | "Always";
    imagePullSecrets?: string;
    sparkImage: string;
    sparkUser: string;
  };
  //
  // set in validate()
  //
  yamlImagePullSecrets?: { name: string }[];
}
