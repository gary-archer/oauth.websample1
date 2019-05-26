# authguidance.websample2

### Overview

* The second SPA sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* **The goals of this sample are to implement navigation in our SPA and our [API Authorization Design](https://authguidance.com/2017/10/03/api-tokens-claims/)**

### Details

* See the [Sample 2 Write Up](http://authguidance.com/2017/10/13/improved-spa-code-sample-overview/) for an overview and how to run the code

### Programming Languages

* TypeScript is used for the SPA
* NodeJS with TypeScript is used for the API

### Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement the Implicit Flow
* The [OpenId-Client Library](https://github.com/panva/node-openid-client) is used to handle API token validation
* The [Node Cache](https://github.com/mpneuried/nodecache) is used to cache API claims keyed against tokens
* Express is used to host both the API and the SPA content
* Okta is used for the Authorization Server

