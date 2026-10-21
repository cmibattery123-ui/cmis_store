#!/usr/bin/env python3
import os
import glob
from PIL import Image

def optimize_image(filepath):
    orig_size = os.path.getsize(filepath)
    ext = os.path.splitext(filepath)[1].lower()
    
    try:
        with Image.open(filepath) as img:
            w, h = img.size
            
            # Determine max dimension
            max_dim = 1920
            if "logo" in filepath.lower():
                max_dim = 800
            elif "thumbnail" in filepath.lower() or "member" in filepath.lower():
                max_dim = 600
                
            # Resize if exceeds max_dim
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                new_size = (int(w * scale), int(h * scale))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                
            temp_path = filepath + ".tmp"
            
            if ext in ['.jpg', '.jpeg']:
                # Convert to RGB if needed and save progressive optimized JPEG
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(temp_path, 'JPEG', quality=82, optimize=True, progressive=True)
            elif ext == '.png':
                if img.mode == 'RGBA':
                    # Use FastOctree quantization for huge RGBA logos/graphics
                    quantized = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
                    quantized.save(temp_path, 'PNG', optimize=True)
                else:
                    img.save(temp_path, 'PNG', optimize=True)
            else:
                return 0, 0
                
            new_size = os.path.getsize(temp_path)
            if new_size < orig_size:
                os.replace(temp_path, filepath)
                saved = orig_size - new_size
                print(f"✅ {filepath}: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (-{saved/orig_size*100:.1f}%)")
                return orig_size, new_size
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return orig_size, orig_size
    except Exception as e:
        print(f"⚠️ Error optimizing {filepath}: {e}")
        return orig_size, orig_size

def main():
    print("🚀 Starting Image Optimization for public/assets...")
    patterns = ['public/assets/**/*.png', 'public/assets/**/*.jpg', 'public/assets/**/*.jpeg', 'public/*.png']
    all_files = []
    for pat in patterns:
        all_files.extend(glob.glob(pat, recursive=True))
        
    all_files = sorted(set(all_files))
    total_before = 0
    total_after = 0
    
    for f in all_files:
        before, after = optimize_image(f)
        total_before += before
        total_after += after
        
    saved = total_before - total_after
    print("\n====================================================================")
    print(f"🎉 Optimization Complete!")
    print(f"Original Size: {total_before / (1024*1024):.2f} MB")
    print(f"Optimized Size: {total_after / (1024*1024):.2f} MB")
    print(f"Saved: {saved / (1024*1024):.2f} MB (-{saved/total_before*100:.1f}%)")
    print("====================================================================")

if __name__ == '__main__':
    main()
