# Initial OAuth SPA and API Code Sample

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7a56644ad31e4cb5895f732cf07a86ce)](https://www.codacy.com/gh/gary-archer/oauth.websample1/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample1&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=spa/package.json&x=1)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample1/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample1?targetFile=api/package.json&x=1)

## Overview

An introductory SPA and API code sample, useful when first learning OAuth and understanding endpoints:

- The SPA uses the traditional OpenID connect flow, with Authorization Code Flow + PKCE
- The SPA interacts with an API that validates JWTs and uses claims for authorization

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional resources.\
The data is returned from an API that will, in later sample, authorize using domain specific claims.

## Local Development Quick Start

Ensure that Node.js is installed, then run the start script from a macOS terminal or from Git Bash on Windows:

```bash
./start.sh
```

The browser is invoked and you can sign in with my AWS test credentials:

- User: `guestuser@mycompany.com`
- Password: `GuestPassword1`

If preferred, update the settings in these files to point to your own Authorization Server and users:

- spa/spa.config.json
- api/api.config.json

## Details

* See the [Sample 1 Overview](https://authguidance.com/2017/09/24/basicspa-overview/) for a summary of behaviour
* See the [Sample 1 Details](https://authguidance.com/2017/09/25/basicspa-execution/) for further details on running the code

## ![Red icon](https://via.placeholder.com/15/f03c15/f03c15.png) 2021 Security Update

- In 2021 it is instead recommended to keep tokens out of the browser, using a Back End for Front End approach.
- See the [Final SPA Code Sample](https://github.com/gary-archer/oauth.websample.final) for an API driven implementation.

## Programming Languages

* Typescripts is used to build the SPA in the simplest way
* Node.js and TypeScript are used to implement the API

## Infrastructure

* Express is used to host both the API and the SPA content
* AWS Cognito is used as the default Authorization Server
* The [oidc-client](https://github.com/IdentityModel/oidc-client-js) library is used by the SPA to implement OpenID Connect
* The [JOSE](https://github.com/panva/jose) library is used by the API to validate JWT access tokens
