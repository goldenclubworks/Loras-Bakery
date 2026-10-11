import bpy, sys, math
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="../assets/model/s04.glb")
ob=[o for o in bpy.context.scene.objects if o.type=="MESH"][0]
print("rot",ob.rotation_euler, "scale", ob.scale, "loc", ob.location, "dims", ob.dimensions)
M=ob.matrix_world
bins={}
for v in ob.data.vertices:
    w=M@v.co
    k=round(w.z*20)/20  # blender Z is up (glTF Y)
    r=math.hypot(w.x,w.y)
    b=bins.setdefault(k,[0,0.0])
    b[0]+=1; b[1]=max(b[1],r)
for k in sorted(bins): print(f"z={k:+.2f} n={bins[k][0]:6d} rmax={bins[k][1]:.2f}")
