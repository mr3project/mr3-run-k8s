import * as fs from 'fs';
import * as env from './env';

export function expand(file: string, env: env.T): string {
  const compile = require('es6-template-strings/compile');
  const resolveToString = require('es6-template-strings/resolve-to-string');

  const data = fs.readFileSync(file, 'utf8')
  const template = compile(data, env);
  const result = resolveToString(template, env);

  return result;
}
