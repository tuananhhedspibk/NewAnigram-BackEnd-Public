# NewAnigram-BackEnd-Public

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![by: Vietnamese](https://raw.githubusercontent.com/webuild-community/badge/master/svg/by.svg)](https://webuild.community/)

## Introduction

Backend repository for website [newanigram.net](https://newanigram.net). This is just a lite version of Instagram, made by me in free time.

## TechStack

### ServerCode

- expressJS: https://expressjs.com/
- GraphQL: https://graphql.org/

### UnitTest

- Jest: https://jestjs.io/en/

### Infra

- AWS: ECS, ECR, EC2, VPC, Route53, CloudFront, Application/ Network Load Balancer, CodeDeploy

<img src="https://user-images.githubusercontent.com/15076665/96224267-4035a500-0fca-11eb-97af-fb46efe87f9b.png" width="720">

## How to run

**1. Complete AWS settings**

Firstly, you need to complete your AWS credentials in these two files

- [src/utils/constants.ts](https://github.com/tuananhhedspibk/NewAnigram-BackEnd-Public/blob/master/src/utils/constants.ts#L6) (for developing)
- [.github/workflows/aws.yml](https://github.com/tuananhhedspibk/NewAnigram-BackEnd-Public/blob/master/.github/workflows/aws.yml) (for deploying service to ECS - in here, you need to fill in the ECS, ECR related information)

**2. Install packages**

> $npm run install (dependencies and devDependencies)

> $npm run install --onyl=prod (depedencies only)

**3. Build and Run App**

**3.1 Build App**

> $npm run build

**3.2. Run App**

- In one command way:

> $npm run start:dev

- In two commands way:

> $npm run build
> $npm run start

Server will run at address: [localhost:3000](#)

**4. Run Unit Test**

> npm run test

Made with :hearts: ・ :tea: ・ :rice:
