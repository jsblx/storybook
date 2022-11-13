import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { config } from "../config";

const eastRegion = new aws.Provider("east", {
  profile: aws.config.profile,
  region: "us-east-1", // AWS Certificate needs to be in us-east-1
});

const certificate = new aws.acm.Certificate(
  "certificate",
  {
    domainName: config.domainName,
    validationMethod: "DNS",
  },
  { provider: eastRegion }
);

const hostedZoneId = aws.route53
  .getZone({ name: config.domain }, { async: true })
  .then(zone => zone.zoneId);

const certificateValidationDomain = new aws.route53.Record(
  `${config.domainName}-validation`,
  {
    name: certificate.domainValidationOptions[0].resourceRecordName,
    zoneId: hostedZoneId,
    type: certificate.domainValidationOptions[0].resourceRecordType,
    records: [certificate.domainValidationOptions[0].resourceRecordValue],
    ttl: 60 * 10,
  }
);

const certificateValidation = new aws.acm.CertificateValidation(
  "certificateValidation",
  {
    certificateArn: certificate.arn,
    validationRecordFqdns: [certificateValidationDomain.fqdn],
  },
  { provider: eastRegion }
);

export const certificateArn = certificateValidation.certificateArn;
