# Static version of the OperatorGlobe canvas in app/how-weso-works.tsx.
import json, math
land = json.load(open("public/assets/operator-world.geojson", encoding="utf-8"))
ops = [[-70,-33],[-74,4],[-99,19],[-80,26],[-122,38],[-46,-23],[-3,40],[2,49],[28,-26],[55,25],[77,28],[139,36],[151,-34]]
R, C, tilt, rot = 208, 260, .19, 1.3
def proj(lon, lat):
    lo = math.radians(lon) + rot; la = math.radians(lat)
    x = math.cos(la)*math.sin(lo); y = math.sin(la); z = math.cos(la)*math.cos(lo)
    return C + R*x, C - R*(y*math.cos(tilt) - z*math.sin(tilt)), y*math.sin(tilt) + z*math.cos(tilt)
def path(points):
    d, up = [], False
    for p in points:
        x, y, z = proj(*p)
        if z < 0: up = False; continue
        d.append(("L" if up else "M") + f"{x:.1f} {y:.1f}"); up = True
    return "".join(d)
parts = [f'<circle cx="{C}" cy="{C}" r="{R}" fill="#fff" stroke="#c7c3c6"/>']
grat = [path([[i*2-180, la] for i in range(181)]) for la in range(-60, 61, 30)]
grat += [path([[lo, i*2-90] for i in range(91)]) for lo in range(-180, 180, 30)]
parts.append(f'<path d="{"".join(grat)}" fill="none" stroke="#dedbda" stroke-width=".7"/>')
rings = []
for f in land["features"]:
    g = f["geometry"]
    polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
    for poly in polys:
        for ring in poly: rings.append(path(ring))
parts.append(f'<path d="{"".join(rings)}" fill="none" stroke="#a9a4a8" stroke-width=".9" stroke-linejoin="round"/>')
for i, p in enumerate(ops):
    x, y, z = proj(*p)
    if z < .05: continue
    if i == 1:
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="15" fill="none" stroke="#f20b8f" stroke-opacity=".35"/><circle cx="{x:.1f}" cy="{y:.1f}" r="6" fill="#f20b8f"/>')
    else:
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.6" fill="#171518"/>')
open("pdf-cliente/img/globe.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 440 440">{"".join(parts)}</svg>')
print("ok")
