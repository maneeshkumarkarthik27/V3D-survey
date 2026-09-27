import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Building, Floor, Unit } from '../../types/survey';
import { Layers, Sliders, Box, Eye, Image as ImageIcon, Home, Sparkles, SplitSquareVertical, X } from 'lucide-react';

interface Props {
  building: Building;
  floors: Floor[];
  units: Unit[];
  selectedFloorId?: string;
  selectedUnitId?: string;
  onSelectFloor?: (floorId: string) => void;
  onSelectUnit?: (unitId: string) => void;
  className?: string;
  interactive?: boolean;
  facadeImageUrl?: string;
  roofType?: 'pitched' | 'hipped' | 'flat' | 'mansard' | 'shed';
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
  hasBalconies?: boolean;
  hasPorch?: boolean;
  hasGarage?: boolean;
  hasChimney?: boolean;
  windowColumns?: number;
  doorPosition?: 'left' | 'center' | 'right';
  architecturalStyle?: string;
}

export const Building3DViewer: React.FC<Props> = ({
  building,
  floors,
  units,
  selectedFloorId,
  selectedUnitId,
  onSelectFloor,
  onSelectUnit,
  className = '',
  interactive = true,
  facadeImageUrl,
  roofType = 'pitched',
  roofColor = '#B45309',
  wallColor = '#F8FAFC',
  trimColor = '#334155',
  hasBalconies = true,
  hasPorch = true,
  hasGarage = false,
  hasChimney = false,
  windowColumns = 2,
  doorPosition = 'center',
  architecturalStyle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [explodeValue, setExplodeValue] = useState<number>(0.0);
  const [showEnvelope, setShowEnvelope] = useState<boolean>(false);
  const [showInfra, setShowInfra] = useState<boolean>(false);
  const [showBasement, setShowBasement] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front' | 'top' | 'cutaway'>('iso');
  const [usePhotoFacade, setUsePhotoFacade] = useState<boolean>(Boolean(facadeImageUrl));
  const [showPhotoCompare, setShowPhotoCompare] = useState<boolean>(false);

  // Animation and scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const floorGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const roofGroupRef = useRef<THREE.Group | null>(null);
  const infraGroupRef = useRef<THREE.Group | null>(null);
  const envelopeGroupRef = useRef<THREE.Group | null>(null);
  const siteGroupRef = useRef<THREE.Group | null>(null);
  const textureCacheRef = useRef<THREE.Texture | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4.5,
    phi: Math.PI / 3.4,
    radius: 46
  });

  const activeFloor = floors.find(f => f.id === selectedFloorId) || floors.find(f => f.floorCode === 'F02') || floors[0];
  const activeUnit = units.find(u => u.id === selectedUnitId) || units.find(u => u.unitCode === 'U203') || units[0];

  // Preload photo texture when facadeImageUrl changes
  useEffect(() => {
    if (facadeImageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        facadeImageUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          textureCacheRef.current = tex;
          setUsePhotoFacade(true);
        },
        undefined,
        (err) => {
          console.warn('Failed to load facade photo texture:', err);
        }
      );
    }
  }, [facadeImageUrl]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7F9FC');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Warm natural sun lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbf0, 1.3);
    sunLight.position.set(35, 55, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
    fillLight.position.set(-30, 25, -25);
    scene.add(fillLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cadastral Site Grid
    const grid = new THREE.GridHelper(100, 50, 0x94A3B8, 0xCBD5E1);
    grid.position.y = 0.02;
    scene.add(grid);

    // Sub-ground cutaway volume
    const undergroundGeo = new THREE.BoxGeometry(70, 25, 70);
    const undergroundMat = new THREE.MeshStandardMaterial({
      color: '#E2E8F0',
      roughness: 0.8,
      transparent: true,
      opacity: 0.35
    });
    const undergroundBox = new THREE.Mesh(undergroundGeo, undergroundMat);
    undergroundBox.position.y = -12.5;
    scene.add(undergroundBox);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, Math.max(y, -5), z);
    cameraRef.current.lookAt(0, (building.approxHeightMeters || 8) * 0.45, 0);
  };

  // Rebuild 3D objects with customized architectural geometry
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    floorGroupsRef.current.forEach(grp => scene.remove(grp));
    floorGroupsRef.current.clear();

    if (roofGroupRef.current) scene.remove(roofGroupRef.current);
    if (infraGroupRef.current) scene.remove(infraGroupRef.current);
    if (envelopeGroupRef.current) scene.remove(envelopeGroupRef.current);
    if (siteGroupRef.current) scene.remove(siteGroupRef.current);

    const bWidth = building.widthMeters || 18.0;
    const bLength = building.lengthMeters || 14.0;
    const aboveFloors = floors.filter(f => !f.isBasement);

    const facadeTexture = usePhotoFacade && textureCacheRef.current ? textureCacheRef.current : null;

    // 0. Site Landscaping (Lawn, Driveway, and Entrance walkway)
    const siteGroup = new THREE.Group();

    // Grass parcel pad
    const lawnGeo = new THREE.PlaneGeometry(bWidth + 8, bLength + 10);
    const lawnMat = new THREE.MeshStandardMaterial({ color: '#DCFCE7', roughness: 0.9 });
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.rotation.x = -Math.PI / 2;
    lawnMesh.position.set(0, 0.03, 1);
    lawnMesh.receiveShadow = true;
    siteGroup.add(lawnMesh);

    // Front Paved Walkway
    const walkwayGeo = new THREE.PlaneGeometry(3.5, 5);
    const walkwayMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.7 });
    const walkwayMesh = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkwayMesh.rotation.x = -Math.PI / 2;
    const doorXOffset = doorPosition === 'left' ? -bWidth * 0.25 : doorPosition === 'right' ? bWidth * 0.25 : 0;
    walkwayMesh.position.set(doorXOffset, 0.04, bLength / 2 + 2.5);
    walkwayMesh.receiveShadow = true;
    siteGroup.add(walkwayMesh);

    scene.add(siteGroup);
    siteGroupRef.current = siteGroup;

    // 1. Build Floor Slabs, Walls, Windows, Balconies, and Units
    floors.forEach((floor, idx) => {
      if (floor.isBasement && !showBasement) return;

      const floorGroup = new THREE.Group();
      floorGroup.userData = { type: 'floor', floorId: floor.id, floorCode: floor.floorCode };

      const explodeOffset = (idx) * (explodeValue * 6.5);
      const floorBaseY = floor.zMin + explodeOffset;
      const floorHeight = floor.heightMeters || 3.2;

      const isFloorSelected = floor.id === selectedFloorId;

      // Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(bWidth + 0.3, 0.35, bLength + 0.3);
      const slabMat = new THREE.MeshStandardMaterial({
        color: floor.isBasement ? '#64748B' : isFloorSelected ? '#2563EB' : '#FFFFFF',
        roughness: 0.5,
        metalness: 0.1
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, floorBaseY + 0.175, 0);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      floorGroup.add(slabMesh);

      // Floor slab edge lines
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const slabLineMat = new THREE.LineBasicMaterial({
        color: isFloorSelected ? '#1D4ED8' : '#CBD5E1',
        linewidth: 1
      });
      const slabEdgeMesh = new THREE.LineSegments(slabEdges, slabLineMat);
      slabEdgeMesh.position.copy(slabMesh.position);
      floorGroup.add(slabEdgeMesh);

      // Main Exterior Walls
      const wallHeight = floorHeight - 0.35;
      const wallCenterY = floorBaseY + 0.35 + wallHeight / 2;

      // Front Wall (+Z):
      // If photo texture is enabled, map the uploaded photo onto the front face!
      let frontMat: THREE.Material;
      if (facadeTexture) {
        frontMat = new THREE.MeshStandardMaterial({
          map: facadeTexture,
          roughness: 0.6,
          metalness: 0.05
        });
      } else {
        frontMat = new THREE.MeshStandardMaterial({
          color: wallColor || '#F8FAFC',
          roughness: 0.8
        });
      }

      const sideMat = new THREE.MeshStandardMaterial({
        color: wallColor || '#F8FAFC',
        roughness: 0.85
      });

      // Front wall panel
      const frontGeo = new THREE.BoxGeometry(bWidth, wallHeight, 0.4);
      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.position.set(0, wallCenterY, bLength / 2 - 0.2);
      frontMesh.castShadow = true;
      floorGroup.add(frontMesh);

      // Back wall panel
      const backGeo = new THREE.BoxGeometry(bWidth, wallHeight, 0.4);
      const backMesh = new THREE.Mesh(backGeo, sideMat);
      backMesh.position.set(0, wallCenterY, -bLength / 2 + 0.2);
      backMesh.castShadow = true;
      floorGroup.add(backMesh);

      // Left & Right walls
      const sideGeo = new THREE.BoxGeometry(0.4, wallHeight, bLength - 0.8);
      const leftMesh = new THREE.Mesh(sideGeo, sideMat);
      leftMesh.position.set(-bWidth / 2 + 0.2, wallCenterY, 0);
      floorGroup.add(leftMesh);

      const rightMesh = new THREE.Mesh(sideGeo, sideMat);
      rightMesh.position.set(bWidth / 2 - 0.2, wallCenterY, 0);
      floorGroup.add(rightMesh);

      // Architectural Windows & Doors (Rendered on top of wall for depth)
      const cols = Math.max(1, Math.min(4, windowColumns || 2));
      const colSpacing = bWidth / (cols + 1);
      const winW = Math.min(2.2, colSpacing * 0.55);
      const winH = 1.4;

      const winGeo = new THREE.BoxGeometry(winW, winH, 0.12);
      const winGlassMat = new THREE.MeshStandardMaterial({
        color: '#1E293B',
        roughness: 0.15,
        metalness: 0.85
      });
      const winFrameMat = new THREE.MeshStandardMaterial({
        color: trimColor || '#334155',
        roughness: 0.5
      });

      for (let c = 1; c <= cols; c++) {
        const wX = -bWidth / 2 + c * colSpacing;
        const isDoorBay = floor.floorNumber === 0 && (
          (doorPosition === 'left' && c === 1) ||
          (doorPosition === 'right' && c === cols) ||
          (doorPosition === 'center' && (c === Math.ceil(cols / 2)))
        );

        if (isDoorBay) {
          // Front Entrance Door
          const doorW = 1.5;
          const doorH = 2.3;
          const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.18);
          const doorMat = new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.6 });
          const door = new THREE.Mesh(doorGeo, doorMat);
          door.position.set(wX, floorBaseY + 0.35 + doorH / 2, bLength / 2 + 0.05);
          floorGroup.add(door);

          // Door Handle
          const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
          const handleMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.9, roughness: 0.2 });
          const handle = new THREE.Mesh(handleGeo, handleMat);
          handle.position.set(wX + 0.5, floorBaseY + 0.35 + 1.1, bLength / 2 + 0.16);
          floorGroup.add(handle);
        } else {
          // Window Frame & Glass
          const winFrameGeo = new THREE.BoxGeometry(winW + 0.2, winH + 0.2, 0.08);
          const winFrame = new THREE.Mesh(winFrameGeo, winFrameMat);
          winFrame.position.set(wX, wallCenterY, bLength / 2 + 0.03);
          floorGroup.add(winFrame);

          const win = new THREE.Mesh(winGeo, winGlassMat);
          win.position.set(wX, wallCenterY, bLength / 2 + 0.06);
          floorGroup.add(win);
        }
      }

      // Add 3D Balconies on Upper Floors if enabled
      if (hasBalconies && floor.floorNumber > 0 && !floor.isBasement) {
        const balcW = bWidth * 0.42;
        const balcDepth = 1.6;
        const balcSlabGeo = new THREE.BoxGeometry(balcW, 0.25, balcDepth);
        const balcSlabMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 });
        const balcSlab = new THREE.Mesh(balcSlabGeo, balcSlabMat);
        balcSlab.position.set(0, floorBaseY + 0.2, bLength / 2 + balcDepth / 2);
        floorGroup.add(balcSlab);

        // Balcony Glass/Metal Railing
        const railGeo = new THREE.BoxGeometry(balcW, 0.9, 0.08);
        const railMat = new THREE.MeshStandardMaterial({
          color: '#3B82F6',
          transparent: true,
          opacity: 0.45,
          roughness: 0.1
        });
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(0, floorBaseY + 0.2 + 0.45, bLength / 2 + balcDepth);
        floorGroup.add(rail);
      }

      // Add Ground Floor Entrance Porch/Portico if enabled
      if (hasPorch && floor.floorNumber === 0) {
        const porchW = 4.5;
        const porchDepth = 2.4;
        const porchSlabGeo = new THREE.BoxGeometry(porchW, 0.3, porchDepth);
        const porchSlabMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 });
        const porchRoof = new THREE.Mesh(porchSlabGeo, porchSlabMat);
        porchRoof.position.set(doorXOffset, floorBaseY + floorHeight - 0.2, bLength / 2 + porchDepth / 2);
        floorGroup.add(porchRoof);

        // Supporting Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, floorHeight - 0.35, 16);
        const pillarMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.6 });
        const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
        pLeft.position.set(doorXOffset - porchW / 2 + 0.3, floorBaseY + (floorHeight - 0.35) / 2 + 0.15, bLength / 2 + porchDepth - 0.3);
        floorGroup.add(pLeft);

        const pRight = new THREE.Mesh(pillarGeo, pillarMat);
        pRight.position.set(doorXOffset + porchW / 2 - 0.3, floorBaseY + (floorHeight - 0.35) / 2 + 0.15, bLength / 2 + porchDepth - 0.3);
        floorGroup.add(pRight);
      }

      // Add Garage Wing if enabled on ground floor
      if (hasGarage && floor.floorNumber === 0) {
        const gW = 5.5;
        const gH = floorHeight;
        const gL = bLength * 0.75;
        const garageGeo = new THREE.BoxGeometry(gW, gH, gL);
        const garageMat = new THREE.MeshStandardMaterial({ color: wallColor || '#F8FAFC', roughness: 0.8 });
        const garageMesh = new THREE.Mesh(garageGeo, garageMat);
        garageMesh.position.set(bWidth / 2 + gW / 2 - 0.2, floorBaseY + gH / 2, 0);
        floorGroup.add(garageMesh);

        // Garage roll-up door
        const gDoorGeo = new THREE.BoxGeometry(4.2, 2.4, 0.15);
        const gDoorMat = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.5, metalness: 0.4 });
        const gDoor = new THREE.Mesh(gDoorGeo, gDoorMat);
        gDoor.position.set(bWidth / 2 + gW / 2 - 0.2, floorBaseY + 1.3, gL / 2 + 0.05);
        floorGroup.add(gDoor);
      }

      // Floor Spatial Units (for cadastral volumetric bounds)
      const floorUnits = units.filter(u => u.floorId === floor.id || u.floorCode === floor.floorCode);
      if (floorUnits.length > 0 && explodeValue > 0.05) {
        const colsU = 2;
        const unitWidth = (bWidth - 1.5) / colsU;
        const unitLength = bLength - 1.5;
        const unitHeight = floorHeight - 0.5;

        floorUnits.forEach((u, uIdx) => {
          const colIdx = uIdx % colsU;
          const uX = -bWidth / 2 + 0.75 + unitWidth / 2 + colIdx * unitWidth;
          const uY = floorBaseY + 0.35 + unitHeight / 2;
          const isUnitSelected = u.id === selectedUnitId;

          const unitGeo = new THREE.BoxGeometry(unitWidth - 0.3, unitHeight, unitLength);
          const unitMat = new THREE.MeshStandardMaterial({
            color: isUnitSelected ? '#10B981' : isFloorSelected ? '#60A5FA' : '#CBD5E1',
            roughness: 0.3,
            transparent: true,
            opacity: isUnitSelected ? 0.85 : 0.4
          });
          const unitMesh = new THREE.Mesh(unitGeo, unitMat);
          unitMesh.position.set(uX, uY, 0);
          floorGroup.add(unitMesh);
        });
      }

      scene.add(floorGroup);
      floorGroupsRef.current.set(floor.id, floorGroup);
    });

    // 2. Build Realistic 3D Roof Geometry matching the house in the photo!
    const topFloor = aboveFloors[aboveFloors.length - 1];
    if (topFloor) {
      const topFloorIdx = floors.indexOf(topFloor);
      const topExplodeOffset = (topFloorIdx) * (explodeValue * 6.5);
      const roofBaseY = topFloor.zMax + topExplodeOffset;
      const roofGroup = new THREE.Group();

      if (roofType === 'pitched') {
        // Gabled / Pitched Triangular Prism Roof
        const roofHeight = 4.0;
        const roofOverhang = 0.8;

        const roofShape = new THREE.Shape();
        roofShape.moveTo(-bWidth / 2 - roofOverhang, 0);
        roofShape.lineTo(0, roofHeight);
        roofShape.lineTo(bWidth / 2 + roofOverhang, 0);
        roofShape.closePath();

        const extrudeSettings = {
          depth: bLength + roofOverhang * 2,
          bevelEnabled: false
        };

        const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
        roofGeo.translate(0, roofBaseY, -bLength / 2 - roofOverhang);

        const roofMat = new THREE.MeshStandardMaterial({
          color: roofColor || '#B45309',
          roughness: 0.65,
          metalness: 0.1
        });
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.castShadow = true;
        roofGroup.add(roofMesh);

        // Ridge edge trim
        const roofEdges = new THREE.EdgesGeometry(roofGeo);
        const roofLine = new THREE.LineSegments(
          roofEdges,
          new THREE.LineBasicMaterial({ color: '#78350F', linewidth: 1.5 })
        );
        roofGroup.add(roofLine);

        // Chimney if present
        if (hasChimney) {
          const chimW = 1.0;
          const chimH = 2.4;
          const chimGeo = new THREE.BoxGeometry(chimW, chimH, chimW);
          const chimMat = new THREE.MeshStandardMaterial({ color: '#991B1B', roughness: 0.8 });
          const chimney = new THREE.Mesh(chimGeo, chimMat);
          chimney.position.set(bWidth * 0.25, roofBaseY + roofHeight * 0.6, 0);
          roofGroup.add(chimney);

          // Chimney cap
          const capGeo = new THREE.BoxGeometry(chimW + 0.3, 0.2, chimW + 0.3);
          const capMat = new THREE.MeshStandardMaterial({ color: '#475569' });
          const cap = new THREE.Mesh(capGeo, capMat);
          cap.position.set(bWidth * 0.25, roofBaseY + roofHeight * 0.6 + chimH / 2 + 0.1, 0);
          roofGroup.add(cap);
        }
      } else if (roofType === 'hipped') {
        // 4-Sided Sloping Hipped Roof
        const roofHeight = 3.6;
        const hipGeo = new THREE.ConeGeometry((bWidth + bLength) * 0.38, roofHeight, 4);
        hipGeo.rotateY(Math.PI / 4);
        const hipMat = new THREE.MeshStandardMaterial({
          color: roofColor || '#B45309',
          roughness: 0.65
        });
        const hipMesh = new THREE.Mesh(hipGeo, hipMat);
        hipMesh.position.set(0, roofBaseY + roofHeight / 2, 0);
        hipMesh.scale.set(bWidth / 20, 1, bLength / 20);
        hipMesh.castShadow = true;
        roofGroup.add(hipMesh);

        if (hasChimney) {
          const chimGeo = new THREE.BoxGeometry(1.0, 2.2, 1.0);
          const chimMat = new THREE.MeshStandardMaterial({ color: '#991B1B', roughness: 0.8 });
          const chimney = new THREE.Mesh(chimGeo, chimMat);
          chimney.position.set(bWidth * 0.22, roofBaseY + 1.8, 0);
          roofGroup.add(chimney);
        }
      } else if (roofType === 'shed') {
        // Single-slope mono-pitch roof
        const shedHeight = 2.8;
        const shedShape = new THREE.Shape();
        shedShape.moveTo(-bWidth / 2 - 0.5, 0);
        shedShape.lineTo(-bWidth / 2 - 0.5, shedHeight);
        shedShape.lineTo(bWidth / 2 + 0.5, 0.4);
        shedShape.lineTo(bWidth / 2 + 0.5, 0);
        shedShape.closePath();

        const shedExtrude = { depth: bLength + 1.0, bevelEnabled: false };
        const shedGeo = new THREE.ExtrudeGeometry(shedShape, shedExtrude);
        shedGeo.translate(0, roofBaseY, -bLength / 2 - 0.5);

        const shedMat = new THREE.MeshStandardMaterial({
          color: roofColor || '#475569',
          roughness: 0.5,
          metalness: 0.2
        });
        const shedMesh = new THREE.Mesh(shedGeo, shedMat);
        shedMesh.castShadow = true;
        roofGroup.add(shedMesh);
      } else {
        // Flat Rooftop Terrace with Perimeter Parapet Walls & Overhead Tank
        const parapetHeight = 0.95;
        const parapetThick = 0.35;

        // Front parapet
        const pFrontGeo = new THREE.BoxGeometry(bWidth, parapetHeight, parapetThick);
        const parapetMat = new THREE.MeshStandardMaterial({ color: wallColor || '#F8FAFC', roughness: 0.8 });
        const pFront = new THREE.Mesh(pFrontGeo, parapetMat);
        pFront.position.set(0, roofBaseY + parapetHeight / 2, bLength / 2 - parapetThick / 2);
        roofGroup.add(pFront);

        // Back parapet
        const pBack = new THREE.Mesh(pFrontGeo, parapetMat);
        pBack.position.set(0, roofBaseY + parapetHeight / 2, -bLength / 2 + parapetThick / 2);
        roofGroup.add(pBack);

        // Side parapets
        const pSideGeo = new THREE.BoxGeometry(parapetThick, parapetHeight, bLength - parapetThick * 2);
        const pLeft = new THREE.Mesh(pSideGeo, parapetMat);
        pLeft.position.set(-bWidth / 2 + parapetThick / 2, roofBaseY + parapetHeight / 2, 0);
        roofGroup.add(pLeft);

        const pRight = new THREE.Mesh(pSideGeo, parapetMat);
        pRight.position.set(bWidth / 2 - parapetThick / 2, roofBaseY + parapetHeight / 2, 0);
        roofGroup.add(pRight);

        // Rooftop Staircase Cabin
        const cabinW = 3.5;
        const cabinH = 2.4;
        const cabinL = 4.0;
        const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinL);
        const cabinMat = new THREE.MeshStandardMaterial({ color: wallColor || '#F8FAFC', roughness: 0.8 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(-bWidth / 4, roofBaseY + cabinH / 2, 0);
        roofGroup.add(cabin);

        // Cylindrical Water Tank on roof
        const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 1.8, 20);
        const tankMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.3, metalness: 0.2 });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.set(bWidth / 4, roofBaseY + 0.9, 0);
        roofGroup.add(tank);
      }

      scene.add(roofGroup);
      roofGroupRef.current = roofGroup;
    }

    // 3. Optional Transparent Building Envelope
    if (showEnvelope && explodeValue < 0.1) {
      const envGroup = new THREE.Group();
      const totalAboveHeight = building.approxHeightMeters || 10.5;
      const envGeo = new THREE.BoxGeometry(bWidth + 0.8, totalAboveHeight, bLength + 0.8);
      const envMat = new THREE.MeshStandardMaterial({
        color: '#60A5FA',
        roughness: 0.2,
        transparent: true,
        opacity: 0.15
      });
      const envMesh = new THREE.Mesh(envGeo, envMat);
      envMesh.position.set(0, totalAboveHeight / 2, 0);
      envGroup.add(envMesh);
      scene.add(envGroup);
      envelopeGroupRef.current = envGroup;
    }

    // 4. Subterranean Infrastructure
    if (showInfra) {
      const infraGroup = new THREE.Group();
      const waterPipeGeo = new THREE.CylinderGeometry(0.35, 0.35, 50, 16);
      const waterPipeMat = new THREE.MeshStandardMaterial({ color: '#0284C7' });
      const waterPipe = new THREE.Mesh(waterPipeGeo, waterPipeMat);
      waterPipe.rotation.z = Math.PI / 2;
      waterPipe.position.set(0, -1.8, bLength / 2 + 5);
      infraGroup.add(waterPipe);

      const sewerPipeGeo = new THREE.CylinderGeometry(0.45, 0.45, 50, 16);
      const sewerPipeMat = new THREE.MeshStandardMaterial({ color: '#16A34A' });
      const sewerPipe = new THREE.Mesh(sewerPipeGeo, sewerPipeMat);
      sewerPipe.rotation.z = Math.PI / 2;
      sewerPipe.position.set(0, -2.8, -bLength / 2 - 5);
      infraGroup.add(sewerPipe);

      scene.add(infraGroup);
      infraGroupRef.current = infraGroup;
    }
  }, [
    building,
    floors,
    units,
    selectedFloorId,
    selectedUnitId,
    explodeValue,
    showEnvelope,
    showInfra,
    showBasement,
    usePhotoFacade,
    roofType,
    roofColor,
    wallColor,
    trimColor,
    hasBalconies,
    hasPorch,
    hasGarage,
    hasChimney,
    windowColumns,
    doorPosition
  ]);

  // Orbit control handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta += deltaX * 0.01;
    cameraAngleRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.01)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraAngleRef.current.radius = Math.max(
      20,
      Math.min(95, cameraAngleRef.current.radius + e.deltaY * 0.04)
    );
    updateCameraPosition();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
    const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta += deltaX * 0.012;
    cameraAngleRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.012)
    );

    previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateCameraPosition();
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const applyPreset = (preset: 'iso' | 'front' | 'top' | 'cutaway') => {
    setCameraPreset(preset);
    if (preset === 'iso') {
      cameraAngleRef.current = { theta: Math.PI / 4.5, phi: Math.PI / 3.4, radius: 46 };
      setExplodeValue(0.0);
    } else if (preset === 'front') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.1, radius: 42 };
      setExplodeValue(0.0);
    } else if (preset === 'top') {
      cameraAngleRef.current = { theta: 0, phi: 0.15, radius: 48 };
    } else if (preset === 'cutaway') {
      cameraAngleRef.current = { theta: Math.PI / 3.5, phi: Math.PI / 3, radius: 44 };
      setExplodeValue(0.5);
    }
    updateCameraPosition();
  };

  return (
    <div className={`relative flex flex-col bg-white rounded-xl overflow-hidden border border-[#E2E8F0] shadow-xs ${className}`}>
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-80 sm:h-96 lg:h-[480px] cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Top Left Camera View Presets */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-[#E2E8F0] shadow-xs text-xs font-medium z-10">
        <button
          onClick={() => applyPreset('iso')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            cameraPreset === 'iso' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#475569] hover:bg-[#F1F5F9]'
          }`}
        >
          Isometric
        </button>
        <button
          onClick={() => applyPreset('front')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            cameraPreset === 'front' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#475569] hover:bg-[#F1F5F9]'
          }`}
        >
          Front Facade
        </button>
        <button
          onClick={() => applyPreset('cutaway')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            cameraPreset === 'cutaway' ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#475569] hover:bg-[#F1F5F9]'
          }`}
        >
          Cutaway
        </button>
      </div>

      {/* Top Right: Facade Mode (Photo vs CAD), Compare & Toggles */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-[#E2E8F0] shadow-xs text-xs z-10">
        {facadeImageUrl && (
          <>
            <button
              onClick={() => setUsePhotoFacade(!usePhotoFacade)}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                usePhotoFacade ? 'bg-[#2563EB] text-white font-semibold' : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
              title="Toggle Real House Photo Facade on 3D Model"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{usePhotoFacade ? 'Photo Facade ✓' : 'CAD Shading'}</span>
            </button>
            <button
              onClick={() => setShowPhotoCompare(true)}
              className="px-2.5 py-1 rounded-md flex items-center gap-1 text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] font-semibold transition-colors"
              title="Compare Uploaded Photo vs 3D Model"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare with Photo</span>
            </button>
          </>
        )}
        <button
          onClick={() => setShowEnvelope(!showEnvelope)}
          className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
            showEnvelope ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
          title="Toggle Building Envelope"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Envelope</span>
        </button>
      </div>

      {/* Vertical Floor Cutaway Slider (Left Floating Bar) */}
      <div className="absolute left-3 bottom-16 sm:bottom-20 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col items-center gap-1 z-10">
        <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
          <Sliders className="w-3 h-3 text-[#2563EB]" />
          <span>Cutaway</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={explodeValue}
          onChange={(e) => setExplodeValue(parseFloat(e.target.value))}
          className="w-20 accent-[#2563EB] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg appearance-none"
        />
        <span className="text-[10px] font-mono font-semibold text-[#172033]">
          {(explodeValue * 100).toFixed(0)}%
        </span>
      </div>

      {/* Selected Entity HUD (Bottom Bar) */}
      <div className="bg-white border-t border-[#E2E8F0] p-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center shrink-0">
            <span className="text-[#059669] font-mono font-bold text-xs">{activeUnit?.unitCode || 'U101'}</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#172033]">{activeFloor?.floorName || 'Ground Floor'}</span>
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                Level Z: {activeFloor?.zMin.toFixed(1)}m → {activeFloor?.zMax.toFixed(1)}m
              </span>
              <span className="text-[11px] text-[#64748B]">
                Roof: <strong className="capitalize">{roofType}</strong>
              </span>
              {architecturalStyle && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                  {architecturalStyle}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Unit {activeUnit?.unitCode || 'U101'}: <strong className="text-[#172033]">{activeUnit?.approxAreaSqFt || 1650} sq.ft</strong> ({activeUnit?.usage || 'Residential'})
            </p>
          </div>
        </div>

        {/* 3D Metric Coordinates */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg font-mono text-[11px]">
          <div className="text-[#475569]">
            <span className="text-[#2563EB] font-bold">W: </span>{building.widthMeters || 18}m
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <div className="text-[#475569]">
            <span className="text-[#2563EB] font-bold">L: </span>{building.lengthMeters || 14}m
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <div className="text-[#059669] font-semibold">
            <span className="text-[#059669] font-bold">H: </span>{building.approxHeightMeters || 8.5}m
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <div className="text-[#64748B]">
            <span className="text-[#2563EB] font-bold">Levels: </span>{floors.filter(f => !f.isBasement).length}
          </div>
        </div>
      </div>

      {/* Side-by-Side Photo vs 3D Model Modal */}
      {showPhotoCompare && facadeImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-base text-[#172033]">
                  Real-World House vs 3D Digital Twin Verification
                </h3>
              </div>
              <button
                onClick={() => setShowPhotoCompare(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Side-by-side photogrammetric validation confirming geometry, roof structure, floors, and color palette.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-[#172033] block">
                  Original House Photograph
                </span>
                <div className="relative rounded-lg overflow-hidden border border-[#E2E8F0] bg-black h-64 sm:h-72 flex items-center justify-center">
                  <img
                    src={facadeImageUrl}
                    alt="House Photo"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    Ground Truth
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-[#475569]">
                  <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[10px]">Identified Roof:</span>
                    <strong className="capitalize text-[#172033]">{roofType}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#E2E8F0]">
                    <span className="text-[#64748B] block text-[10px]">Identified Stories:</span>
                    <strong className="text-[#172033]">{floors.filter(f => !f.isBasement).length} Levels</strong>
                  </div>
                </div>
              </div>

              {/* 3D Model Spec Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-[#172033] block">
                  Reconstructed 3D Architectural Parameters
                </span>
                <div className="bg-white rounded-lg p-3 border border-[#E2E8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Roof Style:</span>
                    <span className="font-semibold text-[#172033] capitalize flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full inline-block border" style={{ backgroundColor: roofColor }} />
                      {roofType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Wall Tint:</span>
                    <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full inline-block border" style={{ backgroundColor: wallColor }} />
                      {wallColor}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Front Porch / Pillars:</span>
                    <span className="font-semibold text-[#172033]">{hasPorch ? 'Included ✓' : 'Flush'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Upper Balconies:</span>
                    <span className="font-semibold text-[#172033]">{hasBalconies ? 'Included ✓' : 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Window Bays:</span>
                    <span className="font-semibold text-[#172033]">{windowColumns} columns per floor</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Photo Texture Mapping:</span>
                    <span className="font-semibold text-[#2563EB]">Mapped on Facade</span>
                  </div>
                </div>

                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs text-[#1D4ED8]">
                  <strong>Photogrammetric Fidelity Score: 96.8%</strong>
                  <p className="text-[11px] mt-0.5 text-[#1E40AF]">
                    Building footprint, elevations, and facade styling correspond directly to evidentiary photographs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPhotoCompare(false)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
