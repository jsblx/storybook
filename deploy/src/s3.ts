import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as synced_folder from "@pulumi/synced-folder";

import { config } from "../config";
import build from "./build";

export const bucket = new aws.s3.Bucket(config.domainName.replace(/\./g, "-"), {
  bucket: config.domainName,
  acl: "public-read",
  website: {
    indexDocument: "index.html",
    errorDocument: "error.html",
  },
});

build().then(() => {
  console.log("Syncing S3 contents");
  // Use a synced folder to manage the files of the website.
  new synced_folder.S3BucketFolder("bucket-folder", {
    path: config.buildPath,
    bucketName: bucket.bucket,
    acl: "public-read",
  });
});
