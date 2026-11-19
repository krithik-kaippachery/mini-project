/**
 * calculator.js — Dreamspace SaaS Estimator Module
 * ─────────────────────────────────────────────────
 * Responsibilities:
 *  1. Reads room pricing data injected by the EJS template (from DOM data-* attrs)
 *  2. Handles room card selection and slider interaction
 *  3. Sends calculation request to the backend API (/api/estimate/calculate)
 *  4. Renders the result with animated price update
 *  5. Handles "Request Quote" submission
 */

(function DreamspaceCalculator() {
    'use strict';

    // ─── DOM References ───────────────────────────────────────────────────────
    const roomCards       = document.querySelectorAll('.room-card');
    const sqftSlider      = document.getElementById('sqft-slider');
    const sqftDisplay     = document.getElementById('sqft-display');
    const totalPriceEl    = document.getElementById('total-price');
    const breakdownEl     = document.getElementById('price-breakdown');
    const basePriceEl     = document.getElementById('base-price-display');
    const rateEl          = document.getElementById('rate-display');
    const summaryRoom     = document.getElementById('summary-room');
    const summarySqft     = document.getElementById('summary-sqft');
    const summaryTimeline = document.getElementById('summary-timeline');
    const quoteBtn        = document.getElementById('quote-btn');
    const quoteFeedback   = document.getElementById('quote-feedback');

    if (!sqftSlider || !roomCards.length || !totalPriceEl) return;

    // ─── State ────────────────────────────────────────────────────────────────
    let activeRoom = {
        id:        roomCards[0]?.dataset.id   || 'living',
        name:      roomCards[0]?.querySelector('h4')?.textContent || 'Living Room',
        base:      parseInt(roomCards[0]?.dataset.base || 15000),
        rate:      parseInt(roomCards[0]?.dataset.rate || 45),
    };
    let debounceTimer = null;

    // ─── Timeline Estimator (local heuristic) ─────────────────────────────────
    function getTimeline(sqft) {
        if (sqft < 300) return '2–3 weeks';
        if (sqft < 700) return '4–6 weeks';
        if (sqft < 1500) return '6–10 weeks';
        return '10–16 weeks';
    }

    // ─── Format Indian Rupee ─────────────────────────────────────────────────
    function formatINR(amount) {
        return '₹' + parseInt(amount).toLocaleString('en-IN');
    }

    // ─── Update Slider Track Fill ─────────────────────────────────────────────
    function updateSliderFill() {
        const min = parseInt(sqftSlider.min);
        const max = parseInt(sqftSlider.max);
        const val = parseInt(sqftSlider.value);
        const pct = ((val - min) / (max - min)) * 100;
        sqftSlider.style.setProperty('--pct', pct + '%');
    }

    // ─── Animate Price Change ─────────────────────────────────────────────────
    function animatePriceUpdate(newText) {
        totalPriceEl.classList.remove('updating');
        // Force reflow for re-animation
        void totalPriceEl.offsetWidth;
        totalPriceEl.textContent = newText;
        totalPriceEl.classList.add('updating');
    }

    // ─── Core: Call Backend API ───────────────────────────────────────────────
    async function fetchEstimate(roomId, sqft) {
        try {
            const res  = await fetch('/api/estimate/calculate', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ roomId, sqft }),
            });
            const data = await res.json();

            if (!data.success) {
                console.warn('[Calculator] API error:', data.message);
                return null;
            }
            return data.data;
        } catch (err) {
            console.error('[Calculator] Network error:', err);
            return null;
        }
    }

    // ─── Render Result ────────────────────────────────────────────────────────
    function renderResult(result, roomName, sqft) {
        const { total, basePrice, ratePerSqft } = result;

        animatePriceUpdate(formatINR(total));
        breakdownEl.textContent  = `${formatINR(basePrice)} base + ${sqft}ft² × ₹${ratePerSqft}`;
        basePriceEl.textContent  = formatINR(basePrice);
        rateEl.textContent       = `₹${ratePerSqft}`;
        summaryRoom.textContent  = roomName;
        summarySqft.textContent  = `${sqft} ft²`;
        summaryTimeline.textContent = getTimeline(sqft);
    }

    // ─── Fallback: Local Calculation (instant feedback before API returns) ─────
    function localCalculate() {
        const sqft  = parseInt(sqftSlider.value);
        const total = activeRoom.base + (sqft * activeRoom.rate);
        animatePriceUpdate(formatINR(total));
        breakdownEl.textContent  = `${formatINR(activeRoom.base)} base + ${sqft}ft² × ₹${activeRoom.rate}`;
        basePriceEl.textContent  = formatINR(activeRoom.base);
        rateEl.textContent       = `₹${activeRoom.rate}`;
        summaryRoom.textContent  = activeRoom.name;
        summarySqft.textContent  = `${sqft} ft²`;
        summaryTimeline.textContent = getTimeline(sqft);
    }

    // ─── Debounced API Call ───────────────────────────────────────────────────
    function debouncedAPICall() {
        clearTimeout(debounceTimer);
        // Show local calculation instantly for responsiveness
        localCalculate();
        // Then validate/refresh with the authoritative backend result
        debounceTimer = setTimeout(async () => {
            const sqft   = parseInt(sqftSlider.value);
            const result = await fetchEstimate(activeRoom.id, sqft);
            if (result) renderResult(result, activeRoom.name, sqft);
        }, 600); // 600ms debounce
    }

    // ─── Room Card Click Handler ──────────────────────────────────────────────
    roomCards.forEach(card => {
        card.addEventListener('click', () => {
            // Update active class
            roomCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            // Update state
            activeRoom = {
                id:   card.dataset.id,
                name: card.querySelector('h4').textContent,
                base: parseInt(card.dataset.base),
                rate: parseInt(card.dataset.rate),
            };

            debouncedAPICall();
        });
    });

    // ─── Slider Input Handler ─────────────────────────────────────────────────
    sqftSlider.addEventListener('input', () => {
        sqftDisplay.textContent = sqftSlider.value;
        updateSliderFill();
        debouncedAPICall();
    });

    // ─── Quote Button ─────────────────────────────────────────────────────────
    if (quoteBtn && quoteFeedback) {
        quoteBtn.addEventListener('click', () => {
            quoteBtn.disabled = true;
            quoteBtn.textContent = '✓ Request Sent!';
            quoteFeedback.textContent = 'Our design team will contact you within 24 hours.';
            quoteFeedback.classList.add('show');
        });
    }

    // ─── Init ─────────────────────────────────────────────────────────────────
    updateSliderFill();
    localCalculate(); // Immediate render on page load

    // Fire first API call
    (async () => {
        const sqft   = parseInt(sqftSlider.value);
        const result = await fetchEstimate(activeRoom.id, sqft);
        if (result) renderResult(result, activeRoom.name, sqft);
    })();

})(); // IIFE — keeps all variables scoped, no global pollution
