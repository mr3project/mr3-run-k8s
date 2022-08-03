import { T } from '../api/worker';
export type { T };
import * as consts from '../../consts';
import { strict as assert } from 'assert';
import { CheckResult, accumAssert, OptionalFields, isEmptyString, isValidNumber, isValidPositiveNumber, trimString } from '../../helper';

export function check(input: OptionalFields<T>): CheckResult[] {
  let accum: CheckResult[] = [];

  checkRequiredType(accum, input);
  checkEmptyString(accum, input as T);
  checkStringTuple(accum, input as T);
  checkInvariants(accum, input as T); 

  return accum;
}

function checkRequiredType(accum: CheckResult[], input: OptionalFields<T>) {
  accumAssert(accum,
    !input.llapIoEnabled ||
      input.llapIo !== undefined,
    "LLAP I/O is missing.",
    "llapIoEnabled");
}

function checkEmptyString(accum: CheckResult[], input: T) {
  accumAssert(accum,
    !(input.llapIoEnabled == true && input.llapIo?.memoryMapped) ||
      !isEmptyString(input.llapIo?.memoryMappedPath),
    "A directory for memory-mapped LLAP I/O cache should be specified (which is mounted as a hostPath volume).",
    ['llapIo', 'memoryMappedPath']);
}

function checkStringTuple(accum: CheckResult[], input: T) {
}

function checkInvariants(accum: CheckResult[], input: T) {
  accumAssert(accum,
    isValidPositiveNumber(input.workerMemoryInMb) && input.workerMemoryInMb >= 1024,
    "The memory size should be valid and at least 1024MB.",
    'workerMemoryInMb');

  accumAssert(accum,
    isValidNumber(input.workerCores) && input.workerCores >= 0.1,
    "The number of CPUs should be valid and at least 0.1.",
    'workerCores');

  accumAssert(accum,
    isValidPositiveNumber(input.numTasksInWorker),
    "A valid value should be specified for the max number of concurrent tasks in a worker.",
    'numTasksInWorker');

  accumAssert(accum,
    !(isValidPositiveNumber(input.numTasksInWorker) && 
      isValidPositiveNumber(input.workerMemoryInMb)) ||
      input.workerMemoryInMb / 1024 >= input.numTasksInWorker,  
    "In order to guarantee 1024MB of memory for each task, it should be no larger than "
      + Math.floor(input.workerMemoryInMb / 1024) + ".",
    'numTasksInWorker');

  accumAssert(accum,
    isValidPositiveNumber(input.numMaxWorkers),
    "A valid value should be specified for the max number of workers.",
    'numMaxWorkers');

  accumAssert(accum,
    !input.llapIoEnabled ||
      isValidPositiveNumber(input.llapIo?.memoryInGb),
    "A valid value should be specified for the size of LLAP I/O cache memory in GB.",
    ['llapIo', 'memoryInGb']);

  accumAssert(accum,
    isValidPositiveNumber(input.tezIoSortMb) &&
    (!isValidPositiveNumber(input.workerMemoryInMb) ||
      input.tezIoSortMb < input.workerMemoryInMb),
    "A valid value should be specified for the size of sort buffer in MB. " +
    "It should be no larger than the memory size for a worker.",
    'tezIoSortMb');

  accumAssert(accum,
    isValidPositiveNumber(input.tezUnorderedOutputBufferSizeInMb) &&
    (!isValidPositiveNumber(input.workerMemoryInMb) ||
      input.tezUnorderedOutputBufferSizeInMb < input.workerMemoryInMb),
    "A valid value should be specified for the size of unordered output buffer in MB. " +
    "It should be no larger than the memory size for a worker.",
    'tezUnorderedOutputBufferSizeInMb');

  accumAssert(accum,
    isValidPositiveNumber(input.noConditionalTaskSize) &&
    (!isValidPositiveNumber(input.workerMemoryInMb) ||
      input.noConditionalTaskSize < input.workerMemoryInMb * 1024 * 1024),
    "A valid value should be specified for the map-side join threshold in bytes. " +
    "It should be no larger than the memory size for a worker.",
    'noConditionalTaskSize');

  accumAssert(accum,
    isValidPositiveNumber(input.maxReducers),
    "A valid value should be specified for the max number of reducers per vertex.",
    'maxReducers');

  accumAssert(accum,
    isValidNumber(input.javaHeapFraction) &&
      0.0 < input.javaHeapFraction && input.javaHeapFraction < 1.0,
    "A valid value should be specified for Java heap fraction. " +
    "Java heap fraction should be in the range of (0.0, 1.0).",
    'javaHeapFraction');

  accumAssert(accum,
    isValidPositiveNumber(input.numShuffleHandlersPerWorker),
    "A valid value should be specified for the number of shuffle handlers per vertex.",
    'numShuffleHandlersPerWorker');

  accumAssert(accum,
    isValidNumber(input.numThreadsPerShuffleHandler),
    "A valid value should be specified for the number of threads per shuffle handler.",
    'numThreadsPerShuffleHandler');
}

export function validate(input: T, consts: consts.T): T {
  // TODO:
  // resetStringUndefined(s.workerEnv.llapIo, 'memoryMappedPath');
  const checkResult = check(input);
  assert(checkResult.length == 0, "Input invalid: " + JSON.stringify(checkResult));

  const copy = { ... input };
  trimString(copy);

  assert(input.numShuffleHandlersPerWorker > 0);

  const llapIoMemoryInGb = (copy.llapIo === undefined || copy.llapIo.memoryMapped) ? 0 : copy.llapIo.memoryInGb;
  copy.maxWorkerMemoryGb = Math.ceil((copy.workerMemoryInMb + llapIoMemoryInGb * 1024) * copy.numMaxWorkers / 1024);
  copy.maxWorkerCores = Math.ceil(copy.workerCores * copy.numMaxWorkers);

  copy.coresDivisor = 100;
  copy.taskMemoryMb = Math.floor(copy.workerMemoryInMb / copy.numTasksInWorker);
  copy.taskCores = Math.floor(copy.workerCores * 100 / copy.numTasksInWorker);

  copy.memoryMappedPath = "";
  if (copy.llapIoEnabled) {
    assert(copy.llapIo !== undefined);
    if (copy.llapIo.memoryMapped) {
      assert(copy.llapIo.memoryMappedPath !== undefined);
      copy.memoryMappedPath = copy.llapIo.memoryMappedPath;
    }
  }

  copy.useDaemonShuffleHandler = copy.useShuffleHandlerProcess ? 0 : copy.numShuffleHandlersPerWorker;
  copy.shuffleProcessPorts = copy.useShuffleHandlerProcess ? 
    Array.from({length: copy.numShuffleHandlersPerWorker}, (_, i) => consts.mr3.shufflePort + i).join(","):
    "";

  return copy;
}

export function initial(): T {
  return {
    workerMemoryInMb: 0,
    workerCores: 0.0,
    numTasksInWorker: 0,
    numMaxWorkers: 1024,
    llapIoEnabled: false,
    llapIo: {
      memoryInGb: 0,
      memoryMapped: false
    },
    useSoftReference: false,
    tezIoSortMb: 1040,
    tezUnorderedOutputBufferSizeInMb: 307,
    noConditionalTaskSize: 1145044992,
    maxReducers: 1009,
    javaHeapFraction: 0.7,
    numShuffleHandlersPerWorker: 8,
    useShuffleHandlerProcess: true,
    numThreadsPerShuffleHandler: 10,
    enableShuffleSsl: false
  };
}
