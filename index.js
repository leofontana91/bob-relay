const express = require('express');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Stesso secret che usi già in Base44
const PROXY_SECRET      = process.env.PROXY_SECRET || 'BOB_PROXY_SECRET_2024';
// URL del tuo proxy su Siteground
const SITEGROUND_PROXY  = process.env.SITEGROUND_URL || 'https://bobconnector.com/proxy.php';

app.use(express.json());

app.post('/proxy', async (req, res) => {

    // 1. Auth — stesso header che usa Base44
    const secret = req.headers['x-proxy-secret'];
    if (secret !== PROXY_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Rigira la richiesta IDENTICA verso Siteground
    try {
        const response = await axios({
            method: 'POST',
            url: SITEGROUND_PROXY,
            headers: {
                'Content-Type': 'application/json',
                'x-proxy-secret': PROXY_SECRET,  // stesso secret verso Siteground
            },
            data: req.body,  // body identico, non lo tocchiamo
            timeout: 20000,
            validateStatus: () => true,
        });

        res.status(response.status).json(response.data);

    } catch (err) {
        res.status(502).json({ error: 'Relay failed', details: err.message });
    }
});

// Health check
app.get('/', (req, res) => res.json({ status: 'BOB Relay online' }));

app.listen(PORT, () => console.log(`BOB Relay in ascolto sulla porta ${PORT}`));
