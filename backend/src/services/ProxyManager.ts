import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyConfig, ProxyTestResult } from '../types/proxy';

export class ProxyManager {
    private static instance: ProxyManager;
    private proxies: ProxyConfig[] = [];
    private workingProxies: Set<string> = new Set();
    private currentIndex = 0;
    private lastFetch = 0;
    private fetchInterval = 1000 * 60 * 10;
    private isInitialized = false;
    private maxConcurrentTests = 50;
    private proxyTestTimeout = 2000;
    private maxResponseTime = 5000;
    private useDirectConnection = false;
    private failedProxies = new Set<string>();
    private fastestProxy: ProxyConfig | null = null;
    private lastProxyTest = 0;
    private useProxy = false;

    private constructor() {}

    static getInstance(): ProxyManager {
        if (!ProxyManager.instance) {
            ProxyManager.instance = new ProxyManager();
        }
        return ProxyManager.instance;
    }

    async initialize() {
        if (!this.isInitialized) {
            if (this.useProxy) {
                await this.fetchProxies();
            } else {
                this.useDirectConnection = true;
                console.log('Proxy usage is disabled, using direct connection');
            }
            this.isInitialized = true;
        }
    }

    setUseProxy(value: boolean) {
        this.useProxy = value;
        if (!value) {
            this.useDirectConnection = true;
            console.log('Proxy usage disabled, switching to direct connection');
        }
    }

    private async fetchProxies() {
        try {
            console.log('Fetching proxy list...');
            const response = await axios.get('https://raw.githubusercontent.com/hookzof/socks5_list/refs/heads/master/proxy.txt', {
                timeout: 5000
            });

            const proxyList = response.data
                .split('\n')
                .filter(Boolean)
                .filter((proxy: string) => proxy.includes(':'))
                .map((proxy: string) => proxy.trim());
            
            this.proxies = proxyList.map((proxy: string) => {
                const [host, port] = proxy.split(':');
                return {
                    type: 'socks5',
                    host,
                    port: Number.parseInt(port),
                    url: `socks5://${host}:${port}`
                };
            });

            console.log(`Found ${this.proxies.length} proxies, testing all...`);
            await this.testAllProxies();

        } catch (error) {
            console.error('Error fetching proxies:', error);
            throw error;
        }
    }

    private async testAllProxies() {
        this.workingProxies.clear();
        const startTime = Date.now();
        const chunks = this.chunkArray(this.proxies, this.maxConcurrentTests);
        
        const firstChunk = chunks[0];
        const testResults = await Promise.all(
            firstChunk.map(async proxy => {
                const result = await this.testProxy(proxy);
                if (result.isWorking && result.responseTime && result.responseTime < this.maxResponseTime) {
                    this.workingProxies.add(proxy.url);
                    return {
                        proxy,
                        responseTime: result.responseTime
                    };
                }
                return {
                    proxy,
                    responseTime: Number.POSITIVE_INFINITY
                };
            })
        );

        this.fastestProxy = testResults
            .sort((a, b) => a.responseTime - b.responseTime)
            .find(result => result.responseTime !== Number.POSITIVE_INFINITY)?.proxy || null;
        
        if (this.workingProxies.size === 0) {
            console.log('No working proxies found, switching to direct connection');
            this.useDirectConnection = true;
        } else {
            console.log(`Testing complete. Found ${this.workingProxies.size} working proxies`);
            console.log(`Selected fastest proxy: ${this.fastestProxy?.url}`);
            this.lastFetch = Date.now();
            this.lastProxyTest = Date.now();
        }
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    async testProxy(proxy: ProxyConfig): Promise<ProxyTestResult> {
        const startTime = Date.now();
        try {
            const agent = new SocksProxyAgent(proxy.url);
            await Promise.race([
                axios.get('https://www.google.com', {
                    httpsAgent: agent,
                    timeout: 2000,
                    validateStatus: (status) => status === 200
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 2000)
                )
            ]);

            const responseTime = Date.now() - startTime;
            return {
                proxy,
                isWorking: true,
                responseTime
            };
        } catch {
            return {
                proxy,
                isWorking: false
            };
        }
    }

    async getWorkingProxy(): Promise<ProxyConfig | null> {
        if (!this.useProxy || this.useDirectConnection) {
            return null;
        }

        if (this.fastestProxy && (Date.now() - this.lastProxyTest) < this.fetchInterval) {
            return this.fastestProxy;
        }

        try {
            await this.fetchProxies();
            return this.fastestProxy;
        } catch (error) {
            console.error('Error getting working proxy:', error);
            this.useDirectConnection = true;
            return null;
        }
    }

    isUsingDirectConnection(): boolean {
        return this.useDirectConnection;
    }

    async setDirectConnection(): Promise<void> {
        this.useDirectConnection = true;
        console.log('Switched to direct connection');
    }
} 