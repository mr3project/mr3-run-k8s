import * as fs from 'fs';
import * as state from './state';

export function expand(file: string, s: state.T): string {
  const compile = require('es6-template-strings/compile');
  const resolveToString = require('es6-template-strings/resolve-to-string');

  const data = fs.readFileSync(file, 'utf8')
  const template = compile(data, s);
  const result = resolveToString(template, s);

  return result;
}

export function read(file: string, s: state.T): string {
  const data = fs.readFileSync(file, 'utf8')
  return data;
}

