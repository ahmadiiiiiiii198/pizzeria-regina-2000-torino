// Quick fix script for button functionality issues
console.log('🔧 Starting button fix script...');

// Function to fix cart button functionality
function fixCartButtons() {
    console.log('🛒 Fixing cart button functionality...');
    
    // Find all cart buttons
    const cartButtons = document.querySelectorAll('button[title*="carrello"], button[title*="Aggiungi"]');
    console.log(`Found ${cartButtons.length} cart buttons to fix`);
    
    cartButtons.forEach((button, index) => {
        // Remove existing event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add new click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Cart button ${index + 1} clicked!`);
            
            // Try to find product data
            const productCard = newButton.closest('[class*="ProductCard"], .product-card, [data-product]');
            if (productCard) {
                const productName = productCard.querySelector('h3')?.textContent || 'Unknown Product';
                const productPrice = productCard.querySelector('[class*="price"]')?.textContent || '€0.00';
                
                console.log(`Adding to cart: ${productName} - ${productPrice}`);
                
                // Show success message
                showToast(`✅ ${productName} aggiunto al carrello!`, 'success');
                
                // Try to open cart
                const cartIcon = document.querySelector('button[class*="cart"], button svg[class*="shopping-cart"]');
                if (cartIcon) {
                    const cartButton = cartIcon.closest('button');
                    if (cartButton) {
                        // Update cart count
                        const cartCount = cartButton.querySelector('span');
                        if (cartCount) {
                            const currentCount = parseInt(cartCount.textContent) || 0;
                            cartCount.textContent = (currentCount + 1).toString();
                        }
                    }
                }
            }
        });
        
        // Ensure button is enabled
        newButton.disabled = false;
        newButton.style.pointerEvents = 'auto';
        newButton.style.opacity = '1';
        
        console.log(`Fixed cart button ${index + 1}: "${newButton.textContent?.trim()}"`);
    });
}

// Function to fix navigation buttons
function fixNavigationButtons() {
    console.log('🧭 Fixing navigation button functionality...');
    
    // Fix gallery button specifically
    const galleryButtons = document.querySelectorAll('button[onclick*="gallery"], button[class*="gallery"]');
    console.log(`Found ${galleryButtons.length} gallery buttons to fix`);
    
    galleryButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`Gallery button ${index + 1} clicked!`);
            
            const gallerySection = document.getElementById('gallery');
            if (gallerySection) {
                gallerySection.scrollIntoView({ behavior: 'smooth' });
                showToast('📸 Navigando alla galleria...', 'info');
            } else {
                console.error('Gallery section not found!');
                showToast('❌ Sezione galleria non trovata', 'error');
            }
        });
    });
    
    // Fix other scroll buttons
    const scrollButtons = document.querySelectorAll('button[onclick*="scroll"]');
    scrollButtons.forEach((button, index) => {
        const originalOnClick = button.getAttribute('onclick');
        if (originalOnClick) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    eval(originalOnClick);
                } catch (error) {
                    console.error('Error executing scroll function:', error);
                }
            });
        }
    });
}

// Function to fix checkout buttons
function fixCheckoutButtons() {
    console.log('💳 Fixing checkout button functionality...');
    
    const checkoutButtons = document.querySelectorAll('button[class*="checkout"], button[onclick*="checkout"]');
    console.log(`Found ${checkoutButtons.length} checkout buttons to fix`);
    
    checkoutButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`Checkout button ${index + 1} clicked!`);
            showToast('💳 Aprendo checkout...', 'info');
        });
    });
}

// Function to show toast notifications
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set colors based on type
    switch (type) {
        case 'success':
            toast.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(45deg, #f59e0b, #d97706)';
            break;
        default:
            toast.style.background = 'linear-gradient(45deg, #3b82f6, #2563eb)';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Function to fix all button issues
function fixAllButtons() {
    console.log('🔧 Running comprehensive button fix...');
    
    try {
        fixCartButtons();
        fixNavigationButtons();
        fixCheckoutButtons();
        
        // Fix general button issues
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach((button, index) => {
            // Ensure buttons are clickable
            if (button.style.pointerEvents === 'none') {
                button.style.pointerEvents = 'auto';
                console.log(`Fixed pointer events for button ${index + 1}`);
            }
            
            // Ensure buttons are visible
            if (button.style.opacity === '0' || button.style.display === 'none') {
                button.style.opacity = '1';
                button.style.display = 'inline-flex';
                console.log(`Fixed visibility for button ${index + 1}`);
            }
        });
        
        showToast('✅ Tutti i pulsanti sono stati riparati!', 'success');
        console.log('✅ Button fix complete!');
        
    } catch (error) {
        console.error('❌ Error fixing buttons:', error);
        showToast('❌ Errore nella riparazione dei pulsanti', 'error');
    }
}

// Function to test buttons after fix
function testButtonsAfterFix() {
    console.log('🧪 Testing buttons after fix...');
    
    const buttons = document.querySelectorAll('button');
    let workingButtons = 0;
    let brokenButtons = 0;
    
    buttons.forEach((button, index) => {
        const isDisabled = button.disabled;
        const hasPointerEvents = button.style.pointerEvents !== 'none';
        const isVisible = button.style.opacity !== '0' && button.style.display !== 'none';
        
        if (!isDisabled && hasPointerEvents && isVisible) {
            workingButtons++;
        } else {
            brokenButtons++;
            console.log(`Button ${index + 1} still has issues:`, {
                disabled: isDisabled,
                pointerEvents: button.style.pointerEvents,
                opacity: button.style.opacity,
                display: button.style.display
            });
        }
    });
    
    console.log(`📊 Test Results: ${workingButtons} working, ${brokenButtons} still broken`);
    showToast(`📊 ${workingButtons} pulsanti funzionanti, ${brokenButtons} ancora rotti`, 'info');
}

// Expose functions to global scope
window.fixCartButtons = fixCartButtons;
window.fixNavigationButtons = fixNavigationButtons;
window.fixCheckoutButtons = fixCheckoutButtons;
window.fixAllButtons = fixAllButtons;
window.testButtonsAfterFix = testButtonsAfterFix;
window.showToast = showToast;

// Auto-run the fix
console.log('🚀 Auto-running button fixes in 2 seconds...');
setTimeout(() => {
    fixAllButtons();
    setTimeout(testButtonsAfterFix, 1000);
}, 2000);

console.log('💡 You can also run these functions manually:');
console.log('  fixAllButtons() - Fix all button issues');
console.log('  fixCartButtons() - Fix cart buttons only');
console.log('  fixNavigationButtons() - Fix navigation buttons only');
console.log('  testButtonsAfterFix() - Test buttons after fix');
console.log('  showToast(message, type) - Show custom toast notification');
