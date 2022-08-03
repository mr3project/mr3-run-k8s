import * as eks from './api/eks';
import * as efs from './api/efs';
import * as service from './api/service';
import * as autoscaler from './api/autoscaler';

import * as apps from '../public/api/apps';

export interface ExpressEnv {
  eksEnv?: eks.T;
  autoscalerEnv?: autoscaler.T;
  serviceEnv?: service.T;
  efsEnv?: efs.T;
  appsEnv?: apps.T;
}
