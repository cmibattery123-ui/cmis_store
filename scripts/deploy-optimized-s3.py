#!/usr/bin/env python3
import os
import glob
import gzip
import subprocess
import mimetypes
import shutil

BUCKET = os.environ.get("S3_STATIC_BUCKET", "cmibattery-static-7099")
REGION = os.environ.get("AWS_REGION", "ap-south-1")

print("====================================================================")
print(f"🚀 Deploying High-Speed Compressed Assets to s3://{BUCKET}...")
print("====================================================================")

temp_dir = "/tmp/s3_compressed"
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
os.makedirs(temp_dir, exist_ok=True)

# 1. Compress & Sync HTML Pages
html_files = glob.glob(".next/server/app/**/*.html", recursive=True)
print(f"📦 Compressing and uploading {len(html_files)} static HTML pages...")
for hf in html_files:
    rel = os.path.relpath(hf, ".next/server/app")
    dest_gz = os.path.join(temp_dir, rel + ".gz")
    os.makedirs(os.path.dirname(dest_gz), exist_ok=True)
    with open(hf, 'rb') as f_in, gzip.open(dest_gz, 'wb', compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)
    
    s3_key = f"s3://{BUCKET}/{rel}"
    subprocess.run([
        "aws", "s3", "cp", dest_gz, s3_key,
        "--content-type", "text/html",
        "--content-encoding", "gzip",
        "--cache-control", "public, max-age=3600",
        "--region", REGION
    ], check=True, stdout=subprocess.DEVNULL)

    # Clean URL upload (e.g. products.html -> products) for extensionless S3 website URLs
    if rel.endswith(".html"):
        clean_rel = rel[:-5]
        if clean_rel != "index" and not clean_rel.endswith("/index"):
            clean_s3_key = f"s3://{BUCKET}/{clean_rel}"
            subprocess.run([
                "aws", "s3", "cp", dest_gz, clean_s3_key,
                "--content-type", "text/html",
                "--content-encoding", "gzip",
                "--cache-control", "public, max-age=3600",
                "--region", REGION
            ], check=True, stdout=subprocess.DEVNULL)

# 2. Compress & Sync .next/static (JS, CSS, Media)
static_files = glob.glob(".next/static/**/*", recursive=True)
static_files = [f for f in static_files if os.path.isfile(f)]
print(f"📦 Compressing and uploading {len(static_files)} static Next.js build assets...")

for sf in static_files:
    rel = os.path.relpath(sf, ".next/static")
    s3_key = f"s3://{BUCKET}/_next/static/{rel}"
    ext = os.path.splitext(sf)[1].lower()
    
    ctype, _ = mimetypes.guess_type(sf)
    if ext == '.js':
        ctype = 'text/javascript'
    elif ext == '.css':
        ctype = 'text/css'
    elif not ctype:
        ctype = 'application/octet-stream'
        
    if ext in ['.js', '.css', '.svg', '.json']:
        dest_gz = os.path.join(temp_dir, rel + ".gz")
        os.makedirs(os.path.dirname(dest_gz), exist_ok=True)
        with open(sf, 'rb') as f_in, gzip.open(dest_gz, 'wb', compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)
            
        subprocess.run([
            "aws", "s3", "cp", dest_gz, s3_key,
            "--content-type", ctype,
            "--content-encoding", "gzip",
            "--cache-control", "public, max-age=31536000, immutable",
            "--region", REGION
        ], check=True, stdout=subprocess.DEVNULL)
    else:
        subprocess.run([
            "aws", "s3", "cp", sf, s3_key,
            "--content-type", ctype,
            "--cache-control", "public, max-age=31536000, immutable",
            "--region", REGION
        ], check=True, stdout=subprocess.DEVNULL)

# 3. Upload public directory assets (Optimized Images)
public_files = glob.glob("public/**/*", recursive=True)
public_files = [f for f in public_files if os.path.isfile(f)]
print(f"📦 Uploading {len(public_files)} optimized public assets...")

for pf in public_files:
    rel = os.path.relpath(pf, "public")
    s3_key = f"s3://{BUCKET}/{rel}"
    ext = os.path.splitext(pf)[1].lower()
    ctype, _ = mimetypes.guess_type(pf)
    if not ctype:
        ctype = 'application/octet-stream'
        
    if ext in ['.svg', '.json', '.txt']:
        dest_gz = os.path.join(temp_dir, "pub_" + rel + ".gz")
        os.makedirs(os.path.dirname(dest_gz), exist_ok=True)
        with open(pf, 'rb') as f_in, gzip.open(dest_gz, 'wb', compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)
        subprocess.run([
            "aws", "s3", "cp", dest_gz, s3_key,
            "--content-type", ctype,
            "--content-encoding", "gzip",
            "--cache-control", "public, max-age=86400",
            "--region", REGION
        ], check=True, stdout=subprocess.DEVNULL)
    else:
        subprocess.run([
            "aws", "s3", "cp", pf, s3_key,
            "--content-type", ctype,
            "--cache-control", "public, max-age=86400",
            "--region", REGION
        ], check=True, stdout=subprocess.DEVNULL)

shutil.rmtree(temp_dir, ignore_errors=True)
print("\n====================================================================")
print("🎉 ALL ASSETS COMPRESSED & DEPLOYED SUCCESSFULLY TO S3!")
print("====================================================================")
