# authguidance.websample1

### Overview

* The initial SPA sample, using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* **The goal of this sample is to integrate a Web UI and API with an external Authorization Server**

### Details

* See the [Sample 1 Overview](https://authguidance.com/2017/09/24/basicspa-overview/) for details of how the integration works
* See the [Sample 1 Instructions](https://authguidance.com/2017/09/25/basicspa-execution/) for infra setup and how to run the code

### Programming Languages

* TypeScript is used for the SPA
* NodeJS with TypeScript is used for the API

### Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and token handling
* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* Express is used to host both the API and the SPA content
* Okta is used for the Authorization Server
