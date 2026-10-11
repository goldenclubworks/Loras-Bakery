"""Photoreal fruit assets for Loras Bakery (Blender 5, Cycles).
Geometry is procedural (drupelets, seeds, veins); realism comes from subsurface scattering, wax bloom,
sugar dust and per-instance colour variation. Run through build_fruit_sheet.py or the cake builder."""
import math, random
import bpy, bmesh
from mathutils import Vector, Matrix, noise


def mat_principled(name, base, rough=0.4, sss=0.0, sss_col=None, sss_rad=(0.6, 0.2, 0.15), sheen=0.0,
                   coat=0.0, coat_rough=0.1, spec=0.5, nodes_extra=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1)
    bsdf.inputs["Roughness"].default_value = rough
    for k, v in (("Subsurface Weight", sss), ("Sheen Weight", sheen), ("Coat Weight", coat), ("Coat Roughness", coat_rough)):
        if k in bsdf.inputs:
            bsdf.inputs[k].default_value = v
    if sss and "Subsurface Radius" in bsdf.inputs:
        bsdf.inputs["Subsurface Radius"].default_value = sss_rad
    if sss_col and "Subsurface Scale" in bsdf.inputs:
        bsdf.inputs["Subsurface Scale"].default_value = 0.05
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = spec
    return m


def _set_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def to_obj(bm, name, mat=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    _set_smooth(ob)
    if mat:
        ob.data.materials.append(mat)
    return ob


# ── raspberry ────────────────────────────────────────────────────────────────
def raspberry(seed=1, size=1.0):
    rnd = random.Random(seed)
    bm = bmesh.new()
    # drupelets on a tapered ellipsoid via fibonacci spiral
    n = 118
    ga = math.pi * (3 - math.sqrt(5))
    for i in range(n):
        y = 1 - (i + 0.5) / n * 1.9  # leave the stem-side open (hollow core)
        r = math.sqrt(max(0, 1 - y * y))
        th = ga * i
        taper = 1.0 - 0.28 * ((1 - y) / 2.0) ** 1.5
        px, pz = math.cos(th) * r * taper, math.sin(th) * r * taper
        py = y * 1.12
        rad = 0.16 * (1 + (rnd.random() - 0.5) * 0.3)
        bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=rad,
                                  matrix=Matrix.Translation((px * 0.84, py * 0.84, pz * 0.84)) @ Matrix.Diagonal((1, 0.92 + rnd.random() * 0.14, 1, 1)))
    ob = to_obj(bm, "raspberry")
    ob.data.transform(Matrix.Scale(size * 0.5, 4))
    return ob


def raspberry_material():
    m = mat_principled("raspberry_mat", (0.55, 0.02, 0.06), rough=0.3, sss=0.1, sss_rad=(0.4, 0.05, 0.04), sheen=0.0, coat=0.45, coat_rough=0.18)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc, mp = nt.nodes.new("ShaderNodeTexCoord"), nt.nodes.new("ShaderNodeMapping")
    # per-drupelet colour variation (cells) + dusty sugar highlights (noise threshold)
    vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.feature = "F1"; vor.inputs["Scale"].default_value = 30
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.2, 0.0, 0.015, 1); ramp.color_ramp.elements[1].color = (0.62, 0.025, 0.045, 1)
    nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
    nt.links.new(vor.outputs["Distance"], ramp.inputs["Fac"])
    dust = nt.nodes.new("ShaderNodeTexNoise"); dust.inputs["Scale"].default_value = 90; dust.inputs["Detail"].default_value = 3
    dr = nt.nodes.new("ShaderNodeMapRange"); dr.inputs["From Min"].default_value = 0.62; dr.inputs["From Max"].default_value = 0.74
    nt.links.new(tc.outputs["Object"], dust.inputs["Vector"])
    nt.links.new(dust.outputs["Fac"], dr.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[7].default_value = (0.95, 0.9, 0.92, 1)
    nt.links.new(dr.outputs["Result"], mix.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], mix.inputs[6])
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.35
    nt.links.new(vor.outputs["Distance"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m


# ── blueberry ───────────────────────────────────────────────────────────────
def blueberry(seed=1, size=1.0):
    rnd = random.Random(seed)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=0.5)
    for v in bm.verts:
        n = v.co.normalized()
        a = math.acos(max(-1, min(1, n.z)))
        r = 0.5 * (0.93 + 0.1 * noise.noise(v.co * 3 + Vector((seed, 0, 0))))
        if a < 0.34:  # crown dimple
            r -= 0.1 * (1 - (a / 0.34) ** 2)
        elif a < 0.55:
            r += 0.02 * math.sin((a - 0.34) / 0.21 * math.pi)
        v.co = n * r
        v.co.z *= 0.88
    ob = to_obj(bm, "blueberry")
    # five calyx lobes
    bm2 = bmesh.new()
    for i in range(5):
        th = i / 5 * 2 * math.pi
        bmesh.ops.create_cone(bm2, cap_ends=True, segments=8, radius1=0.05, radius2=0.012, depth=0.07,
                              matrix=Matrix.Translation((math.cos(th) * 0.08, math.sin(th) * 0.08, 0.41)) @ Matrix.Rotation(th, 4, "Z") @ Matrix.Rotation(math.radians(70), 4, "Y"))
    lobes = to_obj(bm2, "calyx")
    lobes.parent = ob
    lobes.data.materials.append(mat_principled("calyx_mat", (0.08, 0.06, 0.09), rough=0.6))
    ob.data.transform(Matrix.Scale(size * 0.9, 4))
    lobes.data.transform(Matrix.Scale(size * 0.9, 4))
    return ob


def blueberry_material():
    m = mat_principled("blueberry_mat", (0.05, 0.07, 0.2), rough=0.5, sss=0.3, sss_rad=(0.15, 0.2, 0.5), sheen=0.0, coat=0.0)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    # wax bloom: soft grey-blue haze, rougher where the bloom is thick
    bloom = nt.nodes.new("ShaderNodeTexNoise"); bloom.inputs["Scale"].default_value = 6; bloom.inputs["Detail"].default_value = 6
    br = nt.nodes.new("ShaderNodeMapRange"); br.inputs["From Min"].default_value = 0.5; br.inputs["From Max"].default_value = 0.85
    nt.links.new(tc.outputs["Object"], bloom.inputs["Vector"])
    nt.links.new(bloom.outputs["Fac"], br.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = (0.006, 0.01, 0.045, 1); mix.inputs[7].default_value = (0.16, 0.19, 0.28, 1)
    nt.links.new(br.outputs["Result"], mix.inputs["Factor"])
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    rough = nt.nodes.new("ShaderNodeMapRange"); rough.inputs["To Min"].default_value = 0.28; rough.inputs["To Max"].default_value = 0.72
    nt.links.new(br.outputs["Result"], rough.inputs["Value"])
    nt.links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    # sugar dust speckles
    dust = nt.nodes.new("ShaderNodeTexNoise"); dust.inputs["Scale"].default_value = 160; dust.inputs["Detail"].default_value = 0
    dr = nt.nodes.new("ShaderNodeMapRange"); dr.inputs["From Min"].default_value = 0.74; dr.inputs["From Max"].default_value = 0.78
    dr.inputs["To Max"].default_value = 0.55
    nt.links.new(tc.outputs["Object"], dust.inputs["Vector"])
    nt.links.new(dust.outputs["Fac"], dr.inputs["Value"])
    mix2 = nt.nodes.new("ShaderNodeMix"); mix2.data_type = "RGBA"
    mix2.inputs[7].default_value = (1, 1, 1, 1)
    nt.links.new(mix.outputs[2], mix2.inputs[6]); nt.links.new(dr.outputs["Result"], mix2.inputs["Factor"])
    nt.links.new(mix2.outputs[2], bsdf.inputs["Base Color"])
    return m


# ── strawberry ──────────────────────────────────────────────────────────────
def strawberry(seed=1, size=1.0):
    rnd = random.Random(seed)
    bm = bmesh.new()
    prof = [(0.0, -1.0), (0.12, -0.96), (0.32, -0.8), (0.55, -0.5), (0.72, -0.1), (0.8, 0.28), (0.8, 0.5), (0.74, 0.63), (0.55, 0.75), (0.28, 0.81), (0.0, 0.83)]
    # smooth the profile with a Catmull-Rom spline so there is no visible rim at the shoulder
    def cr(p0, p1, p2, p3, t):
        return tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t ** 3) for k in range(2))
    ext = [prof[0]] + prof + [prof[-1]]
    dense = []
    for a in range(1, len(ext) - 2):
        for st in range(8):
            dense.append(cr(ext[a - 1], ext[a], ext[a + 1], ext[a + 2], st / 8))
    dense.append(prof[-1])
    dense = [(max(0.0, x), y) for x, y in dense]
    prof = dense
    # lathe by hand for a lumpy organic body
    segs, rings = 96, 90
    verts = []
    for j in range(rings + 1):
        t = j / rings
        k = t * (len(prof) - 1)
        i0 = min(int(k), len(prof) - 2)
        f = k - i0
        rx = prof[i0][0] * (1 - f) + prof[i0 + 1][0] * f
        yy = prof[i0][1] * (1 - f) + prof[i0 + 1][1] * f
        row = []
        for s in range(segs):
            th = s / segs * 2 * math.pi
            lump = 1 + 0.05 * noise.noise(Vector((math.cos(th) * 1.5, math.sin(th) * 1.5, yy * 2 + seed)))
            row.append(bm.verts.new((math.cos(th) * rx * lump, math.sin(th) * rx * lump, yy)))
        verts.append(row)
    for j in range(rings):
        for s in range(segs):
            bm.faces.new((verts[j][s], verts[j][(s + 1) % segs], verts[j + 1][(s + 1) % segs], verts[j + 1][s]))
    ob = to_obj(bm, "strawberry")
    ob["seed_zone"] = True
    ob.data.transform(Matrix.Scale(size * 0.55, 4))
    return ob


def strawberry_seeds(body, seed=1):
    """Seeds sit in real dimples: vertices around each seed are pushed inward, then the seed is placed in the pit."""
    rnd = random.Random(seed)
    pts = []
    rows = 22
    for r in range(rows):
        z = (-0.9 + 1.5 * r / (rows - 1)) * 0.55
        cols = max(6, int(24 * (0.25 + 0.75 * min(1, (z / 0.55 + 1.05) / 1.2))))
        for c in range(cols):
            th = (c + (r % 2) * 0.5) / cols * 2 * math.pi + rnd.random() * 0.05
            o = Vector((math.cos(th) * 1.5, math.sin(th) * 1.5, z))
            ok, loc, nrm, _ = body.ray_cast(o, -Vector((math.cos(th), math.sin(th), 0)))
            if ok:
                pts.append((loc.copy(), nrm.copy()))
    me = body.data
    for v in me.vertices:
        push = 0.0
        for loc, nrm in pts:
            d = (v.co - loc).length
            if d < 0.05:
                push = max(push, (1 - d / 0.05) ** 2)
        if push:
            n = Vector((v.co.x, v.co.y, 0)).normalized()
            v.co -= n * push * 0.026
    me.update()
    seeds = bmesh.new()
    for loc, nrm in pts:
        q = Vector((0, 0, 1)).rotation_difference(nrm).to_matrix().to_4x4()
        bmesh.ops.create_uvsphere(seeds, u_segments=8, v_segments=6, radius=0.011,
                                  matrix=Matrix.Translation(loc - nrm * 0.02) @ q @ Matrix.Diagonal((0.9, 0.9, 1.5, 1)))
    ob = to_obj(seeds, "seeds", mat_principled("seed_mat", (0.75, 0.55, 0.16), rough=0.35))
    ob.parent = body
    return ob


def strawberry_material():
    m = mat_principled("strawberry_mat", (0.7, 0.03, 0.05), rough=0.3, sss=0.04, sss_rad=(0.2, 0.04, 0.03), sheen=0.0, coat=0.5, coat_rough=0.12)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")  # red body → pale shoulder
    ramp.color_ramp.elements[0].position = 0.25; ramp.color_ramp.elements[0].color = (0.3, 0.0, 0.01, 1)
    e = ramp.color_ramp.elements.new(0.75); e.color = (0.55, 0.015, 0.02, 1)
    ramp.color_ramp.elements[-1].position = 0.98; ramp.color_ramp.elements[-1].color = (0.78, 0.2, 0.1, 1)
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -1.0; mr.inputs["From Max"].default_value = 0.65
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    noi = nt.nodes.new("ShaderNodeTexNoise"); noi.inputs["Scale"].default_value = 7
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["Factor"].default_value = 0.18
    mix.inputs[7].default_value = (0.4, 0.0, 0.02, 1)
    nt.links.new(tc.outputs["Object"], noi.inputs["Vector"]); nt.links.new(noi.outputs["Fac"], mix.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], mix.inputs[6]); nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    return m


def calyx(parent, rnd_seed=3, size=1.0):
    k = 0.55 * size
    rnd = random.Random(rnd_seed)
    bm = bmesh.new()
    n = 8
    for i in range(n):
        th = i / n * 2 * math.pi + rnd.random() * 0.2
        L = 0.42 + rnd.random() * 0.12
        pts = []
        for j in range(8):
            t = j / 7
            w = 0.1 * math.sin(math.pi * min(1, t * 1.15)) ** 0.8
            x = 0.12 + t * L
            z = 0.62 + 0.1 * t - 0.5 * t * t * 0.35  # droops outward over the shoulder
            pts.append((x, w, z))
        left = [bm.verts.new(Vector((x, -w, z))) for x, w, z in pts]
        right = [bm.verts.new(Vector((x, w, z))) for x, w, z in pts]
        for j in range(7):
            bm.faces.new((left[j], left[j + 1], right[j + 1], right[j]))
        for v in left + right:
            v.co = Matrix.Rotation(th, 3, "Z") @ v.co
    stem = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.05, radius2=0.04, depth=0.3,
                                 matrix=Matrix.Translation((0, 0, 0.8)))
    bmesh.ops.scale(bm, vec=(k, k, k), verts=bm.verts)
    ob = to_obj(bm, "calyx", mat_principled("calyx_green", (0.12, 0.38, 0.06), rough=0.45, sss=0.2, sss_rad=(0.2, 0.5, 0.1)))
    ob.parent = parent
    ob.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob


# ── mint ─────────────────────────────────────────────────────────────────────
def mint_leaf(seed=1, size=1.0):
    rnd = random.Random(seed)
    L, Wd = 1.0, 0.62
    cols, rows = 14, 26
    bm = bmesh.new()
    grid = []
    for j in range(rows + 1):
        t = j / rows
        hw = Wd * 0.5 * (math.sin(math.pi * t ** 0.78) ** 0.75)
        row = []
        for i in range(cols + 1):
            u = i / cols * 2 - 1
            # serrated edge
            tooth = 1 + (0.07 * (math.sin(t * 52) ** 2) if abs(u) > 0.9 else 0)
            x = u * hw * tooth
            y = t * L
            # blade: V-fold along the midrib, lengthwise curl, puckered between veins
            vein = 0.012 * math.sin(t * 34 + u * 2) * abs(u) ** 0.5
            z = 0.2 * abs(x) * 1.6 - 0.28 * t * t + vein + 0.02 * noise.noise(Vector((x * 6, y * 6, seed)))
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for j in range(rows):
        for i in range(cols):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    me = bpy.data.meshes.new("mint")
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("mint", me)
    bpy.context.collection.objects.link(ob)
    _set_smooth(ob)
    sub = ob.modifiers.new("sub", "SUBSURF"); sub.levels = 2; sub.render_levels = 2
    ob.data.transform(Matrix.Scale(size * 0.9, 4))
    return ob


def mint_material():
    m = mat_principled("mint_mat", (0.1, 0.35, 0.07), rough=0.42, sss=0.35, sss_rad=(0.25, 0.5, 0.12), coat=0.1, coat_rough=0.4)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; nt.links.new(sep.outputs["X"], ab.inputs[0])
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = 1.7; nt.links.new(ab.outputs[0], mul.inputs[0])
    sub = nt.nodes.new("ShaderNodeMath"); sub.operation = "SUBTRACT"; nt.links.new(sep.outputs["Y"], sub.inputs[0]); nt.links.new(mul.outputs[0], sub.inputs[1])
    sc_ = nt.nodes.new("ShaderNodeMath"); sc_.operation = "MULTIPLY"; sc_.inputs[1].default_value = 34.0; nt.links.new(sub.outputs[0], sc_.inputs[0])
    sn = nt.nodes.new("ShaderNodeMath"); sn.operation = "SINE"; nt.links.new(sc_.outputs[0], sn.inputs[0])
    # fine veins only, thin and sharp; midrib as a pale line along x≈0
    thin = nt.nodes.new("ShaderNodeMapRange"); thin.inputs["From Min"].default_value = 0.82; thin.inputs["From Max"].default_value = 1.0
    nt.links.new(sn.outputs[0], thin.inputs["Value"])
    rib = nt.nodes.new("ShaderNodeMapRange"); rib.inputs["From Min"].default_value = 0.035; rib.inputs["From Max"].default_value = 0.0
    nt.links.new(ab.outputs[0], rib.inputs["Value"])
    comb = nt.nodes.new("ShaderNodeMath"); comb.operation = "MAXIMUM"
    nt.links.new(thin.outputs["Result"], comb.inputs[0]); nt.links.new(rib.outputs["Result"], comb.inputs[1])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.06, 0.26, 0.04, 1); ramp.color_ramp.elements[1].color = (0.42, 0.6, 0.22, 1)
    nt.links.new(comb.outputs[0], ramp.inputs["Fac"])
    veins = comb
    fine = nt.nodes.new("ShaderNodeTexNoise"); fine.inputs["Scale"].default_value = 60
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["Factor"].default_value = 0.2
    mix.inputs[7].default_value = (0.04, 0.2, 0.03, 1)
    nt.links.new(ramp.outputs["Color"], mix.inputs[6]); nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.6
    nt.links.new(veins.outputs[0], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return m
