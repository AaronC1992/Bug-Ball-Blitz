"""
Generate Bug Ball Blitz Android App Icon
Creates all required mipmap sizes with game-themed design
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_icon(size):
    """Create a single icon at the specified size"""
    # Create image with vibrant gradient background
    img = Image.new('RGB', (size, size), color='#1a0033')
    draw = ImageDraw.Draw(img)
    
    # Draw radial gradient background (dark purple center to lighter edges)
    center_x, center_y = size // 2, size // 2
    max_dist = math.sqrt(2) * size / 2
    
    for y in range(size):
        for x in range(size):
            # Calculate distance from center
            dist = math.sqrt((x - center_x)**2 + (y - center_y)**2)
            # Normalize distance (0 at center, 1 at corners)
            norm_dist = dist / max_dist
            
            # Create gradient from dark purple/blue to lighter
            r = int(10 + norm_dist * 100)  # 10 to 110
            g = int(5 + norm_dist * 80)     # 5 to 85
            b = int(50 + norm_dist * 150)   # 50 to 200
            
            img.putpixel((x, y), (r, g, b))
            img.putpixel((x, y), (r, g, b))
    
    # Draw large soccer ball in center
    ball_size = int(size * 0.42)
    ball_x = center_x
    ball_y = center_y
    
    # Ball shadow for depth
    shadow_offset = max(3, size // 40)
    draw.ellipse([ball_x - ball_size + shadow_offset, ball_y - ball_size + shadow_offset,
                  ball_x + ball_size + shadow_offset, ball_y + ball_size + shadow_offset],
                 fill=(0, 0, 0, 80))
    
    # White ball with subtle gradient
    for r_offset in range(ball_size, 0, -1):
        # Subtle shading from top-left (lighter) to bottom-right (darker)
        shade = 255 - int((ball_size - r_offset) / ball_size * 20)
        draw.ellipse([ball_x - r_offset, ball_y - r_offset,
                      ball_x + r_offset, ball_y + r_offset],
                     fill=(shade, shade, shade))
    
    # Draw classic soccer ball pentagon pattern
    pentagon_size = int(ball_size * 0.25)
    
    # Center pentagon
    points = []
    for i in range(5):
        angle = math.radians(i * 72 - 90)
        x = ball_x + pentagon_size * math.cos(angle)
        y = ball_y + pentagon_size * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill='#1a1a1a')
    
    # Surrounding pentagons (5 around center)
    for sector in range(5):
        angle_offset = sector * 72
        dist = ball_size * 0.55
        offset_angle = math.radians(angle_offset - 90)
        px = ball_x + dist * math.cos(offset_angle)
        py = ball_y + dist * math.sin(offset_angle)
        
        points = []
        pent_size = int(pentagon_size * 0.55)
        for i in range(5):
            angle = math.radians(i * 72 + angle_offset - 90)
            x = px + pent_size * math.cos(angle)
            y = py + pent_size * math.sin(angle)
            points.append((x, y))
        draw.polygon(points, fill='#2a2a2a')
    
    # Draw cute bug/beetle icon overlay
    bug_size = int(size * 0.2)
    bug_x = center_x + int(ball_size * 0.75)
    bug_y = center_y - int(ball_size * 0.75)
    
    # Bug body (red circle for ladybug style)
    draw.ellipse([bug_x - bug_size, bug_y - bug_size//2,
                  bug_x + bug_size, bug_y + bug_size//2],
                 fill='#ff4444', outline='#cc0000', width=max(2, size//100))
    
    # Bug head (black)
    head_size = int(bug_size * 0.5)
    draw.ellipse([bug_x - head_size//2, bug_y - bug_size//2 - head_size//2,
                  bug_x + head_size//2, bug_y - bug_size//2 + head_size//2],
                 fill='#1a1a1a')
    
    # Bug spots (black dots)
    spot_size = int(bug_size * 0.2)
    spots = [
        (bug_x - bug_size//2, bug_y),
        (bug_x + bug_size//2, bug_y),
        (bug_x, bug_y - bug_size//4)
    ]
    for spot_x, spot_y in spots:
        draw.ellipse([spot_x - spot_size, spot_y - spot_size,
                      spot_x + spot_size, spot_y + spot_size],
                     fill='#000000')
    
    # Antennae
    antenna_size = int(head_size * 0.3)
    draw.line([bug_x - head_size//3, bug_y - bug_size//2 - head_size//3,
               bug_x - head_size//2, bug_y - bug_size//2 - head_size],
              fill='#1a1a1a', width=max(1, size//150))
    draw.line([bug_x + head_size//3, bug_y - bug_size//2 - head_size//3,
               bug_x + head_size//2, bug_y - bug_size//2 - head_size],
              fill='#1a1a1a', width=max(1, size//150))
    
    # Antenna tips
    draw.ellipse([bug_x - head_size//2 - antenna_size, bug_y - bug_size//2 - head_size - antenna_size,
                  bug_x - head_size//2 + antenna_size, bug_y - bug_size//2 - head_size + antenna_size],
                 fill='#1a1a1a')
    draw.ellipse([bug_x + head_size//2 - antenna_size, bug_y - bug_size//2 - head_size - antenna_size,
                  bug_x + head_size//2 + antenna_size, bug_y - bug_size//2 - head_size + antenna_size],
                 fill='#1a1a1a')
    
    # Add circular border with neon glow effect
    border_width = max(4, size // 32)
    for i in range(3):
        glow_alpha = 100 - (i * 30)
        offset = i * 2
        draw.ellipse([offset, offset, size - offset - 1, size - offset - 1],
                     outline=(138, 43, 226, glow_alpha), width=border_width - i)
    
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
