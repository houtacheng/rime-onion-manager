#!/usr/bin/env python3
import os
import subprocess
import struct

SRC_IMAGE = "/Users/sunda/.gemini/antigravity/brain/743d3578-aece-4a5c-b71a-4a9c513f0002/.user_uploaded/media_1790449426621.png"
ROOT_DIR = "/Users/sunda/Documents/rime-onion-manager"

os.chdir(ROOT_DIR)
os.makedirs("build", exist_ok=True)
os.makedirs("build/icon.iconset", exist_ok=True)
os.makedirs("assets", exist_ok=True)
os.makedirs("public", exist_ok=True)

def resize(src, dest, width, height):
    subprocess.run(["sips", "-z", str(height), str(width), src, "--out", dest], check=True, stdout=subprocess.DEVNULL)

print("Resizing icons for macOS iconset...")
iconset_map = [
    ('icon_16x16.png', 16),
    ('icon_16x16@2x.png', 32),
    ('icon_32x32.png', 32),
    ('icon_32x32@2x.png', 64),
    ('icon_128x128.png', 128),
    ('icon_128x128@2x.png', 256),
    ('icon_256x256.png', 256),
    ('icon_256x256@2x.png', 512),
    ('icon_512x512.png', 512),
    ('icon_512x512@2x.png', 1024),
]

for filename, size in iconset_map:
    dest = os.path.join("build/icon.iconset", filename)
    resize(SRC_IMAGE, dest, size, size)

print("Generating build/icon.icns via iconutil...")
subprocess.run(["iconutil", "-c", "icns", "build/icon.iconset", "-o", "build/icon.icns"], check=True)

print("Generating build/icon.png, assets/tray.png, and public/onion.png...")
resize(SRC_IMAGE, "build/icon.png", 512, 512)
resize(SRC_IMAGE, "assets/tray.png", 32, 32)
resize(SRC_IMAGE, "public/onion.png", 512, 512)

print("Generating multi-resolution build/icon.ico for Windows...")
ico_sizes = [16, 32, 48, 64, 128, 256]
ico_images = []
for s in ico_sizes:
    tmp_path = f"/tmp/onion_ico_{s}.png"
    resize(SRC_IMAGE, tmp_path, s, s)
    with open(tmp_path, "rb") as f:
        data = f.read()
    ico_images.append((s, s, data))

ico_header = struct.pack('<HHH', 0, 1, len(ico_images))
entries = bytearray()
data_offset = 6 + len(ico_images) * 16

image_datas = bytearray()
for w, h, data in ico_images:
    width_byte = 0 if w >= 256 else w
    height_byte = 0 if h >= 256 else h
    entries.extend(struct.pack('<BBBBHHII', width_byte, height_byte, 0, 0, 1, 32, len(data), data_offset + len(image_datas)))
    image_datas.extend(data)

with open("build/icon.ico", "wb") as f:
    f.write(ico_header + entries + image_datas)

print("All app icons updated successfully!")
