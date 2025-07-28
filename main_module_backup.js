/*
 * main.js (module version)
 *
 * This module constructs a miniature interactive 3D room using Three.js.
 * The module imports Three.js and the OrbitControls helper from a CDN via
 * ES module syntax. Because modern versions of Three.js are published
 * primarily as modules, this approach avoids issues with deprecated
 * global builds. To view this scene locally you should serve the
 * project via a local web server (for example: `python3 -m http.server`)
 * to allow the browser to load ES module imports. On a live website
 * these imports will load automatically.
 */

import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.154.0/examples/jsm/controls/OrbitControls.js';

// Grab the container element from the DOM. All subsequent Three.js
// rendering will occur within this element.
const container = document.getElementById('container');

// Create a new scene and set a soft background colour reminiscent of
// daylight. This helps objects stand out against the sky-like hue.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdde7f0);

// Configure a perspective camera. A 60° field of view combined with
// reasonable near and far clipping planes gives a natural look to the
// scene. The camera starts above and in front of the room looking
// towards its centre.
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(8, 6, 12);
camera.lookAt(new THREE.Vector3(0, 2, 0));

// Create the WebGL renderer. Antialiasing smooths out jagged edges. The
// renderer's canvas is appended to our container div. Pixel ratio is
// scaled to the device's display for crisp rendering on high‑DPI
// screens.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Set up orbit controls so the user can explore the room interactively.
// Damping provides inertia so camera movements feel more natural. Limit
// the zoom range to keep the camera inside sensible bounds.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.minDistance = 3;
controls.maxDistance = 30;
controls.target.set(0, 2, 0);

// Respond to browser resize events by updating the camera aspect ratio
// and renderer size.
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting: use a combination of ambient and directional light to
// illuminate objects from multiple angles. The directional light acts
// like sunlight streaming through the window.
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

/**
 * Helper to create a wall segment. Walls are constructed from thin
 * boxes so they have physical thickness and respond properly to
 * lighting. Each wall can be given a unique colour.
 *
 * @param {number} width - horizontal length of the wall
 * @param {number} height - vertical height of the wall
 * @param {number} depth - thickness of the wall
 * @param {number} color - hex colour of the wall
 * @returns {THREE.Mesh} a mesh representing the wall segment
 */
function createWallSegment(width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

/**
 * Build the enclosing room with a floor and three walls. The left
 * wall contains an opening representing a window; this is achieved by
 * splitting the wall into four discrete segments that surround the
 * window opening. Walls are thin boxes so both faces are visible.
 */
function buildRoom() {
  // Floor: a thick plane so both sides can render if the user
  // accidentally navigates under the floor. Brown colour suggests
  // wooden flooring.
  const floor = createWallSegment(10, 0.1, 8, 0x8b675a);
  floor.position.y = -0.05;
  scene.add(floor);

  // Back wall spanning the width of the room.
  const backWall = createWallSegment(10, 5, 0.1, 0xe0e0e0);
  backWall.position.set(0, 2.5, -4);
  scene.add(backWall);

  // Right wall spanning the depth of the room.
  const rightWall = createWallSegment(0.1, 5, 8, 0xf0f0f0);
  rightWall.position.set(5, 2.5, 0);
  scene.add(rightWall);

  // Left wall segments with window cut‑out. All segments share the same
  // thickness and colour.
  const wallColor = 0xf0f0f0;
  const t = 0.1; // thickness
  // Left side of window: spans z from -4 to -1.5
  const leftSide = createWallSegment(t, 5, 2.5, wallColor);
  leftSide.position.set(-5, 2.5, -2.75);
  scene.add(leftSide);
  // Right side of window: spans z from 1.5 to 4
  const rightSide = createWallSegment(t, 5, 2.5, wallColor);
  rightSide.position.set(-5, 2.5, 2.75);
  scene.add(rightSide);
  // Top segment above the window: height 1.5, spans z from -1.5 to 1.5
  const topSegment = createWallSegment(t, 1.5, 3, wallColor);
  topSegment.position.set(-5, 4.25, 0);
  scene.add(topSegment);
  // Bottom segment below the window: height 1.5, same span
  const bottomSegment = createWallSegment(t, 1.5, 3, wallColor);
  bottomSegment.position.set(-5, 0.75, 0);
  scene.add(bottomSegment);
}

/**
 * Assemble a sofa from boxes representing the seat, back and arms.
 * Different shades provide subtle contrast between components. A group
 * is returned so the sofa can be positioned as a single unit.
 *
 * @returns {THREE.Group} assembled sofa
 */
function createSofa() {
  const sofa = new THREE.Group();
  const seatGeom = new THREE.BoxGeometry(3, 0.4, 1.2);
  const backGeom = new THREE.BoxGeometry(3, 1, 0.2);
  const armGeom = new THREE.BoxGeometry(0.3, 0.8, 1.2);
  const seatMat = new THREE.MeshLambertMaterial({ color: 0x7d8ca3 });
  const backMat = new THREE.MeshLambertMaterial({ color: 0x7d8ca3 });
  const armMat = new THREE.MeshLambertMaterial({ color: 0x6c7a89 });
  const seat = new THREE.Mesh(seatGeom, seatMat);
  seat.position.set(0, 0.2, 0);
  const backrest = new THREE.Mesh(backGeom, backMat);
  backrest.position.set(0, 0.9, -0.5);
  const leftArm = new THREE.Mesh(armGeom, armMat);
  leftArm.position.set(-1.65, 0.4, 0);
  const rightArm = new THREE.Mesh(armGeom, armMat);
  rightArm.position.set(1.65, 0.4, 0);
  sofa.add(seat, backrest, leftArm, rightArm);
  return sofa;
}

/**
 * Construct a simple fridge: a tall box with a thin handle.
 *
 * @returns {THREE.Group} assembled fridge
 */
function createFridge() {
  const fridge = new THREE.Group();
  const bodyGeom = new THREE.BoxGeometry(1, 2.5, 1);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  const handleGeom = new THREE.BoxGeometry(0.05, 0.6, 0.1);
  const handleMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
  const handle = new THREE.Mesh(handleGeom, handleMat);
  handle.position.set(0.45, 0.75, 0.55);
  fridge.add(body, handle);
  return fridge;
}

/**
 * Build a coffee table: a flat top supported by four slender legs.
 *
 * @returns {THREE.Group} assembled table
 */
function createTable() {
  const table = new THREE.Group();
  const topGeom = new THREE.BoxGeometry(2, 0.2, 1);
  const legGeom = new THREE.BoxGeometry(0.1, 0.6, 0.1);
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x91672c });
  const top = new THREE.Mesh(topGeom, woodMat);
  top.position.set(0, 0.6 + 0.1, 0);
  table.add(top);
  const legPositions = [
    [-0.95, 0.3, -0.45],
    [0.95, 0.3, -0.45],
    [-0.95, 0.3, 0.45],
    [0.95, 0.3, 0.45],
  ];
  for (const pos of legPositions) {
    const leg = new THREE.Mesh(legGeom, woodMat);
    leg.position.set(pos[0], pos[1], pos[2]);
    table.add(leg);
  }
  return table;
}

/**
 * Build a stylised black cat using simple shapes: spheres for the body
 * and head and cones for the ears. The cat can be repositioned by
 * modifying the group's position.
 *
 * @returns {THREE.Group} assembled cat
 */
function createCat() {
  const cat = new THREE.Group();
  const bodyGeom = new THREE.SphereGeometry(0.3, 32, 16);
  const headGeom = new THREE.SphereGeometry(0.2, 32, 16);
  const earGeom = new THREE.ConeGeometry(0.1, 0.2, 16);
  const mat = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.set(0, 0.3, 0);
  const head = new THREE.Mesh(headGeom, mat);
  head.position.set(0, 0.6, 0.22);
  const leftEar = new THREE.Mesh(earGeom, mat);
  leftEar.position.set(-0.08, 0.8, 0.18);
  leftEar.rotation.z = Math.PI;
  const rightEar = new THREE.Mesh(earGeom, mat);
  rightEar.position.set(0.08, 0.8, 0.18);
  rightEar.rotation.z = Math.PI;
  cat.add(body, head, leftEar, rightEar);
  return cat;
}

/**
 * Build a stylised chihuahua from spheres and cones. The dog has
 * proportionally larger ears and head to distinguish it from the cat.
 * The returned group can be positioned on the sofa.
 *
 * @returns {THREE.Group} assembled dog
 */
function createDog() {
  const dog = new THREE.Group();
  const bodyGeom = new THREE.SphereGeometry(0.35, 32, 16);
  const headGeom = new THREE.SphereGeometry(0.25, 32, 16);
  const earGeom = new THREE.ConeGeometry(0.12, 0.25, 16);
  const mat = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.set(0, 0.35, 0);
  const head = new THREE.Mesh(headGeom, mat);
  head.position.set(0, 0.7, 0.25);
  const leftEar = new THREE.Mesh(earGeom, mat);
  leftEar.position.set(-0.1, 0.95, 0.2);
  leftEar.rotation.z = Math.PI;
  const rightEar = new THREE.Mesh(earGeom, mat);
  rightEar.position.set(0.1, 0.95, 0.2);
  rightEar.rotation.z = Math.PI;
  dog.add(body, head, leftEar, rightEar);
  return dog;
}

// Build scene elements and position them accordingly.
buildRoom();
const sofa = createSofa();
sofa.position.set(0, 0, 1.2);
scene.add(sofa);
const fridge = createFridge();
fridge.position.set(3.5, 1.25, -2.5);
scene.add(fridge);
const table = createTable();
table.position.set(0, 0, -1.5);
scene.add(table);
const cat = createCat();
// Position the cat outside the window. The left wall sits at x = -5,
// so move the cat slightly beyond that to appear outdoors. Keeping z
// centred aligns the cat with the window opening.
cat.position.set(-5.5, 0, 0);
scene.add(cat);
const dog = createDog();
dog.position.set(0.5, 0.5, 1.3);
dog.rotation.y = Math.PI / 2;
scene.add(dog);

// Animation loop: update the controls and render the scene on each
// frame. requestAnimationFrame automatically schedules the next
// iteration in sync with the display refresh rate.
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();