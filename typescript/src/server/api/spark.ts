export interface T {
  driverNameStr: string;
  serviceAccountAnnotations?: { key: string; value: string; };  // e.g., eks.amazonaws.com/role-arn: arn:aws:iam::111111111111:role/NEW_IAM_ROLE_NAME
  //
  // set in validate()
  //
  driverNames?: string[];
  uiProxyPassRules?: string;
}
