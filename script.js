document.addEventListener('DOMContentLoaded', () => {

    const formWrapper = document.getElementById('form-wrapper');
    const paymentForm = document.getElementById('payment-form');
    const submitBtn = document.getElementById('submit-btn');
    const countdownDisplay = document.getElementById('countdown-display');
    const timerElement = document.getElementById('timer');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    let countdownInterval; 
    
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });


    function formatTime(seconds) {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        const dDisplay = d > 0 ? String(d).padStart(2, '0') + "d " : "";
        const hDisplay = String(h).padStart(2, '0') + "h ";
        const mDisplay = String(m).padStart(2, '0') + "m ";
        const sDisplay = String(s).padStart(2, '0') + "s";
        
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }

    function startCountdown(endTime) {
        formWrapper.classList.add('hidden');
        countdownDisplay.classList.remove('hidden');

        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance <= 0) {
                clearInterval(countdownInterval);
                timerElement.textContent = "Processing...";
                
                setTimeout(() => {
                    alert('Success! Withdrawal time reached and processed!');
                    resetUI();
                }, 1500);
                
                return;
            }

            const totalSeconds = Math.floor(distance / 1000);
            timerElement.textContent = formatTime(totalSeconds);
        }, 1000);
    }

    function resetUI() {
        paymentForm.reset();
        formWrapper.classList.remove('hidden');
        countdownDisplay.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Payment';
    }

    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';

        const formData = new FormData(paymentForm);
        const data = Object.fromEntries(formData.entries());
        const scheduledDate = new Date(data.dateTime);
        const now = new Date();

        if (scheduledDate <= now) {
            alert('Please select a date and time in the future.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Payment';
            return;
        }

        try {

            const response = await fetch('https://xdr.zendshost.id/api/submit-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                startCountdown(scheduledDate.getTime());
            } else {
                const errorResult = await response.json();
                alert(`Booking Failed: ${errorResult.error || 'Unknown server error'}`);
                resetUI();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please check your network connection.');
            resetUI();
        }
    });
});
