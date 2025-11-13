"""
Generate Bug Ball Blitz Android App Icon
Creates all required mipmap sizes with game-themed design
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """Create a single icon at the specified size"""
    # Create image with purple gradient background
    img = Image.new('RGB', (size, size), color='#1a0033')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (purple to darker purple)
    for y in range(size):
        # Gradient from #1a0033 to #0d001a
        r = int(26 - (y / size) * 13)
        g = int(0)
        b = int(51 - (y / size) * 25)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # Add circular glow effect in center
    center_x, center_y = size // 2, size // 2
    glow_radius = int(size * 0.4)
    for i in range(glow_radius, 0, -1):
        opacity = int((glow_radius - i) / glow_radius * 60)
        color = (138 + opacity, 43 + opacity, 226 + opacity)
        draw.ellipse([center_x - i, center_y - i, center_x + i, center_y + i], 
                     outline=color, width=2)
    
    # Draw soccer ball (white circle with black pentagons)
    ball_size = int(size * 0.35)
    ball_x = center_x
    ball_y = int(size * 0.55)
    
    # White ball background
    draw.ellipse([ball_x - ball_size, ball_y - ball_size, 
                  ball_x + ball_size, ball_y + ball_size], 
                 fill='white', outline='#cccccc', width=max(2, size // 100))
    
    # Black pentagon pattern (simplified)
    pentagon_size = int(ball_size * 0.3)
    # Center pentagon
    draw.regular_polygon((ball_x, ball_y, pentagon_size), 5, rotation=0, fill='black')
    
    # Small pentagons around
    for angle in [0, 72, 144, 216, 288]:
        import math
        offset = ball_size * 0.6
        px = ball_x + int(offset * math.cos(math.radians(angle - 90)))
        py = ball_y + int(offset * math.sin(math.radians(angle - 90)))
        small_pent = int(pentagon_size * 0.4)
        draw.regular_polygon((px, py, small_pent), 5, rotation=angle, fill='black')
    
    # Draw bug (ladybug style) at top
    bug_size = int(size * 0.25)
    bug_x = center_x
    bug_y = int(size * 0.25)
    
    # Bug shadow
    shadow_offset = max(2, size // 60)
    draw.ellipse([bug_x - bug_size - shadow_offset, bug_y - bug_size // 2 - shadow_offset + bug_size // 4,
                  bug_x + bug_size - shadow_offset, bug_y + bug_size // 2 - shadow_offset + bug_size // 4],
                 fill=(0, 0, 0, 100))
    
    # Bug body (red ladybug)
    draw.ellipse([bug_x - bug_size, bug_y - bug_size // 2,
                  bug_x + bug_size, bug_y + bug_size // 2],
                 fill='#ff4444', outline='#cc0000', width=max(2, size // 80))
    
    # Bug head (black)
    head_size = int(bug_size * 0.6)
    draw.ellipse([bug_x - head_size // 2, bug_y - bug_size // 2 - head_size // 2,
                  bug_x + head_size // 2, bug_y - bug_size // 2 + head_size // 2],
                 fill='#2d2d2d', outline='#000000', width=max(1, size // 100))
    
    # Bug spots (black dots on body)
    spot_size = int(bug_size * 0.15)
    spot_positions = [
        (bug_x - bug_size // 2, bug_y - bug_size // 4),
        (bug_x + bug_size // 2, bug_y - bug_size // 4),
        (bug_x - bug_size // 3, bug_y + bug_size // 6),
        (bug_x + bug_size // 3, bug_y + bug_size // 6),
    ]
    for spot_x, spot_y in spot_positions:
        draw.ellipse([spot_x - spot_size, spot_y - spot_size,
                      spot_x + spot_size, spot_y + spot_size],
                     fill='black')
    
    # Bug eyes (white with black pupils)
    eye_size = int(head_size * 0.2)
    pupil_size = int(eye_size * 0.5)
    eye_offset = int(head_size * 0.2)
    
    # Left eye
    draw.ellipse([bug_x - eye_offset - eye_size, bug_y - bug_size // 2 - eye_size // 2,
                  bug_x - eye_offset + eye_size, bug_y - bug_size // 2 + eye_size // 2],
                 fill='white')
    draw.ellipse([bug_x - eye_offset - pupil_size, bug_y - bug_size // 2 - pupil_size // 2,
                  bug_x - eye_offset + pupil_size, bug_y - bug_size // 2 + pupil_size // 2],
                 fill='black')
    
    # Right eye
    draw.ellipse([bug_x + eye_offset - eye_size, bug_y - bug_size // 2 - eye_size // 2,
                  bug_x + eye_offset + eye_size, bug_y - bug_size // 2 + eye_size // 2],
                 fill='white')
    draw.ellipse([bug_x + eye_offset - pupil_size, bug_y - bug_size // 2 - pupil_size // 2,
                  bug_x + eye_offset + pupil_size, bug_y - bug_size // 2 + pupil_size // 2],
                 fill='black')
    
    # Add neon glow border
    border_width = max(3, size // 40)
    draw.rectangle([0, 0, size - 1, size - 1], 
                   outline='#8a2be2', width=border_width)
    
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
