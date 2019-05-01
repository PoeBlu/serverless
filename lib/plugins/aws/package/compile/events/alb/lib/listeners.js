'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

module.exports = {
  compileListeners() {
    this.validated.events.forEach((event, idx) => {
      const targetGroupLogicalId = this.provider.naming
        .getTargetGroupLogicalId(event.name);
      const listenerLogicalId = this.provider.naming
        .getListenerLogicalId(event.functionName, idx);

      const listener = event.listener;
      const Protocol = listener.split(':')[0].toUpperCase();
      const Port = listener.split(':')[1];
      let Certificates = [];
      if (event.certificateArn) {
        Certificates = [
          {
            CertificateArn: event.certificateArn,
          },
        ];
      }

      _.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, {
        [listenerLogicalId]: {
          Type: 'AWS::ElasticLoadBalancingV2::Listener',
          Properties: {
            DefaultActions: [
              {
                TargetGroupArn: {
                  Ref: targetGroupLogicalId,
                },
                Type: 'forward',
              },
            ],
            LoadBalancerArn: event.loadBalancerArn,
            Certificates,
            Protocol,
            Port,
          },
        },
      });
    });

    return BbPromise.resolve();
  },
};
