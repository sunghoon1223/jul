import { chromium } from 'playwright';
import fs from 'fs/promises';

async function testCartFunctionality() {
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
        tests: {},
        errors: [],
        consoleLogs: [],
        networkFailures: []
    };

    // Collect console messages
    page.on('console', msg => {
        results.consoleLogs.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // Collect page errors
    page.on('pageerror', error => {
        results.errors.push({
            message: error.message,
            stack: error.stack
        });
    });

    // Monitor network failures
    page.on('requestfailed', request => {
        results.networkFailures.push({
            url: request.url(),
            failure: request.failure(),
            method: request.method()
        });
    });

    try {
        console.log('1. Testing basic page loading...');
        results.tests.pageLoading = { status: 'started' };
        
        await page.goto('https://studio-sb.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        results.tests.pageLoading = { 
            status: 'success',
            title: await page.title(),
            url: page.url()
        };
        
        // Wait for initial rendering
        await page.waitForTimeout(3000);
        
        // Check for JavaScript errors
        const jsErrors = await page.evaluate(() => {
            return window.jsErrors || [];
        });
        
        console.log('2. Testing cart functionality...');
        results.tests.cartFunctionality = { status: 'started' };
        
        // Find product cards
        const productCards = await page.locator('[data-testid="product-card"], .product-card, article').all();
        console.log(`Found ${productCards.length} product cards`);
        
        if (productCards.length === 0) {
            // Try alternative selectors
            const alternativeCards = await page.locator('div:has(button:has-text("장바구니")), div:has(button:has-text("Add to Cart"))').all();
            console.log(`Found ${alternativeCards.length} products with cart buttons`);
            
            if (alternativeCards.length > 0) {
                productCards.push(...alternativeCards);
            }
        }
        
        // Check localStorage before adding to cart
        const localStorageBefore = await page.evaluate(() => {
            try {
                return {
                    cart: localStorage.getItem('cart'),
                    cartItems: localStorage.getItem('cartItems'),
                    allKeys: Object.keys(localStorage)
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        
        results.tests.localStorageBefore = localStorageBefore;
        
        // Get initial cart count
        const cartIconSelector = '[data-testid="cart-icon"], .cart-icon, button:has-text("Cart"), a[href*="cart"]';
        const cartIcon = await page.locator(cartIconSelector).first();
        
        let initialCartCount = 0;
        if (await cartIcon.isVisible()) {
            const cartCountElement = await page.locator('[data-testid="cart-count"], .cart-count, .badge').first();
            if (await cartCountElement.isVisible()) {
                initialCartCount = parseInt(await cartCountElement.textContent() || '0');
            }
        }
        
        console.log(`Initial cart count: ${initialCartCount}`);
        
        // Try to add a product to cart
        if (productCards.length > 0) {
            const firstProduct = productCards[0];
            
            // Get product info
            const productInfo = await firstProduct.evaluate(el => {
                const nameEl = el.querySelector('h3, h4, .product-name, [class*="title"]');
                const priceEl = el.querySelector('.price, [class*="price"]');
                const buttonEl = el.querySelector('button:has-text("장바구니"), button:has-text("Add to Cart"), button[class*="cart"]');
                
                return {
                    name: nameEl?.textContent || 'Unknown',
                    price: priceEl?.textContent || 'Unknown',
                    hasButton: !!buttonEl,
                    buttonText: buttonEl?.textContent || 'N/A'
                };
            });
            
            results.tests.productInfo = productInfo;
            console.log('Product info:', productInfo);
            
            // Try to click add to cart button
            const addToCartButton = firstProduct.locator('button:has-text("장바구니"), button:has-text("Add to Cart"), button[class*="cart"]').first();
            
            if (await addToCartButton.isVisible()) {
                console.log('Clicking add to cart button...');
                
                // Intercept any API calls
                const apiCallPromise = page.waitForResponse(response => 
                    response.url().includes('/api/') || 
                    response.url().includes('cart') ||
                    response.url().includes('supabase'),
                    { timeout: 5000 }
                ).catch(() => null);
                
                await addToCartButton.click();
                
                // Wait for any API response
                const apiResponse = await apiCallPromise;
                if (apiResponse) {
                    results.tests.apiCall = {
                        url: apiResponse.url(),
                        status: apiResponse.status(),
                        ok: apiResponse.ok()
                    };
                }
                
                // Wait for potential state update
                await page.waitForTimeout(2000);
                
                // Check cart count after click
                const newCartCount = await page.locator('[data-testid="cart-count"], .cart-count, .badge').first().textContent().catch(() => '0');
                results.tests.cartCountAfterAdd = {
                    before: initialCartCount,
                    after: parseInt(newCartCount || '0')
                };
                
                // Check localStorage after adding to cart
                const localStorageAfter = await page.evaluate(() => {
                    try {
                        return {
                            cart: localStorage.getItem('cart'),
                            cartItems: localStorage.getItem('cartItems'),
                            allKeys: Object.keys(localStorage)
                        };
                    } catch (e) {
                        return { error: e.message };
                    }
                });
                
                results.tests.localStorageAfter = localStorageAfter;
                
                // Try to open cart drawer
                console.log('3. Testing cart drawer...');
                const cartButton = await page.locator(cartIconSelector).first();
                
                if (await cartButton.isVisible()) {
                    await cartButton.click();
                    await page.waitForTimeout(1000);
                    
                    // Check if drawer opened
                    const drawer = await page.locator('[data-testid="cart-drawer"], .cart-drawer, [class*="drawer"]').first();
                    results.tests.cartDrawer = {
                        isVisible: await drawer.isVisible(),
                        content: await drawer.textContent().catch(() => 'Could not get content')
                    };
                    
                    // Take screenshot of drawer state
                    await page.screenshot({ path: 'cart-drawer-state.png', fullPage: false });
                }
            } else {
                results.tests.cartFunctionality = { 
                    status: 'failed', 
                    reason: 'Add to cart button not found or not visible' 
                };
            }
        } else {
            results.tests.cartFunctionality = { 
                status: 'failed', 
                reason: 'No product cards found on page' 
            };
        }
        
        // Check React component state
        const reactState = await page.evaluate(() => {
            try {
                // Try to find React fiber
                const findReactFiber = (element) => {
                    const key = Object.keys(element).find(key => key.startsWith('__reactFiber'));
                    return element[key];
                };
                
                // Find cart-related components
                const cartElements = document.querySelectorAll('[class*="cart"]');
                const states = [];
                
                cartElements.forEach(el => {
                    const fiber = findReactFiber(el);
                    if (fiber && fiber.memoizedState) {
                        states.push({
                            element: el.className,
                            state: fiber.memoizedState
                        });
                    }
                });
                
                return states;
            } catch (e) {
                return { error: e.message };
            }
        });
        
        results.tests.reactState = reactState;
        
        // Check for any cart-related errors in console
        const cartErrors = results.consoleLogs.filter(log => 
            log.text.toLowerCase().includes('cart') || 
            log.text.toLowerCase().includes('localstorage') ||
            log.type === 'error'
        );
        
        results.tests.cartRelatedErrors = cartErrors;
        
        // Take final screenshot
        await page.screenshot({ path: 'cart-test-final.png', fullPage: true });
        
    } catch (error) {
        results.mainError = {
            message: error.message,
            stack: error.stack
        };
    } finally {
        // Save results
        await fs.writeFile('cart-test-results.json', JSON.stringify(results, null, 2));
        console.log('\nTest results saved to cart-test-results.json');
        
        // Print summary
        console.log('\n=== Test Summary ===');
        console.log(`Page loaded: ${results.tests.pageLoading?.status === 'success' ? '✓' : '✗'}`);
        console.log(`Console errors: ${results.consoleLogs.filter(l => l.type === 'error').length}`);
        console.log(`Network failures: ${results.networkFailures.length}`);
        console.log(`Cart functionality: ${results.tests.cartFunctionality?.status || 'Not tested'}`);
        
        if (results.tests.cartCountAfterAdd) {
            console.log(`Cart count changed: ${results.tests.cartCountAfterAdd.before} → ${results.tests.cartCountAfterAdd.after}`);
        }
        
        await browser.close();
    }
}

testCartFunctionality().catch(console.error);