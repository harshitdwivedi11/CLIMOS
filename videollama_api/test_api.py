import requests
import os
from moviepy.editor import ColorClip

# --- Configuration ---
API_BASE_URL = "http://localhost:5010"
TEST_VIDEO_FILENAME = "test_video.mp4"

def create_dummy_video(filename="dummy_video.mp4", duration=3, fps=24):
    """Creates a short, silent, black-screen MP4 video file for testing."""
    print(f"Creating dummy video: {filename}...")
    try:
        size = (640, 480)
        clip = ColorClip(size=size, color=(0, 0, 0), duration=duration)
        clip.write_videofile(filename, fps=fps, logger=None)
        print("Dummy video created successfully.")
        return True
    except Exception as e:
        print(f"Error creating dummy video: {e}")
        print("Please ensure 'moviepy' and its dependencies (like imageio-ffmpeg) are installed.")
        return False

def test_health_check():
    """Tests the /health endpoint."""
    print("\n--- Testing Health Check Endpoint ---")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        response.raise_for_status()
        print("Health check PASSED.")
        print("Response:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Health check FAILED: {e}")
        print("Is the 'videollama_api.py' server running?")

def test_analyze_endpoint():
    """Tests the /analyze endpoint with a dummy video."""
    print("\n--- Testing Analyze Endpoint ---")
    
    # 1. Create a dummy video file for the test
    if not create_dummy_video(TEST_VIDEO_FILENAME):
        print("Skipping analyze endpoint test due to video creation failure.")
        return

    # 2. Send the request
    try:
        with open(TEST_VIDEO_FILENAME, 'rb') as f:
            files = {'file': (TEST_VIDEO_FILENAME, f, 'video/mp4')}
            print("Sending video to /analyze endpoint (this may take a few minutes)...")
            response = requests.post(f"{API_BASE_URL}/analyze", files=files, timeout=600)
        
        response.raise_for_status()
        
        print("Analyze endpoint PASSED.")
        print("Server Response:")
        print(response.json())

    except requests.exceptions.Timeout:
        print("Analyze endpoint FAILED: The request timed out.")
        print("This could be due to a slow model loading process or a very long analysis time.")
    except requests.exceptions.RequestException as e:
        print(f"Analyze endpoint FAILED: {e}")
        try:
            # Try to print the error from the server if available
            print("Server Error:", e.response.json())
        except Exception:
            pass
    finally:
        # 3. Clean up the dummy video file
        if os.path.exists(TEST_VIDEO_FILENAME):
            os.remove(TEST_VIDEO_FILENAME)
            print(f"\nCleaned up dummy video: {TEST_VIDEO_FILENAME}")

if __name__ == "__main__":
    print("===============================")
    print("  Video-LLaMA API Test Script  ")
    print("===============================")
    test_health_check()
    test_analyze_endpoint()
    print("\n--- Test Complete ---") 