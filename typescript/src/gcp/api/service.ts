import * as service from '../../public/api/service';

export interface T extends service.T {
  serviceSecretName?: string;   // spec.tls.secretName
  serviceDomain?: string;       // spec.rules.host
}
