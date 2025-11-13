"""
Generate Bug Ball Blitz Android App Icon
Creates all required mipmap sizes with game-themed design
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_icon(size):
    """Create a single icon at the specified size"""
    # Create image with simple dark background
    img = Image.new('RGB', (size, size), color='#1a1a2e')
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = size // 2, size // 2
    
    # Draw soccer ball - large and centered
    ball_size = int(size * 0.42)
    ball_x = center_x
    ball_y = center_y
    
    # Ball shadow for depth
    shadow_offset = max(5, size // 30)
    shadow_blur = 4
    for i in range(shadow_blur):
        alpha = 60 - (i * 15)
        draw.ellipse([ball_x - ball_size + shadow_offset + i*2, 
                      ball_y - ball_size + shadow_offset + i*2,
                      ball_x + ball_size + shadow_offset + i*2, 
                      ball_y + ball_size + shadow_offset + i*2],
                     fill=(0, 0, 0))
    
    # White ball base
    draw.ellipse([ball_x - ball_size, ball_y - ball_size,
                  ball_x + ball_size, ball_y + ball_size],
                 fill='#ffffff')
    
    # Add 3D glossy highlight
    highlight_offset_x = int(ball_size * -0.3)
    highlight_offset_y = int(ball_size * -0.3)
    highlight_size = int(ball_size * 0.6)
    
    for i in range(highlight_size, 0, -2):
        alpha = int((i / highlight_size) * 120)
        h_x = ball_x + highlight_offset_x
        h_y = ball_y + highlight_offset_y
        draw.ellipse([h_x - i, h_y - i, h_x + i, h_y + i],
                     fill=(255, 255, 255))
    
    # Draw classic soccer ball hexagon/pentagon pattern
    hex_size = int(ball_size * 0.22)
    
    # Center hexagon (black)
    points = []
    for i in range(6):
        angle = math.radians(i * 60)
        x = ball_x + hex_size * math.cos(angle)
        y = ball_y + hex_size * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill='#000000')
    
    # Draw 6 surrounding hexagons
    for sector in range(6):
        angle_offset = sector * 60
        dist = ball_size * 0.58
        offset_angle = math.radians(angle_offset)
        px = ball_x + dist * math.cos(offset_angle)
        py = ball_y + dist * math.sin(offset_angle)
        
        points = []
        h_size = int(hex_size * 0.75)
        for i in range(6):
            angle = math.radians(i * 60 + angle_offset)
            x = px + h_size * math.cos(angle)
            y = py + h_size * math.sin(angle)
            points.append((x, y))
        draw.polygon(points, fill='#1a1a1a')
    
    # Add connecting pentagons between hexagons
    pent_size = int(hex_size * 0.35)
    for sector in range(6):
        angle_offset = sector * 60 + 30
        dist = ball_size * 0.75
        offset_angle = math.radians(angle_offset)
        px = ball_x + dist * math.cos(offset_angle)
        py = ball_y + dist * math.sin(offset_angle)
        
        points = []
        for i in range(5):
            angle = math.radians(i * 72 + angle_offset - 90)
            x = px + pent_size * math.cos(angle)
            y = py + pent_size * math.sin(angle)
            points.append((x, y))
        draw.polygon(points, fill='#2a2a2a')
    
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
