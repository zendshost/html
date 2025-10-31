import express from 'express';
import {
    request
} from 'undici';
import {
    URLSearchParams
} from 'url';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

const TELEGRAM_BOT_TOKEN = '8156807885:AAF5d24PkTwltDvsNFt3usWaBdE1Pmx6hA4'; // Ganti dengan token Anda
const TELEGRAM_CHAT_ID = '7890743177'; // Ganti dengan chat ID Anda

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

async function sendTelegramMessage(message) {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params = new URLSearchParams({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
    });

    try {
        await request(telegramApiUrl, {
            method: 'POST',
            body: params.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    } catch (error) {
        console.error('Gagal mengirim pesan Telegram:', error.message);
    }
}

app.post('/api/submit', async (req, res) => {
    const {
        xdr
    } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta'
    });

    if (!xdr) {
        const errorMessage = "Bad request: XDR is empty";
        return res.status(400).json({
            error: errorMessage
        });
    }

    const formData = new URLSearchParams();
    formData.append("tx", xdr);

    try {
        // <<< GANTI URL DI SINI
        const horizonSubmitURL = "http://4.194.35.14:31401/transactions";
        
        const response = await request(horizonSubmitURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const result = await response.body.json();

        // Hanya kirim notifikasi jika status response adalah 200 (OK/Berhasil)
        if (response.statusCode === 200) {
            let successMessage = `<b>✅ Transaksi Berhasil!</b>\n\n`;
            successMessage += `<b>Waktu:</b> ${timestamp}\n`;
            successMessage += `<b>IP Asal:</b> ${clientIp}\n`;
            successMessage += `<b>Respon Horizon:</b>\n<pre>${JSON.stringify(result, null, 2)}</pre>`;
            await sendTelegramMessage(successMessage);
        }

        // Respon ke client tetap dikirim apa pun hasilnya (berhasil atau gagal)
        return res.status(response.statusCode).json(result);

    } catch (err) {
        const errorMessage = "Gagal koneksi ke Horizon";
        console.error(`[${timestamp}] ERROR: ${errorMessage} - ${err.message}`);
        
        return res.status(502).json({
            error: errorMessage,
            message: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});