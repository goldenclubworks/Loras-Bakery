"""Render one GLB from a fixed close-up camera under fixed studio light (Cycles). Usage: -- <glb> <out.png> [view]"""
import bpy, sys, math
from mathutils import Vector
glb, out = sys.argv[sys.argv.index("--") + 1:][:2]
view = (sys.argv[sys.argv.index("--") + 1:] + ["top"])[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 48; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1100, 760
sc.view_settings.view_transform = "AgX"
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (0.93, 0.88, 0.82, 1); bg.inputs["Strength"].default_value = 0.9
def area(loc, e, size, col=(1, .95, .9)):
    bpy.ops.object.light_add(type="AREA", location=loc); l = bpy.context.active_object
    l.data.energy = e; l.data.size = size; l.data.color = col
    l.rotation_euler = (Vector((0, 0, .2)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
area((-3, -3, 4), 380, 3.5); area((3.5, -1.5, 2.5), 90, 3, (1, .85, .75))
target, loc = {"top": (Vector((0, 0, 0.32)), Vector((0.0, -1.55, 1.15))), "front": (Vector((0, 0, 0.0)), Vector((0, -3.4, 1.3)))}[view]
bpy.ops.object.camera_add(location=loc); cam = bpy.context.active_object; sc.camera = cam
cam.data.lens = 70; cam.rotation_euler = (target - loc).to_track_quat("-Z", "Y").to_euler()
sc.render.filepath = out; bpy.ops.render.render(write_still=True); print("DONE", out)
