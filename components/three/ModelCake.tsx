"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { drag, pointer } from "@/lib/pointer";
import { clamp01, easeOutBack, makePlateGeometry, makePlateMaterial } from "./gen/kit";

/** model is ~1.9 wide and ~1.05 tall (centred); this makes it fill the slot like the earlier cakes */
const FIT = 1.32;
const HALF_H = 0.525 * FIT;

/**
 * Sugar glints: a field of tiny mirror facets (one per UV cell, each with its own random tilt). A facet lights up
 * when its tilted normal meets the key light's half vector, so the sparkle travels as the cake turns.
 * Strongest on the fruit (where the silver sugar sits), faint on the rest.
 */
function addGlints(mat: THREE.MeshPhysicalMaterial, uniforms: { uModelView: { value: THREE.Matrix3 }; uTime: { value: number } }) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uModelView = uniforms.uModelView;
    shader.uniforms.uTime = uniforms.uTime;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        #ifdef USE_MAP
        {
          vec3 c = diffuseColor.rgb;
          float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
          float mx = max(c.r, max(c.g, c.b));
          float mn = min(c.r, min(c.g, c.b));
          float sat = (mx - mn) / max(mx, 1e-4);
          gRed = smoothstep(1.18, 1.5, c.r / max(c.g, 1e-3)) * smoothstep(0.22, 0.45, sat);
          gGreen = smoothstep(1.0, 1.2, c.g / max(c.r, 1e-3)) * smoothstep(1.02, 1.2, c.g / max(c.b, 1e-3)) * smoothstep(0.15, 0.35, sat);
          gBlue = (1.0 - gRed) * (1.0 - gGreen) * smoothstep(0.55, 0.85, c.b / max(c.r, 1e-3)) * smoothstep(0.45, 0.2, lum) * smoothstep(0.05, 0.12, lum);
          gChoc = (1.0 - gRed) * (1.0 - gGreen) * (1.0 - gBlue) * smoothstep(0.26, 0.12, lum);
          gDust = smoothstep(0.62, 0.8, lum) * smoothstep(0.3, 0.1, sat);
        }
        #endif`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        {
          float n1 = h21(floor(vMapUv * 900.0));
          float base = roughnessFactor;
          float r = mix(base, 0.7, 0.35);
          r = mix(r, 0.26 + 0.1 * n1, gChoc);
          r = mix(r, 0.36 + 0.08 * n1, gRed);
          r = mix(r, 0.55 + 0.1 * n1, gBlue);
          r = mix(r, 0.46, gGreen);
          r = mix(r, 0.88, gDust * (1.0 - gChoc));
          roughnessFactor = clamp(r, 0.08, 1.0);
        }`,
      )
      .replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
        {
          float cc = 0.08 + gChoc * 0.95 + gRed * 0.85 + gBlue * 0.3 + gGreen * 0.45;
          cc *= 1.0 - gDust * 0.9;
          material.clearcoat = clamp(cc, 0.0, 1.0);
          material.clearcoatRoughness = mix(0.3, 0.12, max(gRed, gChoc));
        }
        #endif`,
      )
      .replace(
        "#include <common>",
        `#include <common>
        uniform mat3 uModelView;
        uniform float uTime;
        float gChoc; float gRed; float gBlue; float gGreen; float gDust;
        float h11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
        float h21(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
        vec3 h23(vec2 p){ return vec3(h21(p), h21(p + 17.1), h21(p + 41.7)); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        #ifdef USE_MAP
        {
          vec2 gUv = vMapUv * 1500.0;
          vec2 cell = floor(gUv);
          vec2 local = fract(gUv) - 0.5;
          float seed = h21(cell);
          float mx = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
          float sat = mx - min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
          float onFruit = smoothstep(0.12, 0.4, sat) + smoothstep(0.35, 0.8, dot(diffuseColor.rgb, vec3(0.333))) * 0.0;
          float density = mix(0.003, 0.07, clamp(onFruit, 0.0, 1.0));
          float present = step(1.0 - density, seed);
          vec3 tilt = normalize(uModelView * (h23(cell) * 2.0 - 1.0));
          vec3 nrm = normalize(normal + tilt * 0.85);
          vec3 V = normalize(vViewPosition);
          vec3 L = normalize(vec3(-0.45, 0.65, 0.75));
          float g = pow(max(dot(nrm, normalize(V + L)), 0.0), 120.0);
          float g2 = pow(max(dot(nrm, normalize(V + normalize(vec3(0.6, 0.3, 0.7)))), 0.0), 120.0);
          float tw = 0.7 + 0.3 * sin(uTime * 2.3 + seed * 60.0);
          float disc = smoothstep(0.5, 0.18, length(local));
          totalEmissiveRadiance += present * disc * (g + g2 * 0.6) * tw * 3.2 * vec3(0.9, 0.94, 1.0);
        }
        #endif`,
      );
  };
  mat.customProgramCacheKey = () => "cake-glints-v3";
}

/** GPU uniforms are mutated imperatively every frame, outside React's render model. */
function feed(u: { uModelView: { value: THREE.Matrix3 }; uTime: { value: number } }, mv: THREE.Matrix4, t: number) {
  u.uModelView.value.setFromMatrix4(mv);
  u.uTime.value = t;
}

/**
 * The hero cake: Meshy model, rebuilt for the web (500k triangles with the 5.7M-triangle detail baked into 4K normal
 * and AO maps). Drag to turn it; it idles in a slow turn. Waits for shader compile and texture upload before it
 * reports ready, so the preloader curtain lifts onto a finished frame.
 */
export default function ModelCake({ introStart, url, onReady }: { introStart: React.RefObject<number | null>; url: string; onReady: () => void }) {
  const { scene } = useGLTF(url);
  const { gl, camera, scene: root3 } = useThree();
  const root = useRef<THREE.Group>(null);
  const yaw = useRef(0.6);
  const spinVel = useRef(0.14);
  const uniforms = useMemo(() => ({ uModelView: { value: new THREE.Matrix3() }, uTime: { value: 0 } }), []);
  const tmp = useMemo(() => new THREE.Matrix4(), []);
  const lastScroll = useRef(typeof window === "undefined" ? 0 : window.scrollY);

  const model = useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      const src = mesh.material as THREE.MeshStandardMaterial;
      // physical material: a glossy coat reads as glazed chocolate and wet fruit
      const mat = new THREE.MeshPhysicalMaterial({
        map: src.map,
        normalMap: src.normalMap,
        normalScale: new THREE.Vector2(1.0, 1.0),
        roughnessMap: src.roughnessMap,
        metalnessMap: src.metalnessMap,
        aoMap: src.aoMap,
        aoMapIntensity: 1.0,
        roughness: 0.82,
        metalness: 0,
        clearcoat: 0.38,
        clearcoatRoughness: 0.32,
        sheen: 0.3,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color("#fff0f0"),
        envMapIntensity: 1.5,
      });
      for (const t of [mat.map, mat.normalMap, mat.roughnessMap, mat.aoMap]) if (t) t.anisotropy = 8;
      addGlints(mat, uniforms);
      mesh.material = mat;
      src.dispose();
    });
    return m;
  }, [scene, uniforms]);

  const plate = useMemo(() => ({ geo: makePlateGeometry(), mat: makePlateMaterial() }), []);
  useEffect(
    () => () => {
      plate.geo.dispose();
      plate.mat.dispose();
    },
    [plate],
  );

  // compile shaders and upload the 4K textures now (behind the preloader), then announce readiness
  useEffect(() => {
    let alive = true;
    (async () => {
      model.traverse((o) => {
        const mat = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
        if (!mat) return;
        for (const t of [mat.map, mat.normalMap, mat.roughnessMap, mat.aoMap]) if (t) gl.initTexture(t);
      });
      try {
        await gl.compileAsync(model, camera, root3);
      } catch {}
      if (alive) onReady();
    })();
    return () => {
      alive = false;
    };
  }, [model, gl, camera, root3, onReady]);

  useFrame((state, rawDt) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(rawDt, 0.05);
    const start = introStart.current;
    const t = start == null ? 0 : state.clock.elapsedTime - start;

    if (drag.dragging) {
      yaw.current += drag.yaw;
      spinVel.current = drag.yaw / Math.max(dt, 0.001);
      drag.yaw = 0;
    } else {
      spinVel.current = THREE.MathUtils.damp(spinVel.current, 0.14, 1.6, dt);
      yaw.current += spinVel.current * dt;
    }
    const sy = window.scrollY;
    yaw.current += (sy - lastScroll.current) * 0.0035;
    lastScroll.current = sy;
    const swirl = Math.pow(Math.max(0, 1 - t / 2.4), 3) * 2.2;
    g.rotation.y = yaw.current + swirl + pointer.x * 0.08;
    const pop = easeOutBack(clamp01(t / 1.0));
    g.scale.setScalar(Math.max(0.0001, FIT * (0.85 + 0.15 * pop)));
    g.position.y = HALF_H * (0.85 + 0.15 * pop);

    // object → view rotation for the glint facets
    g.updateMatrixWorld();
    tmp.multiplyMatrices(state.camera.matrixWorldInverse, g.matrixWorld);
    feed(uniforms, tmp, state.clock.elapsedTime);
  });

  return (
    <group ref={root}>
      <primitive object={model} />
      {/* clean porcelain plate replaces the model's own: rim, glaze, soft shadow */}
      <mesh geometry={plate.geo} material={plate.mat} position={[0, -0.4715, 0]} scale={0.73} castShadow receiveShadow />
    </group>
  );
}
