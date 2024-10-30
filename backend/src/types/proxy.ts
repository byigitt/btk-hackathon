export interface ProxyConfig {
    type: 'socks5' | 'socks4' | 'http';
    host: string;
    port: number;
    url: string;
}

export interface ProxyTestResult {
    proxy: ProxyConfig;
    isWorking: boolean;
    responseTime?: number;
} 