export interface T {
  timelineEnabled: boolean,   // Timeline and MR3-UI, Prometheus and Grafana
  // if undefined, set in validate()
  apacheResources?: {         // for Apache server
    cpu: number; 
    memoryInMb: number;
  };
  // either resources or prometheus/timelineServer/jetty/grafanaResources should be defined
  //   - AWS: prometheus/timelineServer/jetty/grafanaResources is defined
  //   - General: resources is defined
  resources?: {               // for all components
    cpu: number; 
    memoryInMb: number;
  };
  enableKerberos: false;      // false in mr3-cloud
  enableTaskView: boolean;
  //
  // set in validate()
  //
  prometheusResources?: {
    cpu: number; 
    memoryInMb: number;
  };
  timelineServerResources?: {
    cpu: number; 
    memoryInMb: number;
  };
  jettyResources?: {
    cpu: number; 
    memoryInMb: number;
  };
  grafanaResources?: {
    cpu: number; 
    memoryInMb: number;
  };
  httpPolicy?: string;
  timelineHost?: string;
  timelineUrl?: string;
  timelineAddressHttp?: string;
  timelineAddressHttps?: string;
  // for Apache server
  jettyHttpUrl?: string;
  grafanaHttpUrl?: string;
}
