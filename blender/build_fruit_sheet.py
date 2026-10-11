import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
import bpy
from mathutils import Vector
import fruit_lib as F

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.samples = 56
sc.cycles.use_denoising = True
sc.cycles.device = "CPU"
sc.render.resolution_x, sc.render.resolution_y = 1400, 560
sc.render.film_transparent = False
sc.view_settings.view_transform = "AgX"

# studio: ivory floor + window softbox + warm fill
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (0.93, 0.88, 0.8, 1); bg.inputs["Strength"].default_value = 0.35
bpy.ops.mesh.primitive_plane_add(size=30)
fl = bpy.context.active_object; fl.data.materials.append(F.mat_principled("floor", (0.9, 0.84, 0.74), rough=0.7))
def area(loc, energy, size, color=(1, 0.96, 0.9), rot=None):
    bpy.ops.object.light_add(type="AREA", location=loc)
    l = bpy.context.active_object; l.data.energy = energy; l.data.size = size; l.data.color = color
    l.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
area((-3.5, -3, 4), 260, 3.5)
area((4, -2, 2.2), 60, 3, (1, 0.85, 0.75))
area((0, 3.5, 3), 45, 4, (0.9, 0.95, 1))

items = []
R = F.raspberry(1, 0.8); R.data.materials.append(F.raspberry_material()); items.append((R, 0.5))
B = F.blueberry(1, 0.55); B.data.materials.append(F.blueberry_material()); items.append((B, 0.4))
S = F.strawberry(1, 1.15); S.data.materials.append(F.strawberry_material())
bpy.context.view_layer.update()
F.strawberry_seeds(S, 1); F.calyx(S, size=1.15); items.append((S, 0.55))
M = F.mint_leaf(1, 1.5); M.data.materials.append(F.mint_material()); items.append((M, 0.4))

shots = [(R, "raspberry", (0.2, 0.4)), (B, "blueberry", (0.3, 0.3)), (S, "strawberry", (0.5, 0.62)), (M, "mint", (0.5, 0.3))]
for ob, *_ in shots:
    ob.location = (0, 0, 0)
R.rotation_euler = (0.25, 0.3, 0.5)
M.rotation_euler = (math.radians(58), 0, math.radians(12))
for ob in (R, B, S, M):
    ob.hide_render = True
    for c in ob.children:
        c.hide_render = True
R.location.z, B.location.z, S.location.z, M.location.z = 0.42, 0.27, 0.6, 0.12
bpy.ops.object.camera_add(location=(0, -3.6, 1.1))
cam = bpy.context.active_object; sc.camera = cam
cam.data.lens = 85
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 6.3
sc.render.resolution_x, sc.render.resolution_y = 640, 640
out = os.path.abspath(os.path.join(os.path.dirname(__file__), "out")); os.makedirs(out, exist_ok=True)
for ob, name, (cx, cz) in shots:
    ob.hide_render = False
    for c in ob.children:
        c.hide_render = False
    tgt = Vector((0, 0, cz))
    cam.location = (0.0, -3.6, cz + 0.55)
    cam.rotation_euler = (tgt - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.dof.focus_distance = (tgt - cam.location).length
    sc.render.filepath = os.path.join(out, name + ".png")
    bpy.ops.render.render(write_still=True)
    ob.hide_render = True
    for c in ob.children:
        c.hide_render = True
print("DONE")
