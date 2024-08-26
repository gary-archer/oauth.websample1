# Initial OAuth SPA and API Code Sample

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/607b9a2478bc4e0abbeaacde442e580f)](https://app.codacy.com/gh/gary-archer/oauth.websample1?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.websample1&utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=spa/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=api/package.json)

## Overview

An introductory standards based SPA and API code sample, useful when first learning about OAuth endpoints:

- The SPA uses the traditional OpenID connect flow, with Authorization Code Flow + PKCE
- The SPA interacts with an API that validates JWTs and uses claims for authorization

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional resources.\
The data is returned from an API that will, in later samples, authorize using claims from multiple sources.

![SPA Views](./images/views.png)

## Local Development Quick Start

First ensure that Node.js 20+ is installed.\
A custom development domain is used for the API so add the DNS entry to your hosts file:

```bash
127.0.0.1 localhost api.authsamples-dev.com
```

Ensure that Node.js is installed, then run the start script:

```bash
./start.sh
```

The browser is invoked and you can sign in with my AWS test credentials:

- User: `guestuser@example.com`
- Password: `GuestPassword1`

## Further Information

* See the [Sample 1 Overview](https://apisandclients.com/posts/basicspa-overview) for a summary of behaviour
* See the [Sample 1 Details](https://apisandclients.com/posts/basicspa-execution) for further details on running the code

## 2021 Security Update

- In 2021 it is instead recommended to keep tokens out of the browser, using a Backend for Frontend
- See the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for an API driven implementation

## Programming Languages

* Plain TypeScript is used for the SPA, to explain OAuth behaviour in the simplest way
* Node.js and TypeScript are used to implement the API

## Infrastructure

* Express is used to host both the API and the SPA content
* AWS Cognito is used as the default Authorization Server
* The [oidc-client-ts](https://github.com/authts/oidc-client-ts) library is used by the SPA to implement OpenID Connect
* The [jose](https://github.com/panva/jose) library is used by the API to validate JWT access tokens
