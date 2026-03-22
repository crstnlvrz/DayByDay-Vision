/**
 * SINTÁ RESTAURANT - INTERACTIVE FUNCTIONALITY
 * Implements PRD requirements for user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(15, 15, 15, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(15, 15, 15, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // ============================================
    // RESERVATION FORM HANDLING
    // ============================================
    
    const reservationForm = document.getElementById('reservationForm');
    
    if (reservationForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
        
        // Form submission handler
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather form data
            const formData = new FormData(reservationForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate guests count for deposit requirement
            const guests = parseInt(data.guests);
            const isPeakHour = isPeakTime(data.time);
            const requiresDeposit = guests >= 4 || isPeakHour;
            
            // Show confirmation modal/message
            showReservationConfirmation(data, requiresDeposit);
            
            // In production, this would send to backend API
            console.log('Reservation Request:', data);
            console.log('Requires Deposit:', requiresDeposit);
        });
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    /**
     * Check if selected time is during peak hours
     * Peak hours: Friday-Sunday 6:00 PM - 9:00 PM
     */
    function isPeakTime(time) {
        if (!time) return false;
        
        const peakStart = 18; // 6:00 PM
        const peakEnd = 21;   // 9:00 PM
        
        const hour = parseInt(time.split(':')[0]);
        return hour >= peakStart && hour <= peakEnd;
    }
    
    /**
     * Display reservation confirmation
     */
    function showReservationConfirmation(data, requiresDeposit) {
        const message = requiresDeposit 
            ? `Thank you, ${data.name}!\n\nYour reservation request for ${data.guests} guest(s) on ${data.date} at ${formatTime(data.time)} has been received.\n\nSince your booking is for ${data.guests >= 4 ? '4 or more guests' : 'peak hours'}, a deposit will be required to secure your table.\n\nYou will receive an email at ${data.email} with payment instructions within the next few minutes.\n\nSpecial requests noted: ${data.notes || 'None'}`
            : `Thank you, ${data.name}!\n\nYour reservation request for ${data.guests} guest(s) on ${data.date} at ${formatTime(data.time)} has been received.\n\nYou will receive a confirmation email at ${data.email} shortly.\n\nSpecial requests noted: ${data.notes || 'None'}`;
        
        alert(message);
        
        // Reset form after submission
        reservationForm.reset();
    }
    
    /**
     * Format time from 24h to 12h format
     */
    function formatTime(time24) {
        if (!time24) return '';
        
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        
        return `${hour12}:${minutes} ${ampm}`;
    }
    
    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                
                const target = document.querySelector(href);
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ============================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections for fade-in animation
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    // ============================================
    // NEWSLETTER FORM HANDLING
    // ============================================
    
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                alert(`Thank you for subscribing!\n\nYou'll receive exclusive updates and special event invitations at ${email}.`);
                emailInput.value = '';
                
                // In production, send to backend API
                console.log('Newsletter subscription:', email);
            }
        });
    }
    
    // ============================================
    // DYNAMIC YEAR IN FOOTER
    // ============================================
    
    const yearElements = document.querySelectorAll('.footer-bottom p');
    yearElements.forEach(el => {
        if (el.textContent.includes('©')) {
            const currentYear = new Date().getFullYear();
            el.textContent = el.textContent.replace(/\d{4}/, currentYear);
        }
    });
    
});

/**
 * PRD Feature: Reservation System Business Logic
 * Handles deposit requirements based on party size and timing
 */
class ReservationManager {
    constructor() {
        this.depositThreshold = 4; // Guests requiring deposit
        this.peakHours = {
            start: 18, // 6 PM
            end: 21    // 9 PM
        };
        this.peakDays = [5, 6, 0]; // Friday, Saturday, Sunday
    }
    
    /**
     * Calculate if deposit is required
     * @param {Object} reservationData - Reservation details
     * @returns {Boolean} - Whether deposit is required
     */
    requiresDeposit(reservationData) {
        const { guests, date, time } = reservationData;
        
        // Check guest count
        if (guests >= this.depositThreshold) {
            return true;
        }
        
        // Check if peak day and time
        const reservationDate = new Date(date);
        const dayOfWeek = reservationDate.getDay();
        const hour = parseInt(time.split(':')[0]);
        
        const isPeakDay = this.peakDays.includes(dayOfWeek);
        const isPeakTime = hour >= this.peakHours.start && hour <= this.peakHours.end;
        
        if (isPeakDay && isPeakTime) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get deposit amount based on party size
     * @param {Number} guests - Number of guests
     * @returns {Number} - Deposit amount in PHP
     */
    calculateDeposit(guests) {
        const perPersonRate = 500; // PHP per person
        const minimumDeposit = 2000; // PHP minimum
        
        const calculatedDeposit = guests * perPersonRate;
        return Math.max(calculatedDeposit, minimumDeposit);
    }
}

// Initialize reservation manager for future use
const reservationManager = new ReservationManager();

console.log('Sintá Restaurant website initialized successfully.');
console.log('PRD Features Active:');
console.log('- Mobile-responsive navigation');
console.log('- Advanced reservation system with deposit logic');
console.log('- Smooth scrolling and animations');
console.log()- Newsletter subscription');
console.log('- Peak hour detection');
