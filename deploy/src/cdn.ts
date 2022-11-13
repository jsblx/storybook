import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { config } from "../config";
import { certificateArn } from "./acm";
import { bucket } from "./s3";

// Create a CloudFront CDN to distribute and cache the website.
const cdn = new aws.cloudfront.Distribution("cdn", {
  aliases: [config.domainName],
  enabled: true,
  origins: [
    {
      originId: bucket.arn,
      domainName: bucket.websiteEndpoint,
      customOriginConfig: {
        originProtocolPolicy: "http-only",
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ["TLSv1.2"],
      },
    },
  ],
  defaultRootObject: "index.html",
  defaultCacheBehavior: {
    targetOriginId: bucket.arn,
    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD", "OPTIONS"],
    defaultTtl: 60 * 10,
    maxTtl: 60 * 10,
    minTtl: 0,
    forwardedValues: {
      queryString: false,
      cookies: {
        forward: "none",
      },
    },
  },
  isIpv6Enabled: true,
  priceClass: "PriceClass_100",
  // customErrorResponses: [{
  //     errorCode: 404,
  //     responseCode: 404,
  //     responsePagePath: `/${errorDocument}`,
  // }],
  restrictions: {
    geoRestriction: {
      restrictionType: "none",
    },
  },
  viewerCertificate: {
    acmCertificateArn: certificateArn,
    sslSupportMethod: "sni-only",
    minimumProtocolVersion: "TLSv1.2_2021",
  },
});

const createAliasRecord = (
  targetDomain: string,
  distribution: aws.cloudfront.Distribution
): aws.route53.Record => {
  const hostedZoneId = aws.route53
    .getZone({ name: config.domain }, { async: true })
    .then(zone => zone.zoneId);
  return new aws.route53.Record(targetDomain, {
    name: config.subdomain,
    zoneId: hostedZoneId,
    type: "A",
    aliases: [
      {
        name: distribution.domainName,
        zoneId: distribution.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });
};

const aRecord = createAliasRecord(config.domainName, cdn);

export { cdn };
