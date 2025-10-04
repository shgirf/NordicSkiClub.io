// ============================================
// CU Nordic Ski Club - Main JavaScript
// Handles navigation, forms, accessibility, and data persistence
// ============================================

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
        
        // Load saved menu state
        this.loadMenuState();
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
        this.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        this.saveMenuState(true);
    }
    
    closeMenu() {
        this.navMenu.classList.remove('show');
        this.navToggle.classList.remove('active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.body.style.overflow = ''; // Restore scrolling
        this.saveMenuState(false);
    }
    
    saveMenuState(isOpen) {
        try {
            localStorage.setItem('menuState', JSON.stringify({ isOpen, timestamp: Date.now() }));
        } catch (e) {
            console.warn('Could not save menu state:', e);
        }
    }
    
    loadMenuState() {
        try {
            const saved = localStorage.getItem('menuState');
            if (saved) {
                const { isOpen, timestamp } = JSON.parse(saved);
                // Only restore state if it's less than 1 hour old and on mobile
                if (Date.now() - timestamp < 3600000 && window.innerWidth <= 768 && isOpen) {
                    this.openMenu();
                }
            }
        } catch (e) {
            console.warn('Could not load menu state:', e);
        }
    }
}

// ============================================
// Form Validation and Handling
// ============================================
class FormController {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
        
        // Load saved form data
        this.loadFormData();
        
        // Auto-save form data
        this.form.addEventListener('input', () => this.saveFormData());
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            // Show success message
            this.showSuccessMessage();
            
            // Clear saved form data
            this.clearSavedFormData();
            
            // Reset form after short delay
            setTimeout(() => {
                this.form.reset();
            }, 2000);
        } else {
            // Focus on first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
        }
    }
    
    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        
        // Clear previous error
        this.clearError(input);
        
        // Check if required field is empty
        if (required && !value) {
            this.showError(input, 'This field is required');
            return false;
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(input, 'Please enter a valid email address');
                return false;
            }
        }
        
        // Phone validation (if applicable)
        if (input.name === 'phone' && value) {
            const phoneRegex = /^[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) {
                this.showError(input, 'Please enter a valid phone number');
                return false;
            }
        }
        
        // Minimum length validation
        const minLength = input.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            this.showError(input, `Please enter at least ${minLength} characters`);
            return false;
        }
        
        return true;
    }
    
    showError(input, message) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
        
        // Create or update error message
        let errorMsg = input.parentElement.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.setAttribute('role', 'alert');
            input.parentElement.appendChild(errorMsg);
        }
        
        errorMsg.textContent = message;
        errorMsg.classList.add('visible');
        errorMsg.id = `${input.id}-error`;
        input.setAttribute('aria-describedby', errorMsg.id);
    }
    
    clearError(input) {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.classList.remove('visible');
        }
    }
    
    showSuccessMessage() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.setAttribute('role', 'status');
        successDiv.setAttribute('aria-live', 'polite');
        successDiv.style.cssText = `
            background-color: #4caf50;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 500;
        `;
        successDiv.textContent = 'Thank you! Your form has been submitted successfully.';
        
        this.form.insertBefore(successDiv, this.form.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
    
    saveFormData() {
        try {
            const formData = {};
            const inputs = this.form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                if (input.type !== 'submit' && input.name) {
                    formData[input.name] = input.value;
                }
            });
            
            localStorage.setItem(`formData_${this.form.id}`, JSON.stringify({
                data: formData,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save form data:', e);
        }
    }
    
    loadFormData() {
        try {
            const saved = localStorage.getItem(`formData_${this.form.id}`);
            if (saved) {
                const { data, timestamp } = JSON.parse(saved);
                
                // Only restore if less than 24 hours old
                if (Date.now() - timestamp < 86400000) {
                    Object.keys(data).forEach(name => {
                        const input = this.form.querySelector(`[name="${name}"]`);
                        if (input) {
                            input.value = data[name];
                        }
                    });
                    
                    // Notify user that data was restored
                    this.showRestoredDataNotice();
                }
            }
        } catch (e) {
            console.warn('Could not load form data:', e);
        }
    }
    
    showRestoredDataNotice() {
        const notice = document.createElement('div');
        notice.className = 'restored-data-notice';
        notice.setAttribute('role', 'status');
        notice.style.cssText = `
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 0.75rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-size: 0.875rem;
        `;
        notice.textContent = 'We restored your previously entered information.';
        
        this.form.insertBefore(notice, this.form.firstChild);
        
        setTimeout(() => {
            notice.remove();
        }, 5000);
    }
    
    clearSavedFormData() {
        try {
            localStorage.removeItem(`formData_${this.form.id}`);
        } catch (e) {
            console.warn('Could not clear saved form data:', e);
        }
    }
}

// ============================================
// Content Filtering/Search (for resources or events)
// ============================================
class ContentFilter {
    constructor(filterSelector, contentSelector) {
        this.filterInput = document.querySelector(filterSelector);
        this.contentItems = document.querySelectorAll(contentSelector);
        
        if (this.filterInput && this.contentItems.length > 0) {
            this.init();
        }
    }
    
    init() {
        // Filter on input
        this.filterInput.addEventListener('input', (e) => this.filterContent(e.target.value));
        
        // Filter on Enter key
        this.filterInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.filterContent(e.target.value);
            }
        });
        
        // Add live region for screen readers
        this.createLiveRegion();
    }
    
    filterContent(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        this.contentItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(term);
            
            if (matches || term === '') {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update live region for accessibility
        this.updateLiveRegion(visibleCount, this.contentItems.length);
    }
    
    createLiveRegion() {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.className = 'sr-only';
        this.liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.liveRegion);
    }
    
    updateLiveRegion(visible, total) {
        this.liveRegion.textContent = `Showing ${visible} of ${total} items`;
    }
}

// ============================================
// Image Gallery with Keyboard Navigation
// ============================================
class ImageGallery {
    constructor(gallerySelector) {
        this.gallery = document.querySelector(gallerySelector);
        
        if (this.gallery) {
            this.images = this.gallery.querySelectorAll('img');
            this.currentIndex = 0;
            this.init();
        }
    }
    
    init() {
        // Make images focusable and add keyboard navigation
        this.images.forEach((img, index) => {
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            
            // Click to view full size
            img.addEventListener('click', () => this.showLightbox(index));
            
            // Enter/Space to view full size
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showLightbox(index);
                }
            });
        });
    }
    
    showLightbox(index) {
        this.currentIndex = index;
        
        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Image viewer');
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            padding: 2rem;
        `;
        
        const img = document.createElement('img');
        img.src = this.images[index].src;
        img.alt = this.images[index].alt;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.setAttribute('aria-label', 'Close image viewer');
        closeBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: white;
            border: none;
            font-size: 2rem;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        lightbox.appendChild(img);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        
        // Close handlers
        const closeLightbox = () => {
            lightbox.remove();
            this.images[index].focus(); // Return focus
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
        
        closeBtn.focus();
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
        
        if (!hasAccepted) {
            this.showNotice();
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
        setTimeout(() => {
            this.notice.classList.add('visible');
            this.notice.setAttribute('aria-hidden', 'false');
        }, 1000);
    }
    
    acceptPrivacy() {
        this.setPrivacyConsent(true);
        this.notice.classList.remove('visible');
        this.notice.setAttribute('aria-hidden', 'true');
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
            console.warn('Could not read privacy consent:', e);
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
            console.warn('Could not save privacy consent:', e);
        }
    }
    
    showFullPrivacyStatement() {
        // Create modal with full privacy statement
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
                <li>Restore your progress if you accidentally close the page while filling out a form</li>
            </ul>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">How Long We Store It</h3>
            <p style="margin-bottom: 1rem;">Your data is stored locally in your browser:</p>
            <ul style="margin-bottom: 1rem; margin-left: 1.5rem;">
                <li>Form data: Up to 24 hours</li>
                <li>Navigation preferences: Up to 1 hour</li>
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
            <p style="margin-bottom: 1rem;">This site may display embedded content (videos, social media). These embeds are governed by the privacy policies of their respective providers (YouTube, Instagram, etc.).</p>
            
            <button id="close-privacy-modal" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background-color: #CFB87C; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close handlers
        const closeModal = () => modal.remove();
        
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
        // Create data management section in footer if it doesn't exist
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
                <button id="clear-all-data" class="btn btn-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem; min-height: 40px;">Clear My Data</button>
                <button id="view-stored-data" class="btn btn-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem; min-height: 40px;">View Stored Data</button>
            </div>
        `;
        
        footer.appendChild(dataSection);
        
        // Event listeners
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());
        document.getElementById('view-stored-data').addEventListener('click', () => this.viewStoredData());
    }
    
    clearAllData() {
        const confirmed = confirm('Are you sure you want to clear all stored data? This cannot be undone.');
        
        if (confirmed) {
            try {
                localStorage.clear();
                alert('All stored data has been cleared successfully.');
                
                // Reload page to reflect changes
                window.location.reload();
            } catch (e) {
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
            
            let dataHTML = '<h2 style="margin-bottom: 1rem;">Stored Data</h2>';
            
            if (Object.keys(data).length === 0) {
                dataHTML += '<p>No data is currently stored.</p>';
            } else {
                dataHTML += '<ul style="list-style: none; padding: 0;">';
                Object.keys(data).forEach(key => {
                    dataHTML += `<li style="margin-bottom: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px;">
                        <strong>${key}:</strong><br>
                        <code style="font-size: 0.875rem; word-break: break-all;">${data[key].substring(0, 100)}${data[key].length > 100 ? '...' : ''}</code>
                    </li>`;
                });
                dataHTML += '</ul>';
            }
            
            dataHTML += '<button id="close-data-modal" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background-color: #CFB87C; border: none; border-radius: 4px; cursor: pointer;">Close</button>';
            
            content.innerHTML = dataHTML;
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            document.getElementById('close-data-modal').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
        } catch (e) {
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
                
                // Update focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });
}

// ============================================
// Initialize All Controllers
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    new NavigationController();
    
    // Initialize forms (only if they exist on the page)
    if (document.querySelector('#join-form')) {
        new FormController('#join-form');
    }
    if (document.querySelector('#support-form')) {
        new FormController('#support-form');
    }
    
    // Initialize content filtering (if filter exists)
    if (document.querySelector('#content-filter')) {
        new ContentFilter('#content-filter', '.filterable-item');
    }
    
    // Initialize image gallery (if gallery exists)
    if (document.querySelector('.image-gallery')) {
        new ImageGallery('.image-gallery');
    }
    
    // Initialize privacy controls
    new PrivacyController();
    
    // Initialize data management
    new DataManagement();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    console.log('CU Nordic Ski Club website initialized successfully');
});