#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UrlShortenerDevopsStack } from '../lib/url-shortener-devops-stack';

const app = new cdk.App();

new UrlShortenerDevopsStack(app, 'UrlShortenerDevopsStack', {
  env: {
    account: '680829786361',
    region: 'us-east-1',
  },
});
