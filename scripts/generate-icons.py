import zlib
import struct
import math

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
    # Normalized coordinates (-1.0 to 1.0)
    nx = (x - w / 2) / (w * 0.44)
    ny = (y - h * 0.54) / (h * 0.42)

    # Onion bulb shape: round bottom, tapering at top
    # Teardrop / onion math
    r_bottom = nx**2 + (ny - 0.1)**2
    # Sprout / stem on top
    is_stem = False
    if -0.2 < nx < 0.2 and -1.3 < ny < -0.6:
        is_stem = True

    # Check bulb
    # teardrop shape distortion
    taper = 1.0 + 0.5 * max(0.0, -ny)
    dist = (nx * taper)**2 + ny**2

    if dist <= 0.95:
        # Inside onion bulb
        # Amber / onion layers gradient
        dist_factor = math.sqrt(dist)
        # Vertical onion stripes
        stripes = 0.5 + 0.5 * math.cos(nx * 12.0)
        
        r = int(min(255, 230 - 40 * dist_factor + 25 * stripes))
        g = int(min(255, 145 - 50 * dist_factor + 20 * stripes))
        b = int(min(255, 30 + 30 * dist_factor))
        a = 255
        if dist > 0.85:
            # Smooth anti-aliased edge
            a = int(255 * (0.95 - dist) / 0.10)
        return (r, g, b, a)

    elif is_stem:
        # Green sprout on top
        stem_dist = math.sqrt(nx**2 + (ny + 0.95)**2)
        r = 50
        g = int(180 - 40 * (ny + 0.6))
        b = 70
        return (r, min(255, max(0, g)), b, 255)

    return (0, 0, 0, 0)

# Generate 256x256, 64x64, 32x32, 16x16
png_256 = create_png(256, 256, onion_art)
png_64 = create_png(64, 64, onion_art)
png_32 = create_png(32, 32, onion_art)
png_16 = create_png(16, 16, onion_art)

with open('build/icon.png', 'wb') as f:
    f.write(png_256)
with open('assets/tray.png', 'wb') as f:
    f.write(png_32)
with open('public/onion.png', 'wb') as f:
    f.write(png_64)

# Create multi-resolution ICO file for Windows
images = [
    (16, 16, png_16),
    (32, 32, png_32),
    (64, 64, png_64),
    (256, 256, png_256)
]

ico_header = struct.pack('<HHH', 0, 1, len(images))
entries = bytearray()
data_offset = 6 + len(images) * 16

image_datas = bytearray()
for w, h, data in images:
    width_byte = 0 if w >= 256 else w
    height_byte = 0 if h >= 256 else h
    entries.extend(struct.pack('<BBBBHHII', width_byte, height_byte, 0, 0, 1, 32, len(data), data_offset + len(image_datas)))
    image_datas.extend(data)

ico_bytes = ico_header + entries + image_datas
with open('build/icon.ico', 'wb') as f:
    f.write(ico_bytes)

print('Successfully generated build/icon.ico and build/icon.png')
