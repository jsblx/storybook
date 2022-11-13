import { Config, getStack } from "@pulumi/pulumi";

const awsConfig = new Config("aws");
const stackConfig = new Config("static-website");
const subdomain = stackConfig.require("subdomain");
const domain = stackConfig.require("domain");

export const config = {
  region: awsConfig.require("region"),
  buildPath: stackConfig.require("buildPath"),
  sourcePath: stackConfig.require("sourcePath"),
  subdomain,
  domain,
  domainName: subdomain ? `${subdomain}.${domain}` : domain,
  stack: getStack(),
};
