# authguidance.websample1

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/authguidance.websample1/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/authguidance.websample1?targetFile=spa/package.json)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/authguidance.websample1/badge.svg?targetFile=api/package.json)](https://snyk.io/test/github/gary-archer/authguidance.websample1?targetFile=api/package.json)

### Overview

* The initial SPA sample, using OAuth 2.x and Open Id Connect, referenced in my blog at https://authguidance.com
* **The goal of this sample is to integrate a Web UI and API with an external Authorization Server**

### Details

* See the [Sample 1 Overview](https://authguidance.com/2017/09/24/basicspa-overview/) for details of behaviour
* See the [Sample 1 Instructions](https://authguidance.com/2017/09/25/basicspa-execution/) for infrastructure setup and how to run the code

### Programming Languages

* TypeScript is used for the SPA
* NodeJS with TypeScript is used for the API

### Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and token handling
* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* Express is used to host both the API and the SPA content
* Okta is used as the Authorization Server
