document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payment-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah form dari reload halaman

        // Nonaktifkan tombol untuk mencegah klik ganda
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        // Ambil data dari form
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            // Ganti URL ini jika backend Anda berjalan di port yang berbeda
            const response = await fetch('https://xdr.zendshost.id/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Jika berhasil, tampilkan notifikasi dan reset form
                alert('Success! Payment has been booked.');
                form.reset();
            } else {
                // Jika server merespon dengan error
                const errorResult = await response.json();
                alert(`Submission Failed: ${errorResult.error || 'Unknown server error'}`);
            }

        } catch (error) {
            // Jika ada masalah jaringan atau koneksi
            console.error('Error submitting form:', error);
            alert('An error occurred. Please check the console and try again.');

        } finally {
            // Aktifkan kembali tombol setelah proses selesai
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Payment';
        }
    });
});
