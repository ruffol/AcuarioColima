import json, pathlib, re

def product_from_img(cat_folder, cat_es, cat_en, filename, mxn, usd, colors):
    """Generate a product entry from an image filename"""
    name = re.sub(r'\.png$', '', filename)
    # Remove category prefix (Llavero-, tlalchichi-, etc.)
    name = re.sub(r'^[Ll][Ll]?a?vero-', '', name)
    name = re.sub(r'^[Tt]lalchichi-', '', name)
    name = re.sub(r'-colima$', '', name)
    parts = name.split('-')
    slug_base = '_'.join(parts)
    
    # Build clean names
    nombre_parts = ' '.join(p.capitalize() for p in parts)
    cat_singular = cat_es.rstrip('s') if cat_es.endswith('s') else cat_es
    cat_singular_en = cat_en.rstrip('s') if cat_en.endswith('s') else cat_en
    
    nombre_es = f"{cat_singular} {nombre_parts}"
    nombre_en = f"{nombre_parts} {cat_singular_en}"
    
    slug = f"{cat_folder.rstrip('s')}-{slug_base}"
    
    return {
        "slug": slug,
        "nombre_es": nombre_es,
        "nombre_en": nombre_en,
        "descripcion_es": f"Artesanía tradicional de Colima. Hecho a mano con barro natural.",
        "descripcion_en": f"Traditional Colima craftsmanship. Handmade with natural clay.",
        "historia_es": "Pieza única de la tradición Tlalchichi de Colima, México.",
        "historia_en": "Unique piece from the Tlalchichi tradition of Colima, Mexico.",
        "categoria_es": cat_es,
        "categoria_en": cat_en,
        "precio_mxn": mxn,
        "precio_usd": usd,
        "stock": 42,
        "destacado": False,
        "imagenes": [f"/img/productos/{cat_folder}/{filename}"],
        "colores": colors
    }

# Color sets per category
def make_colors(img_path):
    return [
        {"nombre_es": "Blanco", "nombre_en": "White", "hex": "#F5F5F5", "imagen": img_path},
        {"nombre_es": "Negro", "nombre_en": "Black", "hex": "#2D2D2D", "imagen": img_path},
        {"nombre_es": "Traslúcido", "nombre_en": "Translucent", "hex": "#D4D4D4", "imagen": img_path},
        {"nombre_es": "Naranja", "nombre_en": "Orange", "hex": "#E87A3E", "imagen": img_path},
    ]

seed = []

# Llaveros - each image = product
for f in ['Lavero-tlalchichi-mascara-colima.png', 'Llavero-tlalchichi-acostado-colima.png',
          'Llavero-tlalchichi-joven-viejo-colima.png', 'Llavero-tlalchichi-mascara-danza-colima.png',
          'Llavero-tlalchichi-parado-colima.png', 'Llavero-tlalchichi-sentado-colima.png',
          'Llavero-tlalchichi-viejo-sentado-colima.png']:
    p = product_from_img('llaveros', 'Llaveros', 'Keychains', f, 35, 2, make_colors(f'/img/productos/llaveros/{f}'))
    seed.append(p)

# Portamacetas
for f in ['tlalchichi-acostado-colima.png', 'tlalchichi-acostado-mediano-colima.png', 'tlalchichi-sentado-colima.png']:
    p = product_from_img('portamacetas', 'Portamacetas', 'Planters', f, 210, 11, make_colors(f'/img/productos/portamacetas/{f}'))
    seed.append(p)

# Alcacias
for f in ['tlalchichi-mascara-colima.png', 'tlalchichi-sentado-colima.png', 'tlalchichi-viejo-sentado-colima.png']:
    p = product_from_img('alcacias', 'Alcancías', 'Piggy Banks', f, 160, 9, make_colors(f'/img/productos/alcacias/{f}'))
    seed.append(p)

# Cuencos
for f in ['tlalchichi-mazorca-colima.png', 'tlalchichi-viejo-sentado-color-colima.png']:
    p = product_from_img('cuencos', 'Cuencos', 'Bowls', f, 210, 11, make_colors(f'/img/productos/cuencos/{f}'))
    seed.append(p)

# Write file
output = pathlib.Path(__file__).parent / 'src' / 'lib' / 'seed.json'
with open(output, 'w', encoding='utf-8') as f:
    json.dump(seed, f, ensure_ascii=False, indent=2)

print(f'Seed generado: {len(seed)} productos')
for p in seed:
    print(f'  [{p["categoria_es"]}] {p["nombre_es"]} -> {p["imagenes"][0]}')
