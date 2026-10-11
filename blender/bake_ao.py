"""Bake ambient occlusion for the simplified cake into the model's own UV layout (the atlas is unique per surface)."""
import bpy, os, sys
src, out = sys.argv[sys.argv.index("--") + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
obs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
ob = obs[0]
bpy.context.view_layer.objects.active = ob
ob.select_set(True)
print("tris", sum(len(p.vertices) - 2 for p in ob.data.polygons))
S = 2048
img = bpy.data.images.new("ao", S, S, alpha=False, float_buffer=False)
mat = ob.data.materials[0]
nt = mat.node_tree
n = nt.nodes.new("ShaderNodeTexImage"); n.image = img
nt.nodes.active = n
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = 96
sc.cycles.use_denoising = False
# ground plane so the underside and plate contact occlude each other correctly
sc.render.bake.margin = 6
sc.render.bake.use_clear = True
bpy.ops.object.bake(type="AO", margin=6, use_clear=True)
img.filepath_raw = out
img.file_format = "PNG"
img.save()
print("DONE", out)
