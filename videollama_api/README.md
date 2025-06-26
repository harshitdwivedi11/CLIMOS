# Video-LLaMA API

This is a Flask-based API wrapper for Video-LLaMA, enabling video analysis with audio support.

## Requirements

- CUDA-capable GPU
- Python 3.10
- FFmpeg
- Conda (recommended for environment management)

## Setup

1. Create and activate the conda environment:
```bash
conda env create -f environment.yml
conda activate videollama
```

2. Download required models:
   - Download Llama-2-13B-chat model from Meta
   - Download Video-LLaMA checkpoint
   - Download Whisper-small model for audio processing

3. Place the models in the following structure:
```
checkpoints/
├── llama-2-13b-chat/
│   └── (model files)
├── video_llama_13b_lora_v2.pth
└── whisper-small/
    └── (model files)
```

4. Create required directories:
```bash
mkdir -p tmp_uploads
mkdir -p checkpoints
```

## Running the API

Start the API server:
```bash
python videollama_api.py
```

The server will run on port 5010 by default.

## API Endpoints

### POST /analyze
Analyzes a video file with audio support.

- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - file: Video file (mp4, avi, mov, mkv)
- Max file size: 100MB
- Response: JSON with analysis result or error message

### GET /health
Health check endpoint.

- Method: GET
- Response: JSON with service status

## Error Handling

The API includes comprehensive error handling for:
- Invalid file types
- Missing files
- Processing timeouts (10 minutes)
- Model errors
- File system errors

## Testing the API

To verify that the API server is running correctly and that the models are properly configured, you can use the provided test script.

1.  **Make sure the API server is running in a separate terminal:**
    ```bash
    conda activate videollama
    python videollama_api.py
    ```

2.  **Run the test script in another terminal:**
    ```bash
    conda activate videollama
    python test_api.py
    ```

The script will:
-   Check the `/health` endpoint.
-   Generate a small, temporary video file (`test_video.mp4`).
-   Send this video to the `/analyze` endpoint.
-   Print the results and status of each test.
-   Automatically delete the temporary video file.

This is a good way to check if your model paths are correct and if the inference process works end-to-end.

## Integration with Node.js

The API is designed to work with the provided Node.js client in `videollamaClient.js`. 
Example usage:

``