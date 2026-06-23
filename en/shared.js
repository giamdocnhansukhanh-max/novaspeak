// NovaCenter English - Shared Scripts
// EmailJS Configuration - FIXED
const EMAILJS_CONFIG = {
    publicKey: 'Rp_yFhF07lckl8r_9',
    serviceId: 'service_f8puzdc',
    contactTemplate: 'template_vuf8qt6',
    careerTemplate: 'template_bcgthhr'
};

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
    }
})();

// Offline Detection - FIXED
function initOfflineBar() {
    const offlineBar = document.getElementById('offline-bar');
    if (!offlineBar) return;

    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineBar.classList.remove('show');
        } else {
            offlineBar.classList.add('show');
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Check initial state
}

// Stats Counter - FIXED (hard-coded values, no animation errors)
function initStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        if (!isNaN(target)) {
            stat.textContent = target.toLocaleString();
        }
    });
}

// Form Handler - FIXED
function handleForm(formId, templateId, successMsg) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const status = form.querySelector('.form-status');
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        btn.disabled = true;
        btn.textContent = 'Sending...';

        if (typeof emailjs !== 'undefined') {
            emailjs.sendForm(EMAILJS_CONFIG.serviceId, templateId || EMAILJS_CONFIG.contactTemplate, form)
                .then(() => {
                    status.className = 'form-status success';
                    status.textContent = successMsg || 'Sent successfully! We will contact you soon.';
                    form.reset();
                })
                .catch(err => {
                    console.error('EmailJS Error:', err);
                    status.className = 'form-status error';
                    status.textContent = 'Send failed. Please contact us directly at 0707062350.';
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                });
        } else {
            status.className = 'form-status error';
            status.textContent = 'Email service unavailable. Please call 0707062350.';
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu');
    const nav = document.querySelector('.nav-links');
    if (toggle && nav) {
        toggle.addEventListener('click', () => nav.classList.toggle('active'));
    }
}

// Scroll Animation
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .value-card, .timeline-item').forEach(el => observer.observe(el));
}

// Initialize all
document.addEventListener('DOMContentLoaded', function() {
    initOfflineBar();
    initStats();
    initMobileMenu();
    initScrollAnimation();
});
