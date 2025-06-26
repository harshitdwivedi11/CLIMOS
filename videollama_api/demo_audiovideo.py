import os
import torch
import argparse
from PIL import Image
import numpy as np
from decord import VideoReader, cpu
from transformers import AutoProcessor, AutoModelForCausalLM
from video_llama.models import get_model
from video_llama.processors import get_processor
import yaml

def load_config(cfg_path):
    with open(cfg_path, 'r') as f:
        return yaml.safe_load(f)

def load_video(video_path, num_frames=32):
    vr = VideoReader(video_path, ctx=cpu(0))
    total_frames = len(vr)
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    video_frames = vr.get_batch(indices).asnumpy()
    return [Image.fromarray(frame) for frame in video_frames]

def process_audio(video_path, processor, max_length=30):
    import av
    container = av.open(video_path)
    audio = next(s for s in container.streams if s.type == 'audio')
    resampler = av.AudioResampler(
        format='s16',
        layout='mono',
        rate=16000
    )
    audio_frames = []
    for frame in container.decode(audio):
        frame.pts = None
        audio_frames.extend(resampler.resample(frame))
    
    audio_data = np.concatenate([f.to_ndarray() for f in audio_frames])
    if len(audio_data) > max_length * 16000:
        audio_data = audio_data[:max_length * 16000]
    return processor(audio_data, sampling_rate=16000).input_features

def main(args):
    # Load configuration
    config = load_config(args.cfg_path)
    
    # Initialize model and processor
    model = get_model(config['model'])
    processor = get_processor(config['model'])
    
    if args.gpu_id is not None:
        model = model.to(f'cuda:{args.gpu_id}')
    
    # Load and process video
    video_frames = load_video(args.video_path, config['model']['video_frames'])
    
    # Process audio if available
    try:
        audio_features = process_audio(
            args.video_path,
            processor,
            config['preprocess']['audio']['max_length']
        )
    except Exception as e:
        print(f"Warning: Could not process audio: {e}")
        audio_features = None
    
    # Prepare inputs
    inputs = processor(
        images=video_frames,
        audio_features=audio_features,
        return_tensors="pt"
    )
    
    if args.gpu_id is not None:
        inputs = {k: v.to(f'cuda:{args.gpu_id}') for k, v in inputs.items()}
    
    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=config['generation']['max_new_tokens'],
            num_beams=config['generation']['num_beams'],
            temperature=config['generation']['temperature'],
            top_p=config['generation']['top_p'],
            repetition_penalty=config['generation']['repetition_penalty'],
            length_penalty=config['generation']['length_penalty'],
            no_repeat_ngram_size=config['generation']['no_repeat_ngram_size']
        )
    
    # Decode and print response
    response = processor.decode(outputs[0], skip_special_tokens=True)
    print(response)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--cfg-path', required=True, help='Path to config file')
    parser.add_argument('--video-path', required=True, help='Path to video file')
    parser.add_argument('--model_type', default='llama_v2', help='Model type')
    parser.add_argument('--gpu-id', type=int, help='GPU ID to use')
    args = parser.parse_args()
    main(args)
