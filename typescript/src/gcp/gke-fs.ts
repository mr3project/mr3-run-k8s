import * as fs from 'fs';

import * as env from './env';
import { expand } from './util-fs';
import * as gke from './validate/gke';

export function build(file: string, gkeInput: gke.T): string {
  const gkeConf: gke.T = gke.validate(gkeInput);
  const envConf: env.T = {
    gke: gkeConf
  };

  return expand(file, envConf);
}

export async function run(file: string, gkeInput: gke.T) {
  try {
    const result =  build(file, gkeInput);
    fs.writeFileSync("gke.sh", result, { flag: 'w' });
  } catch (e) {
      const message = 'Execution failed: ' + e;
      console.log(message);
  }
}
