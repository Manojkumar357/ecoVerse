import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const earthRef = useRef<THREE.Object3D>();
  const atmosphereRef = useRef<THREE.Mesh>();
  const outerGlowRef = useRef<THREE.Mesh>();
  const brightRingRef = useRef<THREE.Mesh>();
  const isMouseDownRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
  const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    // Size renderer to container
    // Fit camera so the globe fills most of the canvas
    const fitCameraToRadius = (radius: number, fill = 0.96) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      const aspect = rect ? rect.width / rect.height : 1;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const distY = radius / (fill * Math.tan(vFov / 2));
      // For width fit, use horizontal fov derived from aspect
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const distX = radius / (fill * Math.tan(hFov / 2));
      const dist = Math.max(distX, distY);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
    };

    const sizeToContainer = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      camera.aspect = rect.width / rect.height || 1;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
    };
    sizeToContainer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Enhanced renderer settings for better material rendering
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Load GLB model with proper texture handling
    const loader = new GLTFLoader();
    // Wire DRACO (decoder files are copied to /public/draco)
    try {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);
    } catch (e) {
      console.warn('DRACO not configured:', e);
    }
    
    // Utility to surface status to the user (hover over globe)
    const setStatus = (msg: string) => {
      if (canvasRef.current) {
        canvasRef.current.title = msg;
        canvasRef.current.setAttribute('data-status', msg);
      }
      console.log(msg);
    };

  // Create Earth immediately - don't wait for GLB loading
    const createEarth = () => {
      // Create detailed Earth sphere with realistic textures
  const geometry = new THREE.SphereGeometry(1.7, 128, 64);
      
      // Create realistic Earth textures using canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      // Create gradient for ocean depth
      const oceanGradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512);
      oceanGradient.addColorStop(0, '#4A90E2');
      oceanGradient.addColorStop(0.7, '#2E5BBA');
      oceanGradient.addColorStop(1, '#1E3A8A');
      
      // Ocean background
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, 1024, 512);
      
      // Add realistic continent shapes with varied greens
      const continents = [
        // North America
        { x: 150, y: 150, w: 180, h: 120, color: '#228B22' },
        { x: 120, y: 180, w: 100, h: 80, color: '#32CD32' },
        
        // South America
        { x: 200, y: 280, w: 80, h: 140, color: '#228B22' },
        
        // Europe/Asia
        { x: 400, y: 120, w: 300, h: 100, color: '#90EE90' },
        { x: 500, y: 160, w: 200, h: 80, color: '#228B22' },
        
        // Africa
        { x: 420, y: 220, w: 120, h: 180, color: '#DAA520' },
        
        // Australia
        { x: 700, y: 320, w: 120, h: 60, color: '#D2691E' },
        
        // Greenland
        { x: 320, y: 80, w: 60, h: 40, color: '#F0F8FF' }
      ];
      
      continents.forEach(continent => {
        ctx.fillStyle = continent.color;
        ctx.fillRect(continent.x, continent.y, continent.w, continent.h);
        
        // Add some texture variation
        ctx.fillStyle = continent.color + '80';
        ctx.fillRect(continent.x + 10, continent.y + 10, continent.w - 20, continent.h - 20);
      });
      
      // Add cloud patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const w = 50 + Math.random() * 100;
        const h = 20 + Math.random() * 40;
        ctx.fillRect(x, y, w, h);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
        envMapIntensity: 1.2
      });
      
      const earth = new THREE.Mesh(geometry, material);
      earth.castShadow = true;
      earth.receiveShadow = true;
  scene.add(earth);
      earthRef.current = earth;
  // After creating fallback, fit camera to atmosphere (created below with radius 2.2)
  setStatus('Fallback Earth created (awaiting GLB)');
    };
    
    // Create Earth immediately
    createEarth();
    
    // Also try to load GLB as enhancement (optional)
  const url = '/api/models/Earth_1_12756.glb';
  setStatus(`[GLB] trying ${url}`);
  loader.load(
    url,
      (gltf) => {
        const model = gltf.scene;
        console.log('[GLB] loaded. children:', model.children.length);

        // Quick sanity: does it contain any mesh?
        let meshCount = 0;
        model.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) meshCount++;
        });
        console.log('[GLB] meshCount:', meshCount);
        if (meshCount === 0) {
          console.warn('[GLB] No meshes found in model. Keeping fallback.');
          return; // keep canvas earth while we try next
        }

        // Fit and center the model to target radius ~1.2
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const targetRadius = 1.7;
        const currentRadius = maxAxis / 2;
  const scaleFactor = targetRadius / currentRadius;
        model.scale.multiplyScalar(scaleFactor);

        // Recompute box after scaling and center at origin
        const box2 = new THREE.Box3().setFromObject(model);
        const center = box2.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Improve materials
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mat = mesh.material as THREE.Material | THREE.Material[];
            const fixMat = (m: THREE.Material) => {
              // Only adjust known PBR materials; leave others intact
              if ((m as any).roughness !== undefined) {
                (m as any).roughness = 0.6;
              }
              if ((m as any).metalness !== undefined) {
                (m as any).metalness = 0.1;
              }
              if ((m as any).envMapIntensity !== undefined) {
                (m as any).envMapIntensity = 1.2;
              }
              m.transparent = false;
              m.side = THREE.FrontSide;
              m.needsUpdate = true;
            };
            if (Array.isArray(mat)) mat.forEach(fixMat); else if (mat) fixMat(mat);
          }
        });

        // Swap fallback with the real model
        if (earthRef.current) scene.remove(earthRef.current);
        scene.add(model);
        earthRef.current = model;
  if (canvasRef.current) canvasRef.current.dataset.model = url;
        setStatus(`[GLB] displayed ${url} (scaleFactor=${scaleFactor.toFixed(3)})`);
  // Refocus camera to fit the earth + atmosphere nicely
  fitCameraToRadius(2.2, 0.96);
          },
          (progress) => {
            if (progress.total) console.log('[GLB] progress', url, Math.round((progress.loaded / progress.total) * 100) + '%');
          },
          (error) => {
            console.warn('[GLB] failed', url, error);
            setStatus(`[GLB] failed ${url}. Using fallback.`);
          }
    );

    // Enhanced atmosphere glow effect with bright outer ring
  const atmosphereGeometry = new THREE.SphereGeometry(2.2, 64, 32);
  const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

    // Bright outer glow ring similar to the image
    const outerGlowGeometry = new THREE.SphereGeometry(2.6, 64, 32);
    const outerGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.8 - dot(vNormal, vec3(0, 0, 1.0)), 1.5);
          float falloff = 1.0 - (length(vPosition) - 2.2) / 0.4;
          falloff = clamp(falloff, 0.0, 1.0);
          
          // Create a bright cyan/blue glow like in the image
          vec3 glowColor = vec3(0.4, 0.8, 1.0);
          gl_FragColor = vec4(glowColor, intensity * falloff * 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    });

    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);

    // Additional bright ring effect for more intensity
    const ringGeometry = new THREE.RingGeometry(2.3, 2.8, 64);
    const ringMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          float distance = length(vUv - 0.5) * 2.0;
          float ring = 1.0 - smoothstep(0.0, 0.3, abs(distance - 0.8));
          ring *= smoothstep(0.95, 0.5, distance);
          
          vec3 ringColor = vec3(0.5, 0.9, 1.0);
          gl_FragColor = vec4(ringColor, ring * 0.6);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const brightRing = new THREE.Mesh(ringGeometry, ringMaterial);
    
    atmosphereRef.current = atmosphere;
    outerGlowRef.current = outerGlow;
    brightRingRef.current = brightRing;
    
    scene.add(atmosphere);
    scene.add(outerGlow);
    scene.add(brightRing);

    // Enhanced lighting setup for realistic Earth rendering
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Main sun light
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    scene.add(sunLight);

    // Fill light for the dark side
  const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.6);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    // Rim light for atmosphere effect
  const rimLight = new THREE.PointLight(0x87ceeb, 0.6);
    rimLight.position.set(0, 0, 3);
    scene.add(rimLight);

    // Add environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new THREE.Scene()).texture;
    scene.environment = envTexture;

  // Adjust camera to fit the atmosphere/globe size
  fitCameraToRadius(2.2, 0.96);

    // Mouse interaction handlers
    const handleMouseDown = (event: MouseEvent) => {
      isMouseDownRef.current = true;
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDownRef.current) {
        const deltaX = event.clientX - mouseRef.current.x;
        const deltaY = event.clientY - mouseRef.current.y;

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x += deltaY * 0.01;

        mouseRef.current.x = event.clientX;
        mouseRef.current.y = event.clientY;
      }
    };

    // Add event listeners
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    // Handle window resize to keep canvas matched to container
    const handleResize = () => {
      sizeToContainer();
      fitCameraToRadius(2.2, 0.96);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation interpolation
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.05;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.05;

      // Idle rotation when not interacting
      if (!isMouseDownRef.current) {
        targetRotationRef.current.y += 0.005;
      }

      if (earthRef.current) {
        earthRef.current.rotation.x = currentRotationRef.current.x;
        earthRef.current.rotation.y = currentRotationRef.current.y;
      }

      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.x = currentRotationRef.current.x;
        atmosphereRef.current.rotation.y = currentRotationRef.current.y;
      }
      
      // Rotate the glow effects with the Earth
      if (outerGlowRef.current) {
        outerGlowRef.current.rotation.x = currentRotationRef.current.x;
        outerGlowRef.current.rotation.y = currentRotationRef.current.y;
      }
      
      if (brightRingRef.current) {
        brightRingRef.current.rotation.x = currentRotationRef.current.x;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="rounded-full shadow-globe cursor-grab active:cursor-grabbing"
      data-testid="canvas-globe"
    />
  );
}
