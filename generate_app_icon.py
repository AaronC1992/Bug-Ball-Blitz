"""
Generate Bug Ball Blitz Android App Icon
Creates all required mipmap sizes with game-themed design
"""
from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_icon(size):
    """Create a single icon at the specified size"""
    # Create image with clean gradient background
    img = Image.new('RGB', (size, size), color='#0a0a1a')
    draw = ImageDraw.Draw(img)
    
    # Draw smooth gradient background (green grass field to sky blue)
    center_x, center_y = size // 2, size // 2
    
    for y in range(size):
        # Top to bottom: sky blue to grass green
        ratio = y / size
        if ratio < 0.5:  # Sky portion
            r = int(50 + ratio * 60)
            g = int(150 + ratio * 50)
            b = int(255 - ratio * 30)
        else:  # Grass portion
            adjusted_ratio = (ratio - 0.5) * 2
            r = int(20 + adjusted_ratio * 30)
            g = int(150 + adjusted_ratio * 50)
            b = int(20 + adjusted_ratio * 30)
        
        for x in range(size):
            img.putpixel((x, y), (r, g, b))
    
    # Draw stadium field lines
    line_color = (255, 255, 255, 60)
    line_width = max(2, size // 60)
    
    # Center circle
    circle_radius = int(size * 0.15)
    draw.ellipse([center_x - circle_radius, center_y - circle_radius,
                  center_x + circle_radius, center_y + circle_radius],
                 outline=(255, 255, 255), width=line_width)
    
    # Draw soccer ball - larger and cleaner
    ball_size = int(size * 0.35)
    ball_x = center_x
    ball_y = int(center_y * 0.85)
    
    # Ball shadow
    shadow_offset = max(4, size // 35)
    shadow_blur = 3
    for i in range(shadow_blur):
        alpha = 40 - (i * 10)
        draw.ellipse([ball_x - ball_size + shadow_offset + i, 
                      ball_y - ball_size + shadow_offset + i,
                      ball_x + ball_size + shadow_offset + i, 
                      ball_y + ball_size + shadow_offset + i],
                     fill=(0, 0, 0, alpha))
    
    # White ball base with glossy effect
    draw.ellipse([ball_x - ball_size, ball_y - ball_size,
                  ball_x + ball_size, ball_y + ball_size],
                 fill='#ffffff')
    
    # Add 3D glossy highlight
    highlight_offset_x = int(ball_size * -0.25)
    highlight_offset_y = int(ball_size * -0.25)
    highlight_size = int(ball_size * 0.5)
    
    for i in range(highlight_size, 0, -2):
        alpha = int((i / highlight_size) * 80)
        h_x = ball_x + highlight_offset_x
        h_y = ball_y + highlight_offset_y
        draw.ellipse([h_x - i, h_y - i, h_x + i, h_y + i],
                     fill=(255, 255, 255, alpha))
    
    # Draw simplified soccer ball pattern (hexagons)
    hex_size = int(ball_size * 0.2)
    
    # Center hexagon
    points = []
    for i in range(6):
        angle = math.radians(i * 60)
        x = ball_x + hex_size * math.cos(angle)
        y = ball_y + hex_size * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill='#000000')
    
    # Draw 6 surrounding partial hexagons
    for sector in range(6):
        angle_offset = sector * 60
        dist = ball_size * 0.55
        offset_angle = math.radians(angle_offset)
        px = ball_x + dist * math.cos(offset_angle)
        py = ball_y + dist * math.sin(offset_angle)
        
        points = []
        h_size = int(hex_size * 0.7)
        for i in range(6):
            angle = math.radians(i * 60 + angle_offset)
            x = px + h_size * math.cos(angle)
            y = py + h_size * math.sin(angle)
            points.append((x, y))
        draw.polygon(points, fill='#1a1a1a')
    
    # Draw vibrant ladybug mascot
    bug_size = int(size * 0.28)
    bug_x = center_x
    bug_y = int(center_y * 0.35)
    
    # Bug shadow
    shadow_size = int(bug_size * 1.1)
    draw.ellipse([bug_x - shadow_size, bug_y - shadow_size//2 + size//40,
                  bug_x + shadow_size, bug_y + shadow_size//2 + size//40],
                 fill=(0, 0, 0, 50))
    
    # Bug body - bright red with gradient
    body_color_bright = (255, 50, 50)
    body_color_dark = (200, 20, 20)
    
    # Draw body with gradient effect
    for i in range(10):
        ratio = i / 10
        r = int(body_color_bright[0] - (body_color_bright[0] - body_color_dark[0]) * ratio)
        g = int(body_color_bright[1] - (body_color_bright[1] - body_color_dark[1]) * ratio)
        b_val = int(body_color_bright[2] - (body_color_bright[2] - body_color_dark[2]) * ratio)
        offset = int(bug_size * ratio * 0.1)
        
        draw.ellipse([bug_x - bug_size + offset, bug_y - bug_size//2 + offset,
                      bug_x + bug_size - offset, bug_y + bug_size//2 - offset],
                     fill=(r, g, b_val))
    
    # Wing separation line
    draw.line([bug_x, bug_y - bug_size//2, bug_x, bug_y + bug_size//2],
              fill='#000000', width=max(2, size//80))
    
    # Bug head - black and shiny
    head_size = int(bug_size * 0.6)
    draw.ellipse([bug_x - head_size//2, bug_y - bug_size//2 - head_size//3,
                  bug_x + head_size//2, bug_y - bug_size//2 + head_size//2],
                 fill='#000000')
    
    # Head shine
    shine_x = bug_x - head_size//4
    shine_y = bug_y - bug_size//2 - head_size//6
    shine_size = int(head_size * 0.15)
    draw.ellipse([shine_x - shine_size, shine_y - shine_size,
                  shine_x + shine_size, shine_y + shine_size],
                 fill='#ffffff')
    
    # Bug spots - larger and more visible
    spot_size = int(bug_size * 0.25)
    spots = [
        (bug_x - bug_size//2, bug_y - bug_size//5),
        (bug_x + bug_size//2, bug_y - bug_size//5),
        (bug_x - bug_size//2, bug_y + bug_size//5),
        (bug_x + bug_size//2, bug_y + bug_size//5),
    ]
    for spot_x, spot_y in spots:
        draw.ellipse([spot_x - spot_size, spot_y - spot_size,
                      spot_x + spot_size, spot_y + spot_size],
                     fill='#000000')
    
    # Antennae - thicker and more visible
    antenna_thickness = max(3, size//50)
    antenna_length = int(head_size * 1.2)
    
    # Left antenna
    draw.line([bug_x - head_size//3, bug_y - bug_size//2 - head_size//6,
               bug_x - head_size//2 - size//30, bug_y - bug_size//2 - antenna_length],
              fill='#000000', width=antenna_thickness)
    # Right antenna  
    draw.line([bug_x + head_size//3, bug_y - bug_size//2 - head_size//6,
               bug_x + head_size//2 + size//30, bug_y - bug_size//2 - antenna_length],
              fill='#000000', width=antenna_thickness)
    
    # Antenna tips
    tip_size = int(head_size * 0.2)
    draw.ellipse([bug_x - head_size//2 - size//30 - tip_size, 
                  bug_y - bug_size//2 - antenna_length - tip_size,
                  bug_x - head_size//2 - size//30 + tip_size, 
                  bug_y - bug_size//2 - antenna_length + tip_size],
                 fill='#ff6666')
    draw.ellipse([bug_x + head_size//2 + size//30 - tip_size, 
                  bug_y - bug_size//2 - antenna_length - tip_size,
                  bug_x + head_size//2 + size//30 + tip_size, 
                  bug_y - bug_size//2 - antenna_length + tip_size],
                 fill='#ff6666')
    
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
