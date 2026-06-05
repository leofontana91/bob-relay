const express = require('express');
const app = express();
app.use(express.json());

const PROXY_SECRET = process.env.PROXY_SECRET || 'MY_RAILWAY_SECRET_2024';
const BOB_URL = 'https://bobconnector.com/bobproxy.php';
const BOB_SECRET = process.env.BOB_SECRET;

app.post('/', async (req, res) => {
  // Verifica secret
  if (req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(BOB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Secret': BOB_SECRET,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running'));
