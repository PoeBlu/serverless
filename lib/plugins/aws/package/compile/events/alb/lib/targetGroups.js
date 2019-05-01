'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

module.exports = {
  compileTargetGroups() {
    this.validated.events.forEach((event) => {
      const targetGroupLogicalId = this.provider.naming
        .getTargetGroupLogicalId(event.name);
      const lambdaPermissionLogicalId = this.provider.naming
        .getAlbPermissionLogicalId(event.functionName);

      _.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
        [targetGroupLogicalId]: {
          Type: 'AWS::AWS::ElasticLoadBalancingV2::TargetGroup',
          Properties: {
            TargetType: 'lambda',
            Targets: [
              {
                Id: {
                  'Fn::GetAtt': [
                    event.functionName, 'Arn',
                  ],
                },
              },
            ],
          },
          DependsOn: [lambdaPermissionLogicalId],
        },
      });
    });

    return BbPromise.resolve();
  },
};
