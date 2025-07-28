/*
 * main.js (non‑module version)
 *
 * This script builds the 3D room using the global THREE namespace and the
 * OrbitControls helper loaded from legacy builds. Because it does not
 * use ES module imports, it is simpler to host on static platforms
 * that restrict module loading. Be sure to serve this page via a web
 * server (e.g. GitHub Pages or `python -m http.server`) rather than
 * opening it directly with file://.
 */

//
// This self‑invoking function builds a compact, rounded room using
// Three.js without modules.  The design more closely mirrors the
// reference layout: a small, cosy square base with filleted corners
// and soft walls.  Furniture placement and proportions have been
// carefully tuned to match the sample mini room.  A local copy of
// Three.js and OrbitControls should be loaded in index.html.
//
(function() {
  const container = document.getElementById('container');
  const scene = new THREE.Scene();
  // Soft grey background similar to the reference
  scene.background = new THREE.Color(0xf0f0f3);

  // Setup camera looking slightly down into the room.  The target is the
  // approximate centre of the floor.  The distance and angle are
  // adjusted to frame the rounded corners nicely.
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(10, 8, 10);
  camera.lookAt(4.5, 1.8, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Enable orbit controls with damping for smooth interaction
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.minDistance = 5;
  controls.maxDistance = 25;
  controls.target.set(4.5, 1.5, 3.5);

  // Handle window resize
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Lighting: ambient and directional to provide soft, even illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(8, 10, 6);
  scene.add(dirLight);

  /**
   * Create a rounded rectangle shape.  This helper is used to build both the
   * floor and wall profiles.  width/height define the overall size and
   * radius defines the size of the fillet at the front corners.  The top
   * edge can optionally be rounded for walls.
   */
  function createRoundedRectShape(width, height, radius, roundTop = false) {
    const shape = new THREE.Shape();
    // Start at bottom left corner (without radius)
    shape.moveTo(0, 0);
    // Left edge up
    shape.lineTo(0, height - (roundTop ? radius : 0));
    if (roundTop) {
      shape.quadraticCurveTo(0, height, radius, height);
    } else {
      shape.lineTo(0, height);
    }
    // Top edge to right
    shape.lineTo(width - radius, height);
    shape.quadraticCurveTo(width, height, width, height - radius);
    // Right edge down
    shape.lineTo(width, radius);
    shape.quadraticCurveTo(width, 0, width - radius, 0);
    // Bottom edge to left
    shape.lineTo(radius, 0);
    shape.quadraticCurveTo(0, 0, 0, radius);
    return shape;
  }

  /**
   * Build the cosy rounded room.  The floor is a shallow extruded shape
   * with filleted front corners.  Two walls are extruded from rounded
   * profiles and include matching fillets along their exposed edges.
   */
  function buildRoom() {
    // Dimensions
    const floorWidth = 9;
    const floorDepth = 7;
    const floorThickness = 0.15;
    const wallHeight = 3.5;
    const wallThickness = 0.15;
    // Floor: simple box geometry.  Rounded corners are omitted here to
    // maximise compatibility across Three.js builds.  The origin (0,0)
    // corresponds to the back‑left corner of the room.
    const floorGeom = new THREE.BoxGeometry(floorWidth, floorThickness, floorDepth);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0xd9a679 });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    // Align top surface at y = 0
    floorMesh.position.set(floorWidth / 2, -floorThickness / 2, floorDepth / 2);
    scene.add(floorMesh);
    // Back wall: width along x, height along y, thickness along z
    const backWallGeom = new THREE.BoxGeometry(floorWidth, wallHeight, wallThickness);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5d9d1 });
    const backWall = new THREE.Mesh(backWallGeom, wallMat);
    // Position back wall so bottom at y=wallHeight/2 and z at 0
    backWall.position.set(floorWidth / 2, wallHeight / 2, wallThickness / 2);
    scene.add(backWall);
    // Right wall: depth along z, height along y, thickness along x
    const rightWallGeom = new THREE.BoxGeometry(wallThickness, wallHeight, floorDepth);
    const rightWall = new THREE.Mesh(rightWallGeom, wallMat);
    rightWall.position.set(floorWidth - wallThickness / 2, wallHeight / 2, floorDepth / 2);
    scene.add(rightWall);
  }

  function createSofa() {
    const group = new THREE.Group();
    const seatGeom = new THREE.BoxGeometry(3, 0.4, 1.2);
    const backGeom = new THREE.BoxGeometry(3, 1, 0.2);
    const armGeom = new THREE.BoxGeometry(0.3, 0.8, 1.2);
    // Sofa in soft orange tone
    // Soft brown tones for the sofa inspired by the reference scene
    const seatMat = new THREE.MeshLambertMaterial({ color: 0x9b7046 });
    const backMat = new THREE.MeshLambertMaterial({ color: 0x9b7046 });
    const armMat = new THREE.MeshLambertMaterial({ color: 0x8a6540 });
    const seat = new THREE.Mesh(seatGeom, seatMat);
    seat.position.set(0, 0.2, 0);
    const backrest = new THREE.Mesh(backGeom, backMat);
    backrest.position.set(0, 0.9, -0.5);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-1.65, 0.4, 0);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(1.65, 0.4, 0);
    group.add(seat);
    group.add(backrest);
    group.add(leftArm);
    group.add(rightArm);
    return group;
  }

  function createFridge() {
    const group = new THREE.Group();
    const bodyGeom = new THREE.BoxGeometry(1, 2.5, 1);
    // Soft pastel blue fridge
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xa8d9e7 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    const handleGeom = new THREE.BoxGeometry(0.05, 0.6, 0.1);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.set(0.45, 0.75, 0.55);
    group.add(body);
    group.add(handle);
    return group;
  }

  function createTable() {
    const group = new THREE.Group();
    const topGeom = new THREE.BoxGeometry(2, 0.2, 1);
    const legGeom = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xf7c678 });
    const top = new THREE.Mesh(topGeom, woodMat);
    top.position.set(0, 0.7, 0);
    group.add(top);
    const pos = [
      [-0.95, 0.3, -0.45],
      [0.95, 0.3, -0.45],
      [-0.95, 0.3, 0.45],
      [0.95, 0.3, 0.45],
    ];
    for (let i = 0; i < pos.length; i++) {
      const leg = new THREE.Mesh(legGeom, woodMat);
      leg.position.set(pos[i][0], pos[i][1], pos[i][2]);
      group.add(leg);
    }
    return group;
  }

  /**
   * Build a simple cartoon black cat model using basic primitives.  The cat
   * comprises a scaled sphere for the body, a round head, triangular ears,
   * a thin tail and two small eyes.  This model is intentionally kept low
   * poly to maintain the playful, isometric style of the reference image.
   */
  function createCat() {
    const cat = new THREE.Group();
    // Materials
    const furMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    // Body: an oval created by scaling a sphere
    const bodyGeom = new THREE.SphereGeometry(0.35, 32, 16);
    const body = new THREE.Mesh(bodyGeom, furMat);
    body.scale.set(1.2, 0.6, 1); // elongated horizontally, flatter vertically
    body.position.set(0, 0.3, 0);
    cat.add(body);
    // Head
    const headGeom = new THREE.SphereGeometry(0.25, 32, 16);
    const head = new THREE.Mesh(headGeom, furMat);
    head.position.set(0, 0.65, 0.3);
    cat.add(head);
    // Ears: two cones oriented upwards
    const earGeom = new THREE.ConeGeometry(0.12, 0.25, 16);
    const leftEar = new THREE.Mesh(earGeom, furMat);
    leftEar.position.set(-0.12, 0.9, 0.18);
    leftEar.rotation.z = Math.PI;
    cat.add(leftEar);
    const rightEar = new THREE.Mesh(earGeom, furMat);
    rightEar.position.set(0.12, 0.9, 0.18);
    rightEar.rotation.z = Math.PI;
    cat.add(rightEar);
    // Tail: slender cylinder tilted upward
    const tailGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12);
    const tail = new THREE.Mesh(tailGeom, furMat);
    // pivot group for tail so we can rotate around its base
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.45, -0.15);
    tail.position.set(0, 0.3, 0);
    tail.rotation.x = Math.PI / 4; // tilt the tail upward
    tailPivot.add(tail);
    cat.add(tailPivot);
    // Eyes: two nested spheres (white + pupil) to give a friendly look
    const eyeWhiteGeom = new THREE.SphereGeometry(0.05, 16, 8);
    const eyePupilGeom = new THREE.SphereGeometry(0.02, 8, 6);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    const leftPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
    const rightPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
    // Position eyes on the head
    leftEyeWhite.position.set(-0.07, 0.68, 0.45);
    rightEyeWhite.position.set(0.07, 0.68, 0.45);
    leftPupil.position.set(-0.07, 0.68, 0.47);
    rightPupil.position.set(0.07, 0.68, 0.47);
    cat.add(leftEyeWhite);
    cat.add(rightEyeWhite);
    cat.add(leftPupil);
    cat.add(rightPupil);
    return cat;
  }

  /**
   * Build a simple cartoon Chihuahua.  The model uses a scaled sphere for
   * the body, a larger head, pronounced ears, a small snout, paws, a tail
   * and facial details.  Colours are pastel cream to match the reference.
   */
  function createDog() {
    const dog = new THREE.Group();
    // Materials
    const furMat = new THREE.MeshLambertMaterial({ color: 0xf8e7d4 });
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x423e37 });
    const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    // Body: elongated sphere scaled along x/z
    const bodyGeom = new THREE.SphereGeometry(0.4, 32, 16);
    const body = new THREE.Mesh(bodyGeom, furMat);
    body.scale.set(1.2, 0.7, 0.8);
    body.position.set(0, 0.4, 0);
    dog.add(body);
    // Head: slightly larger sphere
    const headGeom = new THREE.SphereGeometry(0.35, 32, 16);
    const head = new THREE.Mesh(headGeom, furMat);
    head.position.set(0, 0.95, 0.3);
    dog.add(head);
    // Snout: a small cylinder
    const snoutGeom = new THREE.CylinderGeometry(0.15, 0.12, 0.25, 16);
    const snout = new THREE.Mesh(snoutGeom, furMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.9, 0.55);
    dog.add(snout);
    // Nose: tiny sphere at the end of snout
    const noseGeom = new THREE.SphereGeometry(0.04, 8, 6);
    const nose = new THREE.Mesh(noseGeom, noseMat);
    nose.position.set(0, 0.9, 0.68);
    dog.add(nose);
    // Ears: Chihuahua has large upright ears
    const earGeom = new THREE.ConeGeometry(0.15, 0.35, 16);
    const leftEar = new THREE.Mesh(earGeom, furMat);
    leftEar.position.set(-0.25, 1.15, 0.2);
    leftEar.rotation.z = Math.PI;
    dog.add(leftEar);
    const rightEar = new THREE.Mesh(earGeom, furMat);
    rightEar.position.set(0.25, 1.15, 0.2);
    rightEar.rotation.z = Math.PI;
    dog.add(rightEar);
    // Eyes: white sclera with black pupils
    const eyeWhiteGeom = new THREE.SphereGeometry(0.06, 16, 8);
    const eyePupilGeom = new THREE.SphereGeometry(0.025, 8, 6);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    const leftPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
    const rightPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
    leftEyeWhite.position.set(-0.12, 0.96, 0.55);
    rightEyeWhite.position.set(0.12, 0.96, 0.55);
    leftPupil.position.set(-0.12, 0.96, 0.58);
    rightPupil.position.set(0.12, 0.96, 0.58);
    dog.add(leftEyeWhite);
    dog.add(rightEyeWhite);
    dog.add(leftPupil);
    dog.add(rightPupil);
    // Legs: four short cylinders
    const legGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12);
    const legPositions = [
      [-0.2, 0.2, -0.15],
      [0.2, 0.2, -0.15],
      [-0.2, 0.2, 0.15],
      [0.2, 0.2, 0.15],
    ];
    for (const pos of legPositions) {
      const leg = new THREE.Mesh(legGeom, furMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      dog.add(leg);
    }
    // Tail: slender cylinder with slight curl
    const tailGeom = new THREE.CylinderGeometry(0.05, 0.04, 0.6, 12);
    const tail = new THREE.Mesh(tailGeom, furMat);
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.6, -0.35);
    tail.position.set(0, 0.3, 0);
    tail.rotation.x = -Math.PI / 3;
    tailPivot.add(tail);
    dog.add(tailPivot);
    return dog;
  }

  /**
   * Create a potted plant composed of a brown pot, a trunk and broad leaves. The
   * design is simple but evokes the look of an indoor house plant.
   */
  function createPlant() {
    const plant = new THREE.Group();
    // Pot
    const potGeom = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 16);
    const potMat = new THREE.MeshLambertMaterial({ color: 0x9b7046 });
    const pot = new THREE.Mesh(potGeom, potMat);
    pot.position.set(0, 0.2, 0);
    plant.add(pot);
    // Soil
    const soilGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16);
    const soilMat = new THREE.MeshLambertMaterial({ color: 0x49392d });
    const soil = new THREE.Mesh(soilGeom, soilMat);
    soil.position.set(0, 0.43, 0);
    plant.add(soil);
    // Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.set(0, 0.75, 0);
    plant.add(trunk);
    // Leaves: three large ellipses using scaled spheres
    const leafGeom = new THREE.SphereGeometry(0.3, 16, 8);
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x6cbf5b });
    const leafPositions = [
      [0.3, 1.0, 0],
      [-0.3, 1.1, 0.1],
      [0, 1.1, -0.3],
    ];
    leafPositions.forEach((pos) => {
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.scale.set(1.2, 0.4, 0.6);
      leaf.position.set(pos[0], pos[1], pos[2]);
      plant.add(leaf);
    });
    return plant;
  }

  /**
   * Create a simple clothing rack with two vertical supports, a cross bar
   * and a few hanging shirts represented as flat boxes.  This approximates
   * the clothing rack seen in the reference scene.
   */
  function createClothingRack() {
    const rack = new THREE.Group();
    // Materials
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x9a7f59 });
    // Vertical poles
    const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8);
    const leftPole = new THREE.Mesh(poleGeom, poleMat);
    const rightPole = new THREE.Mesh(poleGeom, poleMat);
    leftPole.position.set(-0.5, 1.1, 0);
    rightPole.position.set(0.5, 1.1, 0);
    rack.add(leftPole);
    rack.add(rightPole);
    // Cross bar
    const barGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
    const bar = new THREE.Mesh(barGeom, poleMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 2.1, 0);
    rack.add(bar);
    // Shirts: thin boxes hanging off the bar
    const shirtGeom = new THREE.BoxGeometry(0.6, 0.7, 0.05);
    const colors = [0x184e8e, 0x252525, 0x22495d];
    colors.forEach((col, i) => {
      const mat = new THREE.MeshLambertMaterial({ color: col });
      const shirt = new THREE.Mesh(shirtGeom, mat);
      shirt.position.set(-0.35 + i * 0.35, 1.5, 0.03 * (i % 2 ? -1 : 1));
      rack.add(shirt);
    });
    return rack;
  }

  /**
   * Create a wall shelf with a board and a few hats. Hats are represented
   * by shallow cones.  A small trophy is added as a gold cone on a base.
   */
  function createShelfWithHats() {
    const shelf = new THREE.Group();
    // Shelf board
    const boardGeom = new THREE.BoxGeometry(1.2, 0.1, 0.3);
    const boardMat = new THREE.MeshLambertMaterial({ color: 0x9a7f59 });
    const board = new THREE.Mesh(boardGeom, boardMat);
    board.position.set(0, 0, 0);
    shelf.add(board);
    // Hats
    const hatGeom = new THREE.ConeGeometry(0.15, 0.1, 16);
    const hatMat = new THREE.MeshLambertMaterial({ color: 0xdcdcdc });
    for (let i = 0; i < 3; i++) {
      const hat = new THREE.Mesh(hatGeom, hatMat);
      hat.rotation.x = Math.PI;
      hat.position.set(-0.4 + i * 0.4, 0.15, 0);
      shelf.add(hat);
    }
    // Trophy (gold) on left side
    const baseGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x8a572a });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.set(-0.6, 0.05, 0);
    shelf.add(base);
    const trophyGeom = new THREE.ConeGeometry(0.1, 0.25, 16);
    const trophyMat = new THREE.MeshLambertMaterial({ color: 0xf3d250 });
    const trophy = new THREE.Mesh(trophyGeom, trophyMat);
    trophy.position.set(-0.6, 0.25, 0);
    shelf.add(trophy);
    return shelf;
  }

  /**
   * Create a desk with a laptop and stool.  The desk is a simple table
   * with four legs, the laptop is an open clamshell consisting of base
   * and screen, and the stool is a small cube.  A mug is added for
   * detail.
   */
  function createDesk() {
    const deskGroup = new THREE.Group();
    // Desk top and legs
    const topGeom = new THREE.BoxGeometry(1.2, 0.1, 0.6);
    const legGeom = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xa07c5b });
    const top = new THREE.Mesh(topGeom, woodMat);
    top.position.set(0, 0.55, 0);
    deskGroup.add(top);
    const legPositions = [
      [-0.55, 0.25, -0.25],
      [0.55, 0.25, -0.25],
      [-0.55, 0.25, 0.25],
      [0.55, 0.25, 0.25],
    ];
    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeom, woodMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      deskGroup.add(leg);
    });
    // Laptop base
    const baseGeom = new THREE.BoxGeometry(0.5, 0.02, 0.35);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const laptopBase = new THREE.Mesh(baseGeom, baseMat);
    laptopBase.position.set(0.1, 0.62, -0.05);
    deskGroup.add(laptopBase);
    // Laptop screen
    const screenGeom = new THREE.BoxGeometry(0.5, 0.3, 0.02);
    const screenMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const laptopScreen = new THREE.Mesh(screenGeom, screenMat);
    laptopScreen.position.set(0.1, 0.76, -0.18);
    laptopScreen.rotation.x = -Math.PI / 1.8;
    deskGroup.add(laptopScreen);
    // Stool
    const stoolGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const stoolMat = new THREE.MeshLambertMaterial({ color: 0x6b5350 });
    const stool = new THREE.Mesh(stoolGeom, stoolMat);
    stool.position.set(-0.8, 0.2, 0);
    deskGroup.add(stool);
    // Mug
    const mugGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12);
    const mugMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mug = new THREE.Mesh(mugGeom, mugMat);
    mug.position.set(0.4, 0.63, 0.1);
    deskGroup.add(mug);
    return deskGroup;
  }

  /**
   * Create a robot vacuum (roomba) as a flat cylinder with a top disc.
   */
  function createRobotVacuum() {
    const group = new THREE.Group();
    const baseGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xd9d9d9 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 0.025;
    group.add(base);
    const topGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32);
    const topMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const top = new THREE.Mesh(topGeom, topMat);
    top.position.y = 0.06;
    group.add(top);
    return group;
  }

  /**
   * Create a rug as a thin box slightly above the floor.  The rug is a
   * light neutral colour to complement the floor and furniture.
   */
  function createRug() {
    const rugGeom = new THREE.BoxGeometry(2.5, 0.02, 1.6);
    const rugMat = new THREE.MeshLambertMaterial({ color: 0xf6f0e1 });
    const rug = new THREE.Mesh(rugGeom, rugMat);
    rug.position.set(2.5, 0.01, 1.6);
    return rug;
  }

  /**
   * Create a simple window with a scenic view.  The view is simulated
   * using a gradient drawn on a canvas: blue sky above green grass.  The
   * window frame has a pastel green colour and crossbars.
   */
  function createWindow() {
    const windowGroup = new THREE.Group();
    // Create canvas texture for the view
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    // Gradient sky
    const grd = ctx.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#88c9f9');
    grd.addColorStop(1, '#7cb342');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 256, 256);
    // Few clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(80, 80, 30, 0, Math.PI * 2);
    ctx.arc(120, 80, 25, 0, Math.PI * 2);
    ctx.arc(100, 60, 20, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    // Background plane
    const viewGeom = new THREE.PlaneGeometry(1.6, 1.2);
    const viewMat = new THREE.MeshBasicMaterial({ map: texture });
    const view = new THREE.Mesh(viewGeom, viewMat);
    view.position.set(0, 0, -0.01);
    windowGroup.add(view);
    // Frame
    const frameGeom = new THREE.BoxGeometry(1.7, 1.3, 0.05);
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xc6d8d3 });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.position.set(0, 0, 0);
    windowGroup.add(frame);
    // Crossbars (vertical and horizontal)
    const barGeomH = new THREE.BoxGeometry(1.7, 0.05, 0.05);
    const barGeomV = new THREE.BoxGeometry(0.05, 1.3, 0.05);
    const barMat = new THREE.MeshLambertMaterial({ color: 0xc6d8d3 });
    const barH = new THREE.Mesh(barGeomH, barMat);
    barH.position.set(0, 0, 0.026);
    windowGroup.add(barH);
    const barV = new THREE.Mesh(barGeomV, barMat);
    barV.position.set(0, 0, 0.026);
    windowGroup.add(barV);
    return windowGroup;
  }

  /**
   * Create a simple curtain set consisting of a rod and two curtain panels.
   */
  function createCurtains() {
    const curtains = new THREE.Group();
    // Rod
    const rodGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.9, 12);
    const rodMat = new THREE.MeshLambertMaterial({ color: 0xb48463 });
    const rod = new THREE.Mesh(rodGeom, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 0.65, 0.07);
    curtains.add(rod);
    // Panels
    const panelGeom = new THREE.BoxGeometry(0.9, 1.3, 0.02);
    const panelMat = new THREE.MeshLambertMaterial({ color: 0xd2aa8a });
    const leftPanel = new THREE.Mesh(panelGeom, panelMat);
    leftPanel.position.set(-0.5, 0, 0);
    curtains.add(leftPanel);
    const rightPanel = new THREE.Mesh(panelGeom, panelMat);
    rightPanel.position.set(0.5, 0, 0);
    curtains.add(rightPanel);
    return curtains;
  }

  /**
   * Create a coffee machine to sit on top of the fridge.  It consists
   * of a main body, a spout and a control panel.  Colours are soft
   * pastel tones.
   */
  function createCoffeeMachine() {
    const machine = new THREE.Group();
    // Body
    const bodyGeom = new THREE.BoxGeometry(0.5, 0.6, 0.4);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xa5d6d3 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, 0.3, 0);
    machine.add(body);
    // Spout
    const spoutGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 12);
    const spoutMat = new THREE.MeshLambertMaterial({ color: 0x8fbca3 });
    const spout = new THREE.Mesh(spoutGeom, spoutMat);
    spout.rotation.x = Math.PI / 2;
    spout.position.set(0.2, 0.45, 0.2);
    machine.add(spout);
    // Control panel
    const panelGeom = new THREE.BoxGeometry(0.3, 0.3, 0.02);
    const panelMat = new THREE.MeshLambertMaterial({ color: 0xdeeef0 });
    const panel = new THREE.Mesh(panelGeom, panelMat);
    panel.position.set(-0.1, 0.45, 0.21);
    machine.add(panel);
    return machine;
  }

  /**
   * Load an image from the given relative path and mount it into a
   * picture frame on the wall.  The frame consists of a thin box
   * surrounding a plane displaying the texture.  When the texture
   * finishes loading, the group is positioned and rotated as
   * specified.  Use basic material for the image so it is not
   * affected by lights.
   *
   * @param {string} imagePath Relative path to the image in assets.
   * @param {number} width Width of the picture area (world units).
   * @param {number} height Height of the picture area (world units).
   * @param {number} frameThickness Thickness of the frame border.
   * @param {Object} position World position { x, y, z } of the frame centre.
   * @param {number} rotationY Rotation about the Y axis (radians).
   */
  const textureLoader = new THREE.TextureLoader();
  function addPictureFrame(imagePath, width, height, frameThickness, position, rotationY) {
    textureLoader.load(imagePath, function(texture) {
      const group = new THREE.Group();
      // Picture plane slightly offset from the frame to avoid z‑fighting
      const picGeom = new THREE.PlaneGeometry(width, height);
      const picMat = new THREE.MeshBasicMaterial({ map: texture });
      const picMesh = new THREE.Mesh(picGeom, picMat);
      picMesh.position.set(0, 0, frameThickness * 0.6);
      group.add(picMesh);
      // Frame as a shallow box
      const frameGeom = new THREE.BoxGeometry(width + 2 * frameThickness, height + 2 * frameThickness, frameThickness);
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x8b6b4a });
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);
      group.add(frameMesh);
      group.position.set(position.x, position.y, position.z);
      group.rotation.y = rotationY;
      scene.add(group);
    });
  }

  buildRoom();
  // --- Add objects in the new cosy layout ---
  // Sofa: oriented along the depth (z) axis and placed near the left wall
  const sofa = createSofa();
  // Scale down slightly to fit the smaller room and keep rounded feel
  sofa.scale.set(1.0, 1.0, 1.0);
  // Rotate so the sofa backs onto the left wall (original design was
  // oriented along x; rotate by 90° around y to align along z)
  sofa.rotation.y = Math.PI / 2;
  // Position: close to the left wall (x≈1.8) and centred along depth (z≈3.5)
  sofa.position.set(1.8, 0, 3.5);
  scene.add(sofa);
  // Coffee table in front of sofa, aligned with sofa centre but shifted
  // slightly towards the room interior (x≈3.3)
  const table = createTable();
  table.scale.set(0.9, 1.0, 0.9);
  table.position.set(3.3, 0, 3.5);
  scene.add(table);
  // Rug beneath sofa and table; scaled to fit the new layout
  const rug = createRug();
  rug.scale.set(0.8, 1.0, 0.8);
  rug.position.set(3.0, 0.0, 3.5);
  scene.add(rug);
  // Plant in the back corner near the sofa
  const plant = createPlant();
  plant.scale.set(0.8, 0.8, 0.8);
  plant.position.set(0.8, 0, 5.5);
  scene.add(plant);
  // Clothing rack behind the sofa along the back wall
  const rack = createClothingRack();
  rack.scale.set(0.8, 0.8, 0.8);
  rack.position.set(2.5, 0, 1.2);
  // Rotate the rack to face into the room (default orientation faces z)
  rack.rotation.y = Math.PI;
  scene.add(rack);
  // Shelf with hats above the plant on the back wall
  const shelf = createShelfWithHats();
  shelf.scale.set(0.9, 0.9, 0.9);
  shelf.position.set(0.8, 2.5, 1.0);
  shelf.rotation.y = Math.PI;
  scene.add(shelf);
  // Fridge in the right corner
  const fridge = createFridge();
  fridge.scale.set(0.8, 0.8, 0.8);
  fridge.position.set(8.0, 1.0, 1.5);
  scene.add(fridge);
  // Coffee machine on top of fridge
  const coffeeMachine = createCoffeeMachine();
  coffeeMachine.scale.set(0.5, 0.5, 0.5);
  coffeeMachine.position.set(8.0, 2.2, 1.5);
  scene.add(coffeeMachine);
  // Desk with laptop near fridge on the right wall
  const desk = createDesk();
  desk.scale.set(0.8, 0.8, 0.8);
  desk.position.set(7.8, 0, 3.5);
  desk.rotation.y = -Math.PI / 2;
  scene.add(desk);
  // Window with curtains on the right wall above the desk
  // Avoid shadowing the global `window` object.  We rename the
  // returned mesh so that referencing `window.innerWidth` above
  // does not trigger a Temporal Dead Zone (TDZ) error.  See
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/ReferenceError#temporal_dead_zone for details.
  const houseWindow = createWindow();
  houseWindow.position.set(8.97, 1.8, 3.5);
  houseWindow.rotation.y = -Math.PI / 2;
  scene.add(houseWindow);
  const curtains = createCurtains();
  curtains.position.set(8.99, 1.8, 3.5);
  curtains.rotation.y = -Math.PI / 2;
  scene.add(curtains);
  // Robot vacuum cleaner near the centre of the room
  const robotVacuum = createRobotVacuum();
  robotVacuum.scale.set(0.8, 0.8, 0.8);
  robotVacuum.position.set(4.0, 0, 2.0);
  scene.add(robotVacuum);
  // Cat outside the window looking in
  const cat = createCat();
  cat.scale.set(0.7, 0.7, 0.7);
  cat.position.set(9.3, 0, 3.5);
  cat.rotation.y = Math.PI / 2;
  scene.add(cat);
  // Dog sitting on the sofa
  const dog = createDog();
  dog.scale.set(0.7, 0.7, 0.7);
  dog.position.set(1.8, 0.5, 3.5);
  dog.rotation.y = -Math.PI / 2;
  scene.add(dog);

  // --- Add picture frames with user‑provided images ---
  // Back wall images (facing +z).  Place above sofa and evenly spaced.
  addPictureFrame('assets/logo21.jpg', 0.9, 0.9, 0.08, { x: 2.5, y: 2.4, z: 0.08 }, 0);
  addPictureFrame('assets/tattoo.jpg', 0.9, 0.9, 0.08, { x: 4.5, y: 2.4, z: 0.08 }, 0);
  addPictureFrame('assets/cat_photo.jpg', 0.9, 0.9, 0.08, { x: 6.5, y: 2.4, z: 0.08 }, 0);
  // Right wall images (facing ‑x).  Place above desk and fridge.
  addPictureFrame('assets/friend_top.jpg', 0.8, 1.0, 0.08, { x: 8.85, y: 2.4, z: 4.5 }, -Math.PI / 2);
  addPictureFrame('assets/ready_player_one.jpg', 0.8, 1.2, 0.08, { x: 8.85, y: 1.8, z: 2.5 }, -Math.PI / 2);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  // Once initialisation is complete, hide the overlay to reveal the scene
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  // Handle mode toggle: switch between 3D and static preview
  const modeToggle = document.getElementById('mode-toggle');
  const containerDiv = document.getElementById('container');
  const staticImageDiv = document.getElementById('static-image');
  if (modeToggle) {
    modeToggle.addEventListener('change', function() {
      if (this.checked) {
        containerDiv.style.display = 'block';
        staticImageDiv.style.display = 'none';
      } else {
        containerDiv.style.display = 'none';
        staticImageDiv.style.display = 'flex';
      }
    });
  }
  animate();
})();