// 1. PWA Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}

// 2. Real-Time Project Estimator Logic
const roomType = document.getElementById('room-type');
const sqftSlider = document.getElementById('sqft');
const sqftValDisplay = document.getElementById('sqft-val');
const finalPriceDisplay = document.getElementById('final-price');
const bookBtn = document.getElementById('book-now');
const feedback = document.getElementById('feedback');

// Function to calculate price dynamically
function calculatePrice() {
    if (!roomType || !sqftSlider) return; 
    
    const basePrice = parseInt(roomType.value);
    const sqft = parseInt(sqftSlider.value);
    
    // Algorithm: Base price + (SqFt * Cost per SqFt multiplier)
    const multiplier = 45; // ₹45 per sq.ft styling fee
    const total = basePrice + (sqft * multiplier);
    
    // Format to Indian Rupee
    finalPriceDisplay.textContent = '₹' + total.toLocaleString('en-IN');
}

// Event Listeners for real-time updates
if (roomType && sqftSlider) {
    roomType.addEventListener('change', calculatePrice);
    sqftSlider.addEventListener('input', (e) => {
        sqftValDisplay.textContent = e.target.value;
        calculatePrice();
    });
    
    // Run once on load to set initial value
    calculatePrice();
}

// Interactive button feedback
if (bookBtn) {
    bookBtn.addEventListener('click', () => {
        bookBtn.style.display = 'none';
        feedback.style.display = 'block';
        feedback.textContent = '✓ Quote Request Sent! Our design team will contact you shortly.';
    });
}