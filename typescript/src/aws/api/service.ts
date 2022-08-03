import * as service from '../../public/api/service';

export interface T extends service.T {
  useHttps: boolean;
  // arn:aws:acm:{region}:{user id}:certificate/{id}
  sslCertificateArn?: string;
}
