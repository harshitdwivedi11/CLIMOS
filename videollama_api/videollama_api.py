import os
import uuid
import json
import subprocess
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'tmp_uploads'))
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_output(output):
    """Clean and format the model output."""
    try:
        # Remove any system messages or prefixes
        if "###Assistant:" in output:
            output = output.split("###Assistant:", 1)[1]
        # Clean up whitespace
        output = output.strip()
        return output
    except Exception:
        return output

@app.route('/analyze', methods=['POST'])
def analyze():
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': f'File type not allowed. Supported types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    try:
        # Save file with secure filename
        filename = secure_filename(str(uuid.uuid4()) + os.path.splitext(file.filename)[1])
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Run Video-LLaMA
        cmd = [
            'python', 'demo_audiovideo.py',
            '--cfg-path', 'eval_configs/video_llama_eval_withaudio.yaml',
            '--video-path', filepath,
            '--model_type', 'llama_v2',
            '--gpu-id', '0'
        ]

        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=600,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )

        # Check for errors
        if result.returncode != 0:
            error_msg = result.stderr.strip()
            raise Exception(f"Video-LLaMA process failed: {error_msg}")

        # Process output
        output = clean_output(result.stdout.strip())
        
        return jsonify({
            'result': output,
            'status': 'success'
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            'error': 'Analysis timeout - video processing took too long',
            'status': 'timeout'
        }), 504

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

    finally:
        # Clean up uploaded file
        if 'filepath' in locals() and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Warning: Failed to delete temporary file {filepath}: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the service is running."""
    return jsonify({
        'status': 'healthy',
        'service': 'video-llama-api'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010)