const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function analyzeVideoWithLLaMA(videoPath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(videoPath));

    try {
        const response = await axios.post(
            'http://localhost:5010/analyze',
            formData,
            { headers: formData.getHeaders(), timeout: 1000 * 600 }
        );
        return response.data.result;
    } catch (err) {
        console.error('Video-LLaMA API error:', err?.response?.data || err.message);
        throw err;
    }
}

module.exports = { analyzeVideoWithLLaMA };