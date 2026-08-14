import { readFileSync } from "node:fs";

function loadGlb(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("Not a GLB (bad magic)");
  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < buf.length) {
    const length = buf.readUInt32LE(offset);
    const type = buf.readUInt32LE(offset + 4);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(data.toString("utf8"));
    if (type === 0x004e4942) bin = data;
    offset += 8 + length;
  }
  if (!json) throw new Error("No JSON chunk");
  return { json, bin };
}

const { json: gltf, bin } = loadGlb(process.argv[2]);
const nodes = gltf.nodes ?? [];
const meshes = gltf.meshes ?? [];
const materials = gltf.materials ?? [];
const accessors = gltf.accessors ?? [];
const bufferViews = gltf.bufferViews ?? [];

const withMatrix = nodes.filter((n) => n.matrix);
console.log(`nodes with explicit matrix: ${withMatrix.length} / ${nodes.length}`);
for (const n of withMatrix.slice(0, 6)) {
  const m = n.matrix;
  console.log(`  ${n.name}: m[0..15]=${m.map((v) => v.toFixed(3)).join(",")}`);
}
console.log();

// Parent map
const parentOf = new Map();
for (let i = 0; i < nodes.length; i++) for (const c of nodes[i].children ?? []) parentOf.set(c, i);

function worldMatrix(nodeIndex) {
  const chain = [];
  const seen = new Set();
  let cur = nodeIndex;
  while (cur !== undefined && !seen.has(cur)) {
    seen.add(cur);
    chain.unshift(cur);
    cur = parentOf.get(cur);
  }
  const identity = () => {
    const m = new Float64Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
  };
  const mul = (a, b) => {
    const out = new Float64Array(16);
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++)
        out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return out;
  };
  const nodeMat = (n) => {
    if (n.matrix) return Float64Array.from(n.matrix);
    const m = identity();
    const t = n.translation ?? [0, 0, 0];
    const r = n.rotation ?? [0, 0, 0, 1];
    const s = n.scale ?? [1, 1, 1];
    const x = r[0], y = r[1], z = r[2], w = r[3];
    const xx = x * x, yy = y * y, zz = z * z;
    const xy = x * y, xz = x * z, yz = y * z;
    const wx = w * x, wy = w * y, wz = w * z;
    m[0] = (1 - 2 * (yy + zz)) * s[0]; m[1] = (2 * (xy + wz)) * s[0]; m[2] = (2 * (xz - wy)) * s[0];
    m[4] = (2 * (xy - wz)) * s[1]; m[5] = (1 - 2 * (xx + zz)) * s[1]; m[6] = (2 * (yz + wx)) * s[1];
    m[8] = (2 * (xz + wy)) * s[2]; m[9] = (2 * (yz - wx)) * s[2]; m[10] = (1 - 2 * (xx + yy)) * s[2];
    m[12] = t[0]; m[13] = t[1]; m[14] = t[2];
    return m;
  };
  let m = identity();
  for (const idx of chain) m = mul(m, nodeMat(nodes[idx]));
  return m;
}

function meshWorldBounds(meshIndex, nodeIndex) {
  const mesh = meshes[meshIndex];
  const world = worldMatrix(nodeIndex);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const prim of mesh.primitives ?? []) {
    const posAcc = prim.attributes?.POSITION;
    if (posAcc === undefined) continue;
    const acc = accessors[posAcc];
    if (acc.componentType !== 5126) continue;
    const bv = bufferViews[acc.bufferView];
    const byteOffset = bv.byteOffset + (acc.byteOffset ?? 0);
    const stride = bv.byteStride ?? 12;
    for (let i = 0; i < acc.count; i++) {
      const o = byteOffset + i * stride;
      const x = bin.readFloatLE(o);
      const y = bin.readFloatLE(o + 4);
      const z = bin.readFloatLE(o + 8);
      const wx = world[0] * x + world[4] * y + world[8] * z + world[12];
      const wy = world[1] * x + world[5] * y + world[9] * z + world[13];
      const wz = world[2] * x + world[6] * y + world[10] * z + world[14];
      if (wx < min[0]) min[0] = wx;
      if (wy < min[1]) min[1] = wy;
      if (wz < min[2]) min[2] = wz;
      if (wx > max[0]) max[0] = wx;
      if (wy > max[1]) max[1] = wy;
      if (wz > max[2]) max[2] = wz;
    }
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}

// Print the path from root to a node
function pathTo(nodeIndex) {
  const parts = [];
  const seen = new Set();
  let cur = nodeIndex;
  while (cur !== undefined && !seen.has(cur)) {
    seen.add(cur);
    parts.unshift(nodes[cur].name ?? `#${cur}`);
    cur = parentOf.get(cur);
  }
  return parts.join(" > ");
}

const interesting = new Set(process.argv.slice(2));
const rows = [];
for (let ni = 0; ni < nodes.length; ni++) {
  const n = nodes[ni];
  if (n.mesh === undefined) continue;
  const mesh = meshes[n.mesh];
  const matName =
    mesh.primitives?.[0]?.material !== undefined
      ? materials[mesh.primitives[0].material]?.name ?? "?"
      : "none";
  const { size, min, max } = meshWorldBounds(n.mesh, ni);
  rows.push({ nodeName: n.name, meshName: mesh.name, material: matName, size, min, max, ni });
}

console.log("World-space layout of all meshes (sorted by max z, descending):");
console.log("mesh\tnode\tmaterial\tx\ty\tz\tthinAxis\tzRange\tpath");
for (const r of [...rows].sort((a, b) => b.max[2] - a.max[2])) {
  const [sx, sy, sz] = r.size.map((v) => v.toFixed(2));
  const thin = Math.min(r.size[0], r.size[1], r.size[2]);
  const thinAxis = thin === r.size[0] ? "x" : thin === r.size[1] ? "y" : "z";
  const zRange = `${r.min[2].toFixed(2)}..${r.max[2].toFixed(2)}`;
  const mark = interesting.has(r.meshName) ? "  <===" : "";
  console.log(
    `${r.meshName}\t${r.nodeName}\t${r.material}\t${sx}\t${sy}\t${sz}\t${thinAxis}\t${zRange}\t${pathTo(r.ni)}${mark}`,
  );
}
