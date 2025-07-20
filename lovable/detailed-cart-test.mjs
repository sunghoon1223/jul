import { chromium } from 'playwright';
import fs from 'fs/promises';

async function detailedCartTest() {
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
        testResults: {},
        consoleLogs: [],
        errors: [],
        networkRequests: []
    };

    // Collect detailed logs
    page.on('console', msg => {
        results.consoleLogs.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: Date.now()
        });
    });

    page.on('pageerror', error => {
        results.errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
    });

    // Track network requests
    page.on('request', request => {
        if (request.url().includes('products') || request.url().includes('cart')) {
            results.networkRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                timestamp: Date.now()
            });
        }
    });

    try {
        console.log('🚀 Starting detailed cart functionality test...');
        
        // Step 1: Load the page
        console.log('1. Loading page...');
        await page.goto('https://studio-sb.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for React to fully render
        await page.waitForTimeout(5000);
        
        // Step 2: Wait for products to load
        console.log('2. Waiting for products to load...');
        
        // Check if products are being loaded
        const productsLoadingState = await page.evaluate(() => {
            // Look for loading indicators
            const loadingElements = document.querySelectorAll('[class*="loading"], [class*="skeleton"], [class*="spinner"]');
            return {
                hasLoadingElements: loadingElements.length > 0,
                loadingTexts: Array.from(loadingElements).map(el => el.textContent || el.className)
            };
        });
        
        results.testResults.productsLoadingState = productsLoadingState;
        
        // Wait for products to appear - try different approaches
        let productsFound = false;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!productsFound && attempts < maxAttempts) {
            attempts++;
            console.log(`Attempt ${attempts}: Looking for products...`);
            
            // Check for various product selectors
            const productSelectors = [
                '.grid > div', // Grid items
                '[class*="product"]',
                '[class*="card"]',
                'article',
                '.space-y-4 > div', // Grid container children
                '[data-testid*="product"]',
                '.featured-products div',
                '.product-grid div'
            ];
            
            for (const selector of productSelectors) {
                const elements = await page.locator(selector).count();
                if (elements > 0) {
                    console.log(`Found ${elements} elements with selector: ${selector}`);
                    
                    // Get details of these elements
                    const elementDetails = await page.locator(selector).first().evaluate(el => {
                        return {
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            textContent: el.textContent.substring(0, 100),
                            innerHTML: el.innerHTML.substring(0, 200),
                            hasButtons: el.querySelectorAll('button').length > 0,
                            buttonTexts: Array.from(el.querySelectorAll('button')).map(btn => btn.textContent.trim()),
                            children: el.children.length
                        };
                    });
                    
                    results.testResults[`elements_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
                        count: elements,
                        details: elementDetails
                    };
                    
                    // Check if this looks like a product
                    if (elementDetails.hasButtons && elementDetails.textContent.length > 10) {
                        productsFound = true;
                        break;
                    }
                }
            }
            
            if (!productsFound) {
                await page.waitForTimeout(1000);
            }
        }
        
        // Step 3: Take screenshot of current state
        await page.screenshot({ path: 'cart-test-products-loaded.png', fullPage: true });
        
        // Step 4: Find and analyze cart icon
        console.log('3. Analyzing cart icon...');
        const cartAnalysis = await page.evaluate(() => {
            const cartSelectors = [
                'button:has(svg[class*="cart"])',
                '[class*="cart"]',
                'svg[class*="cart"]',
                'button:has(.lucide-shopping-cart)',
                '[data-testid="cart"]',
                '.shopping-cart'
            ];
            
            const cartElements = [];
            cartSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        cartElements.push({
                            selector,
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            textContent: el.textContent.trim(),
                            isClickable: el.tagName === 'BUTTON' || el.onclick !== null,
                            hasClickHandler: el.onclick !== null,
                            isVisible: !el.hidden && el.offsetParent !== null,
                            boundingRect: el.getBoundingClientRect(),
                            outerHTML: el.outerHTML.substring(0, 200)
                        });
                    });
                } catch (e) {
                    // Skip problematic selectors
                }
            });
            
            return cartElements;
        });
        
        results.testResults.cartAnalysis = cartAnalysis;
        
        // Step 5: Try to find actual product cards with cart buttons
        console.log('4. Looking for product cards with cart buttons...');
        
        // Scroll down to see more content
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 3);
        });
        await page.waitForTimeout(2000);
        
        // Look for product cards more specifically
        const productCards = await page.evaluate(() => {
            const cards = [];
            
            // Look for elements that might be product cards
            const potentialCards = document.querySelectorAll('div');
            
            for (let i = 0; i < potentialCards.length && cards.length < 20; i++) {
                const el = potentialCards[i];
                
                // Check if this element looks like a product card
                const hasImage = el.querySelector('img') !== null;
                const hasButton = el.querySelector('button') !== null;
                const hasPrice = el.textContent.includes('₩') || el.textContent.includes('원') || el.textContent.includes('$');
                const hasText = el.textContent.trim().length > 20;
                
                if ((hasImage || hasButton) && hasText) {
                    const buttons = Array.from(el.querySelectorAll('button'));
                    const cartButton = buttons.find(btn => 
                        btn.textContent.includes('장바구니') || 
                        btn.textContent.includes('Cart') ||
                        btn.textContent.includes('Add') ||
                        btn.querySelector('svg[class*="cart"]')
                    );
                    
                    cards.push({
                        element: {
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            textContent: el.textContent.substring(0, 150),
                            hasImage,
                            hasButton,
                            hasPrice,
                            buttonCount: buttons.length,
                            buttonTexts: buttons.map(btn => btn.textContent.trim()).slice(0, 3)
                        },
                        cartButton: cartButton ? {
                            text: cartButton.textContent.trim(),
                            className: cartButton.className,
                            disabled: cartButton.disabled,
                            isVisible: !cartButton.hidden && cartButton.offsetParent !== null
                        } : null
                    });
                }
            }
            
            return cards;
        });
        
        results.testResults.productCards = productCards;
        console.log(`Found ${productCards.length} potential product cards`);
        
        // Step 6: Try to interact with cart functionality
        if (productCards.length > 0) {
            console.log('5. Testing cart interaction...');
            
            // Find the first product card with a cart button
            const cardWithCartButton = productCards.find(card => card.cartButton);
            
            if (cardWithCartButton) {
                console.log('Found product card with cart button:', cardWithCartButton.cartButton.text);
                
                // Get initial cart state
                const initialCartState = await page.evaluate(() => {
                    try {
                        const cartCountElement = document.querySelector('[class*="cart"] [class*="count"], [class*="cart"] [class*="badge"], [class*="badge"]');
                        const cartCount = cartCountElement ? parseInt(cartCountElement.textContent || '0') : 0;
                        
                        return {
                            cartCount,
                            localStorage: {
                                cart: localStorage.getItem('cart'),
                                cartItems: localStorage.getItem('cartItems')
                            }
                        };
                    } catch (e) {
                        return { error: e.message };
                    }
                });
                
                results.testResults.initialCartState = initialCartState;
                
                // Try to click the cart button
                const cartButtonSelector = `button:has-text("${cardWithCartButton.cartButton.text}")`;
                
                try {
                    // Wait for the button to be available
                    await page.waitForSelector(cartButtonSelector, { timeout: 5000 });
                    
                    // Click the cart button
                    await page.click(cartButtonSelector);
                    console.log('Cart button clicked successfully');
                    
                    // Wait for any state updates
                    await page.waitForTimeout(2000);
                    
                    // Check cart state after click
                    const finalCartState = await page.evaluate(() => {
                        try {
                            const cartCountElement = document.querySelector('[class*="cart"] [class*="count"], [class*="cart"] [class*="badge"], [class*="badge"]');
                            const cartCount = cartCountElement ? parseInt(cartCountElement.textContent || '0') : 0;
                            
                            return {
                                cartCount,
                                localStorage: {
                                    cart: localStorage.getItem('cart'),
                                    cartItems: localStorage.getItem('cartItems')
                                }
                            };
                        } catch (e) {
                            return { error: e.message };
                        }
                    });
                    
                    results.testResults.finalCartState = finalCartState;
                    
                    // Check if cart count changed
                    const cartCountChanged = finalCartState.cartCount !== initialCartState.cartCount;
                    results.testResults.cartCountChanged = cartCountChanged;
                    
                    console.log(`Cart count changed: ${cartCountChanged} (${initialCartState.cartCount} → ${finalCartState.cartCount})`);
                    
                } catch (error) {
                    results.testResults.cartButtonClickError = error.message;
                    console.log('Error clicking cart button:', error.message);
                }
            } else {
                console.log('No product card with cart button found');
                results.testResults.cartButtonFound = false;
            }
        }
        
        // Step 7: Try to open cart drawer
        console.log('6. Testing cart drawer...');
        
        const cartIconButton = await page.locator('button:has(svg[class*="cart"])').first();
        
        if (await cartIconButton.isVisible()) {
            await cartIconButton.click();
            await page.waitForTimeout(1000);
            
            // Check if drawer opened
            const drawerState = await page.evaluate(() => {
                const drawerSelectors = [
                    '[class*="drawer"]',
                    '[class*="sheet"]',
                    '[class*="modal"]',
                    '[class*="cart-drawer"]',
                    '.fixed.inset-0',
                    '[role="dialog"]'
                ];
                
                let drawerFound = false;
                let drawerContent = '';
                
                for (const selector of drawerSelectors) {
                    const element = document.querySelector(selector);
                    if (element && element.offsetParent !== null) {
                        drawerFound = true;
                        drawerContent = element.textContent.substring(0, 200);
                        break;
                    }
                }
                
                return {
                    drawerFound,
                    drawerContent
                };
            });
            
            results.testResults.drawerState = drawerState;
            
            // Take screenshot of drawer state
            await page.screenshot({ path: 'cart-drawer-test.png', fullPage: true });
        }
        
        // Step 8: Final analysis
        console.log('7. Final analysis...');
        
        const finalAnalysis = await page.evaluate(() => {
            return {
                totalElements: document.querySelectorAll('*').length,
                buttons: document.querySelectorAll('button').length,
                cartElements: document.querySelectorAll('[class*="cart"]').length,
                productLikeElements: document.querySelectorAll('[class*="product"], [class*="card"], [class*="grid"] > div').length,
                hasReactDevTools: window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined,
                consoleErrors: window.console.errors || []
            };
        });
        
        results.testResults.finalAnalysis = finalAnalysis;
        
    } catch (error) {
        results.mainError = {
            message: error.message,
            stack: error.stack
        };
        console.error('Main error:', error);
    } finally {
        // Save results
        await fs.writeFile('detailed-cart-test-results.json', JSON.stringify(results, null, 2));
        console.log('\n📊 Detailed test results saved to detailed-cart-test-results.json');
        
        // Print comprehensive summary
        console.log('\n=== 🛒 Cart Functionality Test Summary ===');
        console.log(`Page loaded: ${results.testResults.finalAnalysis ? '✅' : '❌'}`);
        console.log(`Products found: ${results.testResults.productCards?.length || 0}`);
        console.log(`Cart elements found: ${results.testResults.cartAnalysis?.length || 0}`);
        console.log(`Cart button found: ${results.testResults.cartButtonFound !== false ? '✅' : '❌'}`);
        console.log(`Cart count changed: ${results.testResults.cartCountChanged ? '✅' : '❌'}`);
        console.log(`Cart drawer opened: ${results.testResults.drawerState?.drawerFound ? '✅' : '❌'}`);
        console.log(`Console errors: ${results.errors.length}`);
        console.log(`Network requests: ${results.networkRequests.length}`);
        
        if (results.errors.length > 0) {
            console.log('\n❌ JavaScript Errors:');
            results.errors.forEach(error => {
                console.log(`- ${error.message}`);
            });
        }
        
        if (results.testResults.cartButtonClickError) {
            console.log(`\n❌ Cart Button Click Error: ${results.testResults.cartButtonClickError}`);
        }
        
        await browser.close();
    }
}

detailedCartTest().catch(console.error);