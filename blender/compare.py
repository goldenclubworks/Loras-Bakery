import bpy, sys, os, math
from mathutils import Vector
src, tag = sys.argv[sys.argv.index("--")+1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.samples = 48; sc.cycles.use_denoising = True; sc.cycles.device = "CPU"
sc.view_settings.view_transform = "AgX"
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.95, 0.9, 0.84, 1); w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
bpy.ops.object.light_add(type="AREA", location=(-2.5, -2.5, 3.5)); l = bpy.context.active_object; l.data.energy = 300; l.data.size = 3
l.rotation_euler = (Vector((0,0,0.3)) - l.location).to_track_quat("-Z","Y").to_euler()
bpy.ops.object.camera_add(); cam = bpy.context.active_object; sc.camera = cam; cam.data.lens = 70
out = os.path.abspath("out"); os.makedirs(out, exist_ok=True)
sc.render.resolution_x = sc.render.resolution_y = 900
for name, loc, tgt in [("full", (0.0, -4.2, 2.2), (0, 0, 0.1)), ("close", (-0.3, -1.9, 1.15), (-0.3, -0.2, 0.42))]:
    cam.location = loc
    cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat("-Z","Y").to_euler()
    sc.render.filepath = f"{out}/cmp_{tag}_{name}.png"
    bpy.ops.render.render(write_still=True)
print("DONE")
