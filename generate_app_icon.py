"""
Generate Bug Ball Blitz Android App Icon
Creates all required mipmap sizes with game-themed design
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math
from pathlib import Path

def load_source_icon():
    """Return a PIL image if a user-provided icon exists at assets/app_icon.png.
    The image is center-cropped to square with alpha preserved."""
    src_path = Path('assets/app_icon.png')
    if src_path.exists():
        img = Image.open(src_path).convert('RGBA')
        w, h = img.size
        # center-crop to square
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        img = img.crop((left, top, left + side, top + side))
        return img
    return None

def create_icon(size):
    """Create a single icon at the specified size.
    If a user-provided source icon exists at assets/app_icon.png, use it; otherwise
    fall back to generating a clean soccer ball on a dark background."""
    src = load_source_icon()
    if src is not None:
        # Resize source to target size with high-quality downsampling
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        src_resized = src.resize((size, size), Image.LANCZOS)
        img.paste(src_resized, (0, 0), src_resized)
        # Add subtle rounding for legacy non-adaptive icons
        mask = Image.new('L', (size, size), 0)
        mdraw = ImageDraw.Draw(mask)
        radius = max(6, size // 10)
        mdraw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
        out = Image.new('RGBA', (size, size), (26, 26, 46, 255))
        out.paste(img, (0, 0), mask)
        return out.convert('RGBA')

    # Fallback: render soccer ball icon programmatically
    img = Image.new('RGBA', (size, size), color=(26, 26, 46, 255))
    draw = ImageDraw.Draw(img)
    center_x, center_y = size // 2, size // 2
    # Ball
    ball_size = int(size * 0.42)
    draw.ellipse([center_x - ball_size, center_y - ball_size,
                  center_x + ball_size, center_y + ball_size], fill='#ffffff')
    # Center hexagon
    hex_size = int(ball_size * 0.22)
    points = []
    for i in range(6):
        angle = math.radians(i * 60)
        x = center_x + hex_size * math.cos(angle)
        y = center_y + hex_size * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill='#000000')
    return img

def create_round_icon(size):
    """Create a round icon (for Android adaptive icons)"""
    img = create_icon(size)
    
    # Create circular mask
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, size, size], fill=255)
    
    # Apply mask
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    
    return output

# Icon sizes for Android
sizes = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

# Base path
base_path = 'android/app/src/main/res'

print("🐛⚽ Generating Bug Ball Blitz App Icons...")
print("=" * 50)

for density, size in sizes.items():
    # Create directory if it doesn't exist
    dir_path = os.path.join(base_path, f'mipmap-{density}')
    os.makedirs(dir_path, exist_ok=True)
    
    # Generate standard icon
    icon = create_icon(size)
    icon_path = os.path.join(dir_path, 'ic_launcher.png')
    icon.save(icon_path)
    print(f"✓ Created {icon_path} ({size}x{size})")
    
    # Generate round icon
    round_icon = create_round_icon(size)
    round_path = os.path.join(dir_path, 'ic_launcher_round.png')
    round_icon.save(round_path)
    print(f"✓ Created {round_path} ({size}x{size})")
    
    # Generate foreground (for adaptive icons)
    foreground = create_icon(size)
    fg_path = os.path.join(dir_path, 'ic_launcher_foreground.png')
    foreground.save(fg_path)
    print(f"✓ Created {fg_path} ({size}x{size})")

print("=" * 50)
print("✅ All app icons generated successfully!")
print("\nNext steps:")
print("1. Rebuild the APK: cd android && .\\gradlew.bat assembleDebug")
print("2. Install on device to see the new icon")
