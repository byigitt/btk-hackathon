import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import { ProxyManager } from './ProxyManager';
import { GoogleSearchResult } from '../types/search';
import { ProxyConfig } from '../types/proxy';
import { SELECTORS, URLS } from '../utils/constants';

export class GoogleSearch {
    private browser: Browser | null = null;
    private pages: Page[] = [];
    private busyPages = new Set<Page>();
    private maxPages = Number.parseInt(process.env.PUPPETEER_MAX_PAGES || '3', 10);
    private proxyManager: ProxyManager;
    private isInitialized = false;
    private lastWorkingProxy: ProxyConfig | null = null;
    private readonly pageTimeout = 10000; // Reduced to 10 seconds
    private readonly navigationTimeout = 15000; // Reduced to 15 seconds

    constructor() {
        this.proxyManager = ProxyManager.getInstance();
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            const proxy = await this.proxyManager.getWorkingProxy();
            const args = [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
                '--disable-extensions',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-component-extensions-with-background-pages',
                '--disable-features=TranslateUI,BlinkGenPropertyTrees',
                '--disable-ipc-flooding-protection',
                '--disable-renderer-backgrounding',
                '--enable-features=NetworkService,NetworkServiceInProcess',
                '--force-color-profile=srgb',
                '--metrics-recording-only',
                '--mute-audio',
                '--no-default-browser-check',
            ];

            if (proxy) {
                args.push(`--proxy-server=${proxy.url}`);
            }

            this.browser = await puppeteer.launch({
                headless: 'new',
                args,
                ignoreHTTPSErrors: true,
                timeout: 30000
            });

            for (let i = 0; i < this.maxPages; i++) {
                const page = await this.browser.newPage();
                await this.initializePage(page);
                this.pages.push(page);
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize browser:', error);
            await this.cleanup();
            throw error;
        }
    }

    private async getFastestProxy(): Promise<ProxyConfig> {
        const workingProxies = await Promise.all(
            Array.from({ length: 5 }, () => this.proxyManager.getWorkingProxy())
        );

        const proxyTests = await Promise.all(
            workingProxies.map(async (proxy) => {
                if (!proxy) return {
                    proxy: null,
                    responseTime: Number.POSITIVE_INFINITY
                };
                const result = await this.proxyManager.testProxy(proxy);
                return {
                    proxy,
                    responseTime: result.responseTime || Number.POSITIVE_INFINITY
                };
            })
        );

        const fastestProxy = proxyTests.sort((a, b) => 
            (a.responseTime || Number.POSITIVE_INFINITY) - (b.responseTime || Number.POSITIVE_INFINITY)
        )[0].proxy || null;

        if (!fastestProxy) {
            throw new Error('No working proxy found');
        }

        console.log(`Selected fastest proxy: ${fastestProxy.url}`);
        return fastestProxy;
    }

    private async initializePage(page: Page) {
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
            });

            await page.setJavaScriptEnabled(true);
            await page.setRequestInterception(true);
            
            page.on('request', (request) => {
                try {
                    const resourceType = request.resourceType();
                    const url = request.url();
                    
                    // Allow images for image and video searches
                    if (url.includes('tbm=isch') || url.includes('tbm=vid')) {
                        if (['stylesheet', 'font', 'media'].includes(resourceType)) {
                            request.abort();
                        } else {
                            request.continue();
                        }
                    } else {
                        // For regular searches, block more resource types
                        if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
                            request.abort();
                        } else {
                            request.continue();
                        }
                    }
                } catch {
                    request.continue();
                }
            });

            await page.setCacheEnabled(false);
            await page.setDefaultNavigationTimeout(this.navigationTimeout);
            await page.setDefaultTimeout(this.pageTimeout);

            page.on('error', error => {
                console.error('Page error:', error);
            });

            page.on('pageerror', error => {
                console.error('Page error:', error);
            });

        } catch (error) {
            console.error('Error initializing page:', error);
            throw error;
        }
    }

    async search(query: string): Promise<GoogleSearchResult[]> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const page: Page | null = null;
        let retries = 2;

        while (retries > 0) {
            try {
                const pages = await Promise.all([
                    this.acquirePage(),
                    this.acquirePage()
                ]);

                const [regularResults, videoResults] = await Promise.all([
                    this.getRegularResults(pages[0], query).catch(error => {
                        console.log('Regular search error:', error.message);
                        return [];
                    }),

                    this.getVideoResults(pages[1], query).catch(error => {
                        console.log('Video search error:', error.message);
                        return [];
                    })
                ]);

                for (const page of pages) {
                    this.releasePage(page);
                }

                return [
                    ...regularResults,
                    ...videoResults
                ];

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Search attempt ${2 - retries + 1} failed: ${errorMessage}`);
                retries--;
                
                if (retries === 0) {
                    console.error('All search attempts failed');
                    return [];
                }

                try {
                    const newProxy = await this.getFastestProxy();
                    await this.reinitializeWithProxy(newProxy);
                } catch {
                    console.log('Failed to get new proxy, using direct connection');
                    await this.proxyManager.setDirectConnection();
                    await this.reinitializeWithProxy(null);
                }
            } finally {
                if (page) {
                    this.releasePage(page);
                }
            }
        }

        return [];
    }

    private async getRegularResults(page: Page, query: string): Promise<GoogleSearchResult[]> {
        try {
            console.log('Starting regular search for query:', query);
            
            await page.goto(
                `${URLS.W_GOOGLE}search?q=${encodeURIComponent(query)}&hl=en&num=10`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: this.navigationTimeout
                }
            );
            console.log('Successfully navigated to search page');

            await page.waitForSelector('#rso', { timeout: this.pageTimeout });
            console.log('Found search results container');

            const results = await page.evaluate((SELECTORS) => {
                console.log('Starting evaluation of search results');
                const searchResults = [];
                
                // Get all result containers
                const resultContainers = document.querySelectorAll('#rso > div');
                console.log('Found result containers:', resultContainers.length);

                for (const container of resultContainers) {
                    try {
                        const titleEl = container.querySelector(SELECTORS.TITLE);
                        const descEl = container.querySelector(SELECTORS.DESCRIPTION);
                        const linkEl = container.querySelector(SELECTORS.URL);
                        
                        // Check if it's an ad
                        const isAd = container.querySelector('[data-text-ad]') !== null || 
                                    container.querySelector('[data-rw]') !== null;

                        if (titleEl && linkEl) {
                            const url = linkEl.getAttribute('href') || '';
                            
                            // Skip internal Google searches and empty URLs
                            if (!url || url.includes('/search?')) continue;

                            try {
                                const hostname = new URL(url.startsWith('/url?') ? url.split('?q=')[1] : url).hostname;
                                const result = {
                                    type: 'organic',
                                    title: titleEl.textContent?.trim() || '',
                                    description: descEl?.textContent?.trim() || '',
                                    url: url.startsWith('/url?') ? url.split('?q=')[1] : url,
                                    is_sponsored: isAd,
                                    favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${hostname}`
                                };

                                searchResults.push(result);
                                console.log('Processed result:', result.title);

                                if (searchResults.length >= 5) break;
                            } catch (error) {
                                console.error('Error processing URL:', error);
                            }
                        }
                    } catch (error) {
                        console.error('Error processing result:', error);
                    }
                }
                return searchResults;
            }, SELECTORS);

            console.log(`Regular search completed. Found ${results.length} results`);
            return results as GoogleSearchResult[];

        } catch (error) {
            console.error('Regular search failed:', error);
            await page.screenshot({ path: 'debug-regular-search-error.png' });
            return [];
        }
    }

    private async reinitializeWithProxy(proxy: ProxyConfig | null) {
        await this.cleanup();
        this.isInitialized = false;
        this.lastWorkingProxy = proxy;
        await this.initialize();
    }

    private async acquirePage(): Promise<Page> {
        const page = this.pages.find(p => !this.busyPages.has(p));
        if (!page) throw new Error('No pages available');
        
        this.busyPages.add(page);
        return page;
    }

    private releasePage(page: Page) {
        this.busyPages.delete(page);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.pages = [];
            this.busyPages.clear();
        }
    }

    private async getVideoResults(page: Page, query: string): Promise<GoogleSearchResult[]> {
        try {
            console.log('Starting video search for query:', query);
            
            await page.goto(
                `${URLS.W_GOOGLE}search?q=${encodeURIComponent(query)}&tbm=vid&hl=en&num=5`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: this.navigationTimeout
                }
            );
            console.log('Successfully navigated to video search page');

            await page.waitForSelector('#rso', { timeout: this.pageTimeout });
            console.log('Found video results container');

            const results = await page.evaluate((SELECTORS) => {
                console.log('Starting evaluation of video results');
                const results = [];

                // Get all video containers
                const videoContainers = document.querySelectorAll('#rso > div');
                console.log('Found video containers:', videoContainers.length);

                for (const container of videoContainers) {
                    try {
                        const titleEl = container.querySelector(SELECTORS.VIDEO_TITLE);
                        const descEl = container.querySelector(SELECTORS.VIDEO_DESCRIPTION);
                        const linkEl = container.querySelector(SELECTORS.VIDEO_URL);
                        const thumbnailEl = container.querySelector(SELECTORS.VIDEO_THUMBNAIL);
                        const durationEl = container.querySelector(SELECTORS.VIDEO_DURATION);

                        if (titleEl && linkEl) {
                            const url = linkEl.getAttribute('href') || '';
                            
                            // Skip non-video results
                            if (!url || !url.includes('watch?v=')) continue;

                            const result = {
                                type: 'video',
                                title: titleEl.textContent?.trim() || '',
                                description: descEl?.textContent?.trim() || '',
                                url: url,
                                is_sponsored: false,
                                thumbnail: thumbnailEl?.getAttribute('src') || '',
                                videoInfo: {
                                    platform: url.includes('youtube.com') ? 'YouTube' : 'Other',
                                    thumbnail: thumbnailEl?.getAttribute('src') || '',
                                    duration: durationEl?.textContent?.trim() || ''
                                }
                            };

                            results.push(result);
                            console.log('Processed video result:', result.title);

                            if (results.length >= 2) break;
                        }
                    } catch (error) {
                        console.error('Error processing video result:', error);
                    }
                }
                return results;
            }, SELECTORS);

            console.log(`Video search completed. Found ${results.length} results`);
            return results as GoogleSearchResult[];

        } catch (error) {
            console.error('Video search failed:', error);
            await page.screenshot({ path: 'debug-video-search-error.png' });
            return [];
        }
    }
} 