# Initial OAuth SPA and API Code Sample

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/607b9a2478bc4e0abbeaacde442e580f)](https://app.codacy.com/gh/gary-archer/oauth.websample1?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.websample1&utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=spa/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=api/package.json)

## Overview

An introductory standards-based SPA and API code sample, to get integrated with OAuth endpoints:

- The SPA uses the traditional OpenID code flow with PKCE.
- The SPA interacts with an API that validates JWTs and uses claims-based authorization.

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional investment resources.

![SPA Views](./images/views.png)

## Local Development Quick Start

First ensure that Node.js 24+ is installed.\
You must use custom development domains and add this DNS entry to your hosts file:

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

* See the [Sample 1 Overview](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/basicspa-overview.mdx) for a summary of behaviour.
* See the [Sample 1 Details](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/basicspa-execution.mdx) for further details on running the code.

## 2021 Security Update

The initial SPA uses OAuth tokens in JavaScript code, to demonstrate a productive SPA architecture.\
In 2021 the best practice is to keep tokens out of the browser, to limit the impact of XSS exploits.\
See the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for a more secure implementation.

## Programming Languages

* The SPA and its views use plain TypeScript code.
* The API uses Node.js and TypeScript.

## Infrastructure

* Express is used as the HTTP server for both the API and the SPA's web static content.
* The SPA uses the [oidc-client-ts](https://github.com/authts/oidc-client-ts) library to implement OpenID Connect.
* The API uses the [jose](https://github.com/panva/jose) library to validate JWT access tokens.
* AWS Cognito is the default authorization server for the SPA and API.
