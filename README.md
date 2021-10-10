# Initial OAuth SPA and API Code Sample

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7a56644ad31e4cb5895f732cf07a86ce)](https://www.codacy.com/gh/gary-archer/oauth.websample1/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample1&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=spa/package.json&x=1)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=api/package.json&x=1)

## Overview

* **This sample integrates a Web UI and API with an external Authorization Server** 

## Quick Start

Ensure that Node.js is installed, then execute the following script to use a Cloud Authorization Server:

```bash
start.sh
```

Then sign in with the test user `standarduser@mycompany.com` and password `Password1`.

## Details

* See the [Sample 1 Overview](https://authguidance.com/2017/09/24/basicspa-overview/) for a summary of behaviour
* See the [Sample 1 Details](https://authguidance.com/2017/09/25/basicspa-execution/) for further details on running the code

## Programming Languages

* The SPA is coded in plain TypeScript
* Node.js with TypeScript is used for the API

## Middleware Used

* Express is used to host both the API and the SPA content
* AWS Cognito is used as the default Authorization Server
* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used by the SPA to implement OpenID Connect
* The [JOSE Library](https://github.com/panva/jose) is used by the API to validate JWT access tokens
