import * as TunnelAgent from 'tunnel-agent';
import * as Url from 'url';

/*
 * Some HTTP libraries require an agent to be expressed in order to see traffic in Fiddler or Charles
 * So derive the agent from the HTTPS_PROXY environment variable
 */
export class DebugProxyAgent {

    /*
     * Create the agent if there is a proxy environment variable
     */
    public static initialize(): void {
        if (process.env.HTTPS_PROXY) {
            const opts = Url.parse(process.env.HTTPS_PROXY as any);
            DebugProxyAgent._agent = TunnelAgent.httpsOverHttp({
                proxy: opts,
            });
        }
    }

    /*
     * Return the configured agent
     */
    public static get(): any {
        return DebugProxyAgent._agent;
    }

    /*
     * Return true if debugging
     */
    public static isDebuggingActive(): any {
        return DebugProxyAgent._agent !== null;
    }

    // The global agent instance
    private static _agent: any;
}
