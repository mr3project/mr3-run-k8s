export interface T {
  s3: { [key: string]: string | boolean | number };
  hdfs: { [key: string]: string | boolean | number };
  metastore: { [key: string]: string | boolean | number };
  hive: { [key: string]: string | boolean | number };
  mr3: { [key: string]: string | boolean | number };
  tez: { [key: string]: string | boolean | number };
  copy: { [key: string]: string };
}