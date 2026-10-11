"""High-to-low bake: the 5.7M-triangle original is the detail source, the 500k mesh receives normal + AO maps (4096)."""
import bpy, sys
args = sys.argv[sys.argv.index("--") + 1:]
high_p, low_p, out_n, out_ao = args[:4]
S = int(args[4]) if len(args) > 4 else 4096
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=high_p)
high = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
before = set(bpy.context.scene.objects)
bpy.ops.import_scene.gltf(filepath=low_p)
low = [o for o in bpy.context.scene.objects if o.type == "MESH" and o not in before][0]
print("high", len(high.data.polygons), "low", len(low.data.polygons))
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False
mat = low.data.materials[0]
nt = mat.node_tree
def bake(kind, path, samples, noncolor=True, extra=None):
    img = bpy.data.images.new(kind, S, S, alpha=False)
    img.colorspace_settings.name = "Non-Color"
    n = nt.nodes.new("ShaderNodeTexImage"); n.image = img; nt.nodes.active = n
    sc.cycles.samples = samples
    bpy.ops.object.select_all(action="DESELECT")
    high.select_set(True); low.select_set(True); bpy.context.view_layer.objects.active = low
    bpy.ops.object.bake(type=kind, use_selected_to_active=True, cage_extrusion=0.004, max_ray_distance=0.012,
                        margin=10, margin_type="EXTEND", use_clear=True, normal_space="TANGENT")
    img.filepath_raw = path; img.file_format = "PNG"; img.save(); print("BAKED", kind, path)
    nt.nodes.remove(n)
bake("NORMAL", out_n, 1)
bake("AO", out_ao, 40)
