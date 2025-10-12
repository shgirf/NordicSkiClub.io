// ============================================
// CU Nordic Ski Club - Main JavaScript
// Handles navigation, accessibility, and data persistence
// Production Version with Enhanced Error Handling
// ============================================

const DEBUG = false; // Set to true for development logging

// ============================================
// Mobile Navigation Toggle
// ============================================
class NavigationController {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.body = document.body;
        
        if (this.navToggle && this.navMenu) {
            this.init();
        }
    }
    
    init() {
        // Click event for toggle button
        this.navToggle.addEventListener('click', () => this.toggleMenu());
        
        // Keyboard support (Enter and Space)
        this.navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.main-nav')) {
                this.closeMenu();
            }
        });
        
        // Close menu when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });
        
        // Close menu on window resize to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMenu();
            }
        });
        
        // Swipe gesture support for mobile
        this.initSwipeGestures();
    }
    
    toggleMenu() {
        const isOpen = this.navMenu.classList.contains('show');
        
        if (isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.navMenu.classList.add('show');
        this.navToggle.classList.add('active');
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.body.style.overflow = 'hidden';
        this.announceToScreenReader('Navigation menu opened');
    }
    
    closeMenu() {
        this.navMenu.classList.remove('show');
        this.navToggle.classList.remove('active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.body.style.overflow = '';
        this.announceToScreenReader('Navigation menu closed');
    }
    
    initSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.navMenu.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.navMenu.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                // Swiped left - close menu
                this.closeMenu();
            }
        }, { passive: true });
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }
}

// ============================================
// Privacy Notice Controller
// ============================================
class PrivacyController {
    constructor() {
        this.notice = document.getElementById('privacy-notice');
        this.acceptBtn = document.getElementById('accept-privacy');
        this.viewBtn = document.getElementById('view-privacy');
        
        if (this.notice) {
            this.init();
        }
    }
    
    init() {
        // Check if user has already accepted
        const hasAccepted = this.getPrivacyConsent();
        
        if (DEBUG) console.log('Privacy consent status:', hasAccepted);
        
        if (!hasAccepted) {
            if (DEBUG) console.log('Showing privacy notice...');
            this.showNotice();
        } else {
            if (DEBUG) console.log('Privacy already accepted, hiding notice');
            // Ensure notice stays hidden if already accepted
            this.notice.setAttribute('hidden', '');
        }
        
        // Event listeners
        if (this.acceptBtn) {
            this.acceptBtn.addEventListener('click', () => this.acceptPrivacy());
        }
        
        if (this.viewBtn) {
            this.viewBtn.addEventListener('click', () => this.showFullPrivacyStatement());
        }
    }
    
    showNotice() {
        // Remove hidden attribute first
        this.notice.removeAttribute('hidden');
        
        // Force a reflow to ensure the element is rendered
        this.notice.offsetHeight;
        
        // Then add visible class with a slight delay
        setTimeout(() => {
            this.notice.classList.add('visible');
            this.notice.setAttribute('aria-hidden', 'false');
        }, 100);
    }
    
    acceptPrivacy() {
        this.setPrivacyConsent(true);
        this.notice.classList.remove('visible');
        this.notice.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            this.notice.setAttribute('hidden', '');
        }, 300);
    }
    
    getPrivacyConsent() {
        try {
            const consent = localStorage.getItem('privacyConsent');
            if (consent) {
                const { accepted, timestamp } = JSON.parse(consent);
                // Consent expires after 1 year
                if (Date.now() - timestamp < 31536000000) {
                    return accepted;
                }
            }
        } catch (e) {
            console.error('Error reading privacy consent from localStorage:', e);
            // Fail safely by requiring new consent
            return false;
        }
        return false;
    }
    
    setPrivacyConsent(accepted) {
        try {
            localStorage.setItem('privacyConsent', JSON.stringify({
                accepted,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('Error saving privacy consent to localStorage:', e);
            alert('Unable to save privacy preferences. Please check your browser settings.');
        }
    }
    
    showFullPrivacyStatement() {
        const modal = document.createElement('div');
        modal.className = 'privacy-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'privacy-modal-title');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            padding: 2rem;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        content.innerHTML = `
            <h2 id="privacy-modal-title" style="margin-bottom: 1rem;">Privacy Statement</h2>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">What Data We Collect</h3>
            <p style="margin-bottom: 1rem;">We collect data that you voluntarily provide through forms and your browsing preferences. This includes:</p>
            <ul style="margin-bottom: 1rem; margin-left: 1.5rem;">
                <li>Form submissions (name, email, phone number, messages)</li>
                <li>Navigation preferences (menu state)</li>
                <li>Your privacy consent preferences</li>
            </ul>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Why We Collect It</h3>
            <p style="margin-bottom: 1rem;">We collect this data to:</p>
            <ul style="margin-bottom: 1rem; margin-left: 1.5rem;">
                <li>Respond to your inquiries and membership requests</li>
                <li>Improve your browsing experience by remembering your preferences</li>
            </ul>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">How Long We Store It</h3>
            <p style="margin-bottom: 1rem;">Your data is stored locally in your browser:</p>
            <ul style="margin-bottom: 1rem; margin-left: 1.5rem;">
                <li>Privacy consent: Up to 1 year</li>
            </ul>
            <p style="margin-bottom: 1rem;"><strong>Important:</strong> No data is ever sent to external servers. Everything stays on your device.</p>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Your Controls</h3>
            <p style="margin-bottom: 1rem;">You have complete control over your data:</p>
            <ul style="margin-bottom: 1rem; margin-left: 1.5rem;">
                <li>Clear all stored data using the "Clear My Data" button in the footer</li>
                <li>Your browser's privacy settings can prevent data storage entirely</li>
                <li>All data automatically expires after the time periods listed above</li>
            </ul>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">External Content</h3>
            <p style="margin-bottom: 1rem;">This site may display embedded content (videos, social media, forms). These embeds are governed by the privacy policies of their respective providers (YouTube, Instagram, Google Forms, etc.).</p>
            
            <button id="close-privacy-modal" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background-color: #CFB87C; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        const closeModal = () => {
            modal.remove();
            // Return focus to the button that opened the modal
            if (this.viewBtn) {
                this.viewBtn.focus();
            }
        };
        
        document.getElementById('close-privacy-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
        
        // Focus the close button for accessibility
        document.getElementById('close-privacy-modal').focus();
    }
}

// ============================================
// Data Management Controller
// ============================================
class DataManagement {
    constructor() {
        this.init();
    }
    
    init() {
        this.createDataControls();
    }
    
    createDataControls() {
        const footer = document.querySelector('.site-footer .container');
        if (!footer) return;
        
        const dataSection = document.createElement('div');
        dataSection.className = 'data-controls';
        dataSection.style.cssText = `
            margin-top: 2rem;
            padding: 1rem;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        `;
        
        dataSection.innerHTML = `
            <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #000;">Manage Your Data</h3>
            <p style="font-size: 0.875rem; margin-bottom: 1rem; color: #000;">You have full control over the data stored on your device.</p>
            <div class="data-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button id="clear-all-data" class="btn btn-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem; min-height: 40px;" aria-label="Clear all stored data from this website">Clear My Data</button>
                <button id="view-stored-data" class="btn btn-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem; min-height: 40px;" aria-label="View what data is currently stored">View Stored Data</button>
            </div>
        `;
        
        footer.appendChild(dataSection);
        
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());
        document.getElementById('view-stored-data').addEventListener('click', () => this.viewStoredData());
    }
    
    clearAllData() {
        const confirmed = confirm('Are you sure you want to clear all stored data? This action cannot be undone.');
        
        if (confirmed) {
            try {
                localStorage.clear();
                alert('All stored data has been cleared successfully. The page will now reload.');
                window.location.reload();
            } catch (e) {
                console.error('Error clearing data:', e);
                alert('Error clearing data: ' + e.message);
            }
        }
    }
    
    viewStoredData() {
        try {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            
            const modal = document.createElement('div');
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-labelledby', 'stored-data-title');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 4000;
                padding: 2rem;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 2rem;
                border-radius: 8px;
                max-width: 700px;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            let dataHTML = '<h2 id="stored-data-title" style="margin-bottom: 1rem;">Stored Data</h2>';
            
            if (Object.keys(data).length === 0) {
                dataHTML += '<p>No data is currently stored on your device.</p>';
            } else {
                dataHTML += '<ul style="list-style: none; padding: 0;">';
                Object.keys(data).forEach(key => {
                    const value = data[key];
                    const displayValue = value.length > 100 ? value.substring(0, 100) + '...' : value;
                    dataHTML += `<li style="margin-bottom: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <strong>${key}:</strong><br>
                        <code style="font-size: 0.875rem; word-break: break-all;">${displayValue}</code>
                    </li>`;
                });
                dataHTML += '</ul>';
            }
            
            dataHTML += '<button id="close-data-modal" class="btn btn-primary" style="margin-top: 1rem;">Close</button>';
            
            content.innerHTML = dataHTML;
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            const closeModal = () => modal.remove();
            
            document.getElementById('close-data-modal').addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
            
            // Focus the close button
            document.getElementById('close-data-modal').focus();
        } catch (e) {
            console.error('Error viewing data:', e);
            alert('Error viewing data: ' + e.message);
        }
    }
}

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Set focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
                
                // Update URL without scrolling
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });
}

// ============================================
// Initialize All Controllers
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize navigation
        new NavigationController();
        
        // Initialize privacy controls
        new PrivacyController();
        
        // Initialize data management
        new DataManagement();
        
        // Initialize smooth scrolling
        initSmoothScroll();
        
        if (DEBUG) console.log('CU Nordic Ski Club website initialized successfully');
    } catch (error) {
        console.error('Error initializing website:', error);
    }
});