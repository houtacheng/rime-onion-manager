import zlib
import struct
import math
import os
import subprocess

def create_png(width, height, pixel_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = pixel_func(x, y, width, height)
            raw_data.extend([r, g, b, a])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    png.extend(chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)))
    png.extend(chunk(b'IDAT', zlib.compress(bytes(raw_data), 9)))
    png.extend(chunk(b'IEND', b''))
    return bytes(png)

def onion_art(x, y, w, h):
    nx = (x - w / 2) / (w * 0.44)
    ny = (y - h * 0.54) / (h * 0.42)

    is_stem = False
    if -0.2 < nx < 0.2 and -1.3 < ny < -0.6:
        is_stem = True

    taper = 1.0 + 0.5 * max(0.0, -ny)
    dist = (nx * taper)**2 + ny**2

    if dist <= 0.95:
        dist_factor = math.sqrt(dist)
        stripes = 0.5 + 0.5 * math.cos(nx * 12.0)
        r = int(min(255, 230 - 40 * dist_factor + 25 * stripes))
        g = int(min(255, 145 - 50 * dist_factor + 20 * stripes))
        b = int(min(255, 30 + 30 * dist_factor))
        a = 255
        if dist > 0.85:
            a = int(255 * (0.95 - dist) / 0.10)
        return (r, g, b, a)

    elif is_stem:
        r = 50
        g = int(180 - 40 * (ny + 0.6))
        b = 70
        return (r, min(255, max(0, g)), b, 255)

    return (0, 0, 0, 0)

os.makedirs('build', exist_ok=True)
os.makedirs('assets', exist_ok=True)
os.makedirs('public', exist_ok=True)

# Generate various sizes
sizes = [16, 32, 64, 128, 256, 512, 1024]
png_by_size = {}
for s in sizes:
    png_by_size[s] = create_png(s, s, onion_art)

with open('build/icon.png', 'wb') as f:
    f.write(png_by_size[512])
with open('assets/tray.png', 'wb') as f:
    f.write(png_by_size[32])
with open('public/onion.png', 'wb') as f:
    f.write(png_by_size[64])

# Create multi-resolution ICO file for Windows
ico_images = [
    (16, 16, png_by_size[16]),
    (32, 32, png_by_size[32]),
    (64, 64, png_by_size[64]),
    (256, 256, png_by_size[256])
]

ico_header = struct.pack('<HHH', 0, 1, len(ico_images))
entries = bytearray()
data_offset = 6 + len(ico_images) * 16

image_datas = bytearray()
for w, h, data in ico_images:
    width_byte = 0 if w >= 256 else w
    height_byte = 0 if h >= 256 else h
    entries.extend(struct.pack('<BBBBHHII', width_byte, height_byte, 0, 0, 1, 32, len(data), data_offset + len(image_datas)))
    image_datas.extend(data)

ico_bytes = ico_header + entries + image_datas
with open('build/icon.ico', 'wb') as f:
    f.write(ico_bytes)

# Create macOS iconset and ICNS
iconset_dir = 'build/icon.iconset'
os.makedirs(iconset_dir, exist_ok=True)

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
    with open(os.path.join(iconset_dir, filename), 'wb') as f:
        f.write(png_by_size[size])

try:
    subprocess.run(['iconutil', '-c', 'icns', iconset_dir, '-o', 'build/icon.icns'], check=True)
    print('Successfully generated build/icon.icns')
except Exception as e:
    print('iconutil failed:', e)

print('Generated all icons (Windows ICO, macOS ICNS, PNG).')
