from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os, glob, math

CARRUCEL = r"C:\Users\42\Documents\WEBtlalchichistore\public\img\carrucel"
LOGO = r"C:\Users\42\Documents\WEBtlalchichistore\public\img\weblogotlalchichi.png"
OUTPUT = r"C:\Users\42\Desktop\Tlalchichi_Wallpaper_1920x1080.png"

W, H = 1920, 1080
BG_COLOR = (30, 25, 20)
ACCENT = (200, 106, 78)  # terracota Tlalchichi

# Cargar imágenes
images = sorted(glob.glob(os.path.join(CARRUCEL, "*.png")))
print(f"Cargando {len(images)} imágenes...")

imgs = []
for path in images:
    img = Image.open(path).convert("RGBA")
    # Recortar a cuadrado centrado
    s = min(img.size)
    left = (img.width - s) // 2
    top = (img.height - s) // 2
    img = img.crop((left, top, left + s, top + s))
    img = img.resize((200, 200), Image.LANCZOS)
    imgs.append(img)

# Crear lienzo
canvas = Image.new("RGBA", (W, H), BG_COLOR + (255,))

# --- Fondo con gradiente suave ---
for y in range(H):
    r = int(BG_COLOR[0] + (ACCENT[0] - BG_COLOR[0]) * (y / H) * 0.15)
    g = int(BG_COLOR[1] + (ACCENT[1] - BG_COLOR[1]) * (y / H) * 0.10)
    b = int(BG_COLOR[2] + (ACCENT[2] - BG_COLOR[2]) * (y / H) * 0.08)
    ImageDraw.Draw(canvas).line([(0, y), (W, y)], fill=(r, g, b, 255))

# --- Patrón decorativo de fondo (círculos tenues) ---
draw = ImageDraw.Draw(canvas)
for i in range(20):
    cx = (i * 137 + 50) % W
    cy = (i * 89 + 200) % H
    r = 30 + (i * 7) % 60
    alpha = 8 + (i * 3) % 12
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(ACCENT[0], ACCENT[1], ACCENT[2], alpha), width=1)

# --- Grid de imágenes ---
cols, rows = 5, 3
img_w, img_h = 200, 200
gap_x, gap_y = 30, 30
total_w = cols * img_w + (cols - 1) * gap_x
total_h = rows * img_h + (rows - 1) * gap_y
start_x = (W - total_w) // 2
start_y = (H - total_h) // 2 + 40  # dejar espacio arriba para el logo

index = 0
for row in range(rows):
    for col in range(cols):
        if index >= len(imgs):
            break
        x = start_x + col * (img_w + gap_x)
        y = start_y + row * (img_h + gap_y)
        # Sombra suave
        shadow = Image.new("RGBA", (img_w + 8, img_h + 8), (0, 0, 0, 60))
        canvas.paste(shadow, (x - 4 + 3, y - 4 + 3), shadow)
        # Imagen con bordes redondeados (máscara circular)
        mask = Image.new("L", (img_w, img_h), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, img_w, img_h), fill=255)
        circle_img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
        circle_img.paste(imgs[index], (0, 0), mask)
        # Borde fino
        border = Image.new("RGBA", (img_w + 6, img_h + 6), ACCENT + (180,))
        border_mask = Image.new("L", (img_w + 6, img_h + 6), 0)
        ImageDraw.Draw(border_mask).ellipse((0, 0, img_w + 6, img_h + 6), fill=255)
        canvas.paste(border, (x - 3, y - 3), border_mask)
        canvas.paste(circle_img, (x, y), circle_img)
        index += 1
    if index >= len(imgs):
        break

# --- Logo ---
try:
    logo = Image.open(LOGO).convert("RGBA")
    logo_w = 180
    logo_h = int(logo.height * (logo_w / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
    logo_x = (W - logo_w) // 2
    logo_y = 25
    canvas.paste(logo, (logo_x, logo_y), logo)
    logo_bottom = logo_y + logo_h + 10
except:
    logo_bottom = 25

# --- Texto "TLALCHICHI" ---
try:
    # Buscar fuente
    font_paths = [
        r"C:\Windows\Fonts\GILSANUB.TTF",  # Gill Sans Ultra Bold
        r"C:\Windows\Fonts\impact.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
    ]
    font_title = None
    for fp in font_paths:
        if os.path.exists(fp):
            font_title = ImageFont.truetype(fp, 42)
            break
    if font_title:
        text = "TLALCHICHI"
        bbox = draw.textbbox((0, 0), text, font=font_title)
        tw = bbox[2] - bbox[0]
        tx = (W - tw) // 2
        ty = logo_bottom + 5
        # Sombra del texto
        draw.text((tx+2, ty+2), text, fill=(0, 0, 0, 120), font=font_title)
        draw.text((tx, ty), text, fill=ACCENT + (255,), font=font_title)
except:
    pass

# --- Subtítulo ---
try:
    font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 18) if os.path.exists(r"C:\Windows\Fonts\segoeui.ttf") else None
    if font_sub:
        sub = "Artesanía de Colima, México  —  Hecho a mano con tradición"
        bbox = draw.textbbox((0, 0), sub, font=font_sub)
        tw = bbox[2] - bbox[0]
        tx = (W - tw) // 2
        ty = logo_bottom + 55
        draw.text((tx+1, ty+1), sub, fill=(0, 0, 0, 80), font=font_sub)
        draw.text((tx, ty), sub, fill=(180, 160, 140, 220), font=font_sub)
except:
    pass

# --- Línea decorativa inferior ---
draw.line([(W//2 - 200, H - 60), (W//2 + 200, H - 60)], fill=ACCENT + (200,), width=2)
# Pequeños círculos decorativos
for i, x_off in enumerate([-60, 0, 60]):
    cx = W // 2 + x_off
    draw.ellipse([cx - 3, H - 63, cx + 3, H - 57], fill=ACCENT + (220,))

# --- Guardar ---
canvas = canvas.convert("RGB")
canvas.save(OUTPUT, "PNG")
print(f"✅ Wallpaper creado: {OUTPUT}")
