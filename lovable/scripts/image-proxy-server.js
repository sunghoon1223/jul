// 🖼️ 서버 측 이미지 프록시 솔루션
// 설치: npm install express cors node-fetch

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());

// 이미지 프록시 엔드포인트
app.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    console.log(`🔄 Proxying image: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 이미지 헤더 설정
    res.set({
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400', // 24시간 캐시
      'Access-Control-Allow-Origin': '*'
    });

    response.body.pipe(res);
    console.log(`✅ Successfully proxied: ${url}`);
    
  } catch (error) {
    console.error(`❌ Proxy failed for ${url}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to fetch image',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Image proxy server running on http://localhost:${PORT}`);
  console.log(`📖 Usage: http://localhost:${PORT}/proxy-image?url=<IMAGE_URL>`);
});

module.exports = app;
