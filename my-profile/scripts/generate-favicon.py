import os
from PIL import Image, ImageDraw

base_dir = r"c:\Users\admin\Documents\GitHub\Plymouth Projects\MyProfile\my-profile"
source_path = os.path.join(base_dir, "public", "ezgif-6916cc84d1500b24-jpg", "ezgif-frame-001.png")

print("Reading source:", source_path)
img = Image.open(source_path).convert("RGBA")

# Face crop parameters
crop_size = 650
x_center = 1275
y_center = 520
left = x_center - crop_size // 2
top = y_center - crop_size // 2
right = left + crop_size
bottom = top + crop_size

cropped = img.crop((left, top, right, bottom))

# High resolution icon
target_size = 512
resized = cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)

# Create circular mask with anti-aliasing
mask = Image.new("L", (target_size, target_size), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((4, 4, target_size - 5, target_size - 5), fill=255)

circular_img = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
circular_img.paste(resized, (0, 0), mask=mask)

# Add sleek modern indigo border ring
border_draw = ImageDraw.Draw(circular_img)
border_draw.ellipse((4, 4, target_size - 5, target_size - 5), outline=(99, 102, 241, 230), width=10)

# Save destinations
app_icon_png = os.path.join(base_dir, "src", "app", "icon.png")
app_apple_png = os.path.join(base_dir, "src", "app", "apple-icon.png")
app_favicon_ico = os.path.join(base_dir, "src", "app", "favicon.ico")

pub_icon_png = os.path.join(base_dir, "public", "icon.png")
pub_apple_png = os.path.join(base_dir, "public", "apple-icon.png")
pub_favicon_ico = os.path.join(base_dir, "public", "favicon.ico")

circular_img.save(app_icon_png)
circular_img.save(pub_icon_png)

apple_img = circular_img.resize((180, 180), Image.Resampling.LANCZOS)
apple_img.save(app_apple_png)
apple_img.save(pub_apple_png)

ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
circular_img.save(app_favicon_ico, format="ICO", sizes=ico_sizes)
circular_img.save(pub_favicon_ico, format="ICO", sizes=ico_sizes)

print("Successfully written all icon files:")
for f in [app_icon_png, app_apple_png, app_favicon_ico, pub_icon_png, pub_apple_png, pub_favicon_ico]:
    print(" -", f, os.path.exists(f), os.path.getsize(f), "bytes")
