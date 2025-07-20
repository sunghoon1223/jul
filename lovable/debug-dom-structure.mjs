import { chromium } from 'playwright';
import fs from 'fs/promises';

async function debugDOMStructure() {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    const results = {
        timestamp: new Date().toISOString(),
        url: 'https://studio-sb.com',
        consoleLogs: [],
        errors: [],
        domAnalysis: {}
    };

    // Collect console messages
    page.on('console', msg => {
        results.consoleLogs.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    page.on('pageerror', error => {
        results.errors.push({
            message: error.message,
            stack: error.stack
        });
    });

    try {
        console.log('Loading page...');
        await page.goto('https://studio-sb.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for React to render
        await page.waitForTimeout(5000);
        
        // Take screenshot of current state
        await page.screenshot({ path: 'dom-debug-initial.png', fullPage: true });
        
        console.log('Analyzing DOM structure...');
        
        // Get page title and basic info
        results.domAnalysis.pageInfo = {
            title: await page.title(),
            url: page.url(),
            readyState: await page.evaluate(() => document.readyState)
        };
        
        // Look for main content containers
        const mainContainers = await page.evaluate(() => {
            const containers = [];
            const selectors = [
                'main', '[role="main"]', '#root', '#app', '.app', '.main-content',
                '.container', '.content', '.page', '.layout'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    containers.push({
                        selector,
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        childrenCount: el.children.length,
                        hasText: el.textContent.trim().length > 0
                    });
                });
            });
            
            return containers;
        });
        
        results.domAnalysis.mainContainers = mainContainers;
        
        // Look for product-related elements
        const productElements = await page.evaluate(() => {
            const products = [];
            const selectors = [
                '[class*="product"]', '[data-testid*="product"]', '[id*="product"]',
                '.card', '.item', '.grid-item', 'article',
                '[class*="caster"]', '[class*="catalog"]'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el, index) => {
                    if (index < 5) { // Limit to first 5 elements
                        products.push({
                            selector,
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            innerHTML: el.innerHTML.substring(0, 200) + '...',
                            textContent: el.textContent.substring(0, 100) + '...',
                            hasButtons: el.querySelectorAll('button').length > 0,
                            buttonTexts: Array.from(el.querySelectorAll('button')).map(btn => btn.textContent.trim())
                        });
                    }
                });
            });
            
            return products;
        });
        
        results.domAnalysis.productElements = productElements;
        
        // Look for cart-related elements
        const cartElements = await page.evaluate(() => {
            const carts = [];
            const selectors = [
                '[class*="cart"]', '[data-testid*="cart"]', '[id*="cart"]',
                'button:has-text("장바구니")', 'button:has-text("Cart")',
                '.shopping-cart', '.basket'
            ];
            
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        if (index < 3) { // Limit to first 3 elements
                            carts.push({
                                selector,
                                tagName: el.tagName,
                                className: el.className,
                                id: el.id,
                                textContent: el.textContent.trim(),
                                isVisible: !el.hidden && el.offsetParent !== null,
                                outerHTML: el.outerHTML.substring(0, 300) + '...'
                            });
                        }
                    });
                } catch (e) {
                    // Skip selectors that cause errors
                }
            });
            
            return carts;
        });
        
        results.domAnalysis.cartElements = cartElements;
        
        // Look for buttons
        const buttons = await page.evaluate(() => {
            const allButtons = document.querySelectorAll('button');
            return Array.from(allButtons).slice(0, 10).map(btn => ({
                text: btn.textContent.trim(),
                className: btn.className,
                id: btn.id,
                type: btn.type,
                disabled: btn.disabled,
                isVisible: !btn.hidden && btn.offsetParent !== null
            }));
        });
        
        results.domAnalysis.buttons = buttons;
        
        // Check for React components
        const reactInfo = await page.evaluate(() => {
            try {
                // Look for React root
                const rootElement = document.querySelector('#root, #app, [data-reactroot]');
                if (rootElement) {
                    const reactKey = Object.keys(rootElement).find(key => key.startsWith('__reactFiber'));
                    return {
                        hasReactRoot: true,
                        reactKey,
                        componentName: rootElement[reactKey]?.type?.name || 'Unknown'
                    };
                }
                
                // Check for React in window
                return {
                    hasReactRoot: false,
                    windowReact: typeof window.React !== 'undefined',
                    reactDevtools: window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        results.domAnalysis.reactInfo = reactInfo;
        
        // Check localStorage for cart data
        const storageInfo = await page.evaluate(() => {
            try {
                const keys = Object.keys(localStorage);
                const storage = {};
                keys.forEach(key => {
                    storage[key] = localStorage.getItem(key);
                });
                return storage;
            } catch (e) {
                return { error: e.message };
            }
        });
        
        results.domAnalysis.localStorage = storageInfo;
        
        // Get page source sample
        const pageSource = await page.content();
        results.domAnalysis.pageSourceSample = pageSource.substring(0, 2000) + '...';
        
        // Check for specific elements by scrolling
        console.log('Scrolling to look for more content...');
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(2000);
        
        // Take screenshot after scroll
        await page.screenshot({ path: 'dom-debug-after-scroll.png', fullPage: true });
        
        // Check for any new elements after scroll
        const elementsAfterScroll = await page.evaluate(() => {
            return {
                totalElements: document.querySelectorAll('*').length,
                buttons: document.querySelectorAll('button').length,
                productLike: document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"]').length,
                cartLike: document.querySelectorAll('[class*="cart"]').length
            };
        });
        
        results.domAnalysis.elementsAfterScroll = elementsAfterScroll;
        
    } catch (error) {
        results.mainError = {
            message: error.message,
            stack: error.stack
        };
    } finally {
        // Save results
        await fs.writeFile('dom-debug-results.json', JSON.stringify(results, null, 2));
        console.log('\nDOM debug results saved to dom-debug-results.json');
        
        // Print summary
        console.log('\n=== DOM Analysis Summary ===');
        console.log(`Page title: ${results.domAnalysis.pageInfo?.title || 'Unknown'}`);
        console.log(`Main containers found: ${results.domAnalysis.mainContainers?.length || 0}`);
        console.log(`Product elements found: ${results.domAnalysis.productElements?.length || 0}`);
        console.log(`Cart elements found: ${results.domAnalysis.cartElements?.length || 0}`);
        console.log(`Buttons found: ${results.domAnalysis.buttons?.length || 0}`);
        console.log(`Console errors: ${results.errors.length}`);
        console.log(`Has React: ${results.domAnalysis.reactInfo?.hasReactRoot || false}`);
        
        if (results.domAnalysis.buttons?.length > 0) {
            console.log('\nButton texts found:');
            results.domAnalysis.buttons.forEach(btn => {
                if (btn.text) console.log(`- "${btn.text}"`);
            });
        }
        
        await browser.close();
    }
}

debugDOMStructure().catch(console.error);