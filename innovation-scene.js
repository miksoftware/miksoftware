import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Setup básico
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020205, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 5;

// Post-procesamiento (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.4, 0.85);
bloomPass.threshold = 0.15;
bloomPass.strength = 1.2; 
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(20, 10, 10);
scene.add(sunLight);

// Fondo Galáctico
const starCount = 6000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for(let i=0; i<starCount; i++) {
    starPos[i*3] = (Math.random() - 0.5) * 300;
    starPos[i*3+1] = (Math.random() - 0.5) * 300;
    starPos[i*3+2] = (Math.random() - 0.5) * 150 - 30;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ==========================================
// PLANETA TIERRA REALISTA
// ==========================================
const earthGroup = new THREE.Group();
const textureLoader = new THREE.TextureLoader();

const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const earthSpec = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
const cloudMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

const earthGeo = new THREE.SphereGeometry(12, 64, 64);
const earthMat = new THREE.MeshPhongMaterial({
    map: earthMap,
    specularMap: earthSpec,
    specular: new THREE.Color('grey'),
    shininess: 15
});
const earth = new THREE.Mesh(earthGeo, earthMat);
earthGroup.add(earth);

const cloudGeo = new THREE.SphereGeometry(12.2, 64, 64);
const cloudMat = new THREE.MeshPhongMaterial({
    map: cloudMap,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});
const clouds = new THREE.Mesh(cloudGeo, cloudMat);
earthGroup.add(clouds);

const glowGeo = new THREE.SphereGeometry(12.5, 64, 64);
const glowMat = new THREE.MeshPhongMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});
const glow = new THREE.Mesh(glowGeo, glowMat);
earthGroup.add(glow);

// Inclinación terrestre
earthGroup.rotation.z = 23.5 * Math.PI / 180;
// Inicialmente la Tierra está oculta abajo
earthGroup.position.set(0, -30, -5); 
scene.add(earthGroup);

// ==========================================
// COHETE NASA (REALISTA)
// ==========================================
const rocketGroup = new THREE.Group();

const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.1 });
const darkMat = new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.4 });
const metalMat = new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.2 });

const bodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 5, 32);
const body = new THREE.Mesh(bodyGeo, whiteMat);
rocketGroup.add(body);

const noseGeo = new THREE.ConeGeometry(0.8, 2, 32);
const nose = new THREE.Mesh(noseGeo, darkMat);
nose.position.y = 3.5;
rocketGroup.add(nose);

for(let i=-1; i<=1; i+=2) {
    const booster = new THREE.Group();
    const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4, 32), whiteMat);
    const bNose = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1, 32), darkMat);
    bNose.position.y = 2.5;
    const bEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.2, 0.5, 32), metalMat);
    bEngine.position.y = -2.25;
    booster.add(bBody);
    booster.add(bNose);
    booster.add(bEngine);
    booster.position.set(1.2 * i, -0.5, 0);
    rocketGroup.add(booster);
}

const mainEngineGeo = new THREE.CylinderGeometry(0.8, 0.5, 0.8, 32);
const mainEngine = new THREE.Mesh(mainEngineGeo, metalMat);
mainEngine.position.y = -2.9;
rocketGroup.add(mainEngine);

const finGeo = new THREE.BoxGeometry(0.1, 1.5, 2);
for(let i=-1; i<=1; i+=2) {
    const fin = new THREE.Mesh(finGeo, whiteMat);
    fin.position.y = -1.5;
    fin.position.x = 1.4 * i;
    fin.rotation.z = (Math.PI / 8) * i;
    rocketGroup.add(fin);
}

const windowGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
const windowMesh = new THREE.Mesh(windowGeo, new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.9 }));
windowMesh.rotation.x = Math.PI / 2;
windowMesh.position.set(0, 1.5, 0.76);
rocketGroup.add(windowMesh);

const decalGeo = new THREE.CylinderGeometry(0.81, 0.81, 0.2, 32);
const decal = new THREE.Mesh(decalGeo, new THREE.MeshBasicMaterial({ color: 0xFA8072 }));
decal.position.y = 0;
rocketGroup.add(decal);

// EFECTO DE CARGA DE COMBUSTIBLE (Rayo de Energía)
const fuelGeo = new THREE.CylinderGeometry(1.5, 1.5, 10, 32);
const fuelMat = new THREE.MeshBasicMaterial({ 
    color: 0x00d2ff, 
    transparent: true, 
    opacity: 0.8,
    blending: THREE.AdditiveBlending 
});
const fuelBeam = new THREE.Mesh(fuelGeo, fuelMat);
fuelBeam.position.y = -10; // Empieza abajo
rocketGroup.add(fuelBeam);


// SISTEMA DE PARTÍCULAS
const fireCount = 400;
const smokeCount = 300;

const fireGeo = new THREE.BufferGeometry();
const firePos = new Float32Array(fireCount * 3);
for(let i=0; i<fireCount; i++) {
    firePos[i*3] = (Math.random() - 0.5) * 1.5;
    firePos[i*3+1] = -3 - Math.random() * 4;
    firePos[i*3+2] = (Math.random() - 0.5) * 1.5;
}
fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
const fireMat = new THREE.PointsMaterial({
    color: 0xff5500, size: 0.4, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
});
const rocketFire = new THREE.Points(fireGeo, fireMat);
rocketFire.visible = false; // Apagado inicialmente
rocketGroup.add(rocketFire);

const smokeGeo = new THREE.BufferGeometry();
const smokePos = new Float32Array(smokeCount * 3);
for(let i=0; i<smokeCount; i++) {
    smokePos[i*3] = (Math.random() - 0.5) * 3;
    smokePos[i*3+1] = -5 - Math.random() * 15;
    smokePos[i*3+2] = (Math.random() - 0.5) * 3;
}
smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
const smokeMat = new THREE.PointsMaterial({
    color: 0x888888, size: 1.0, transparent: true, opacity: 0.3
});
const rocketSmoke = new THREE.Points(smokeGeo, smokeMat);
rocketSmoke.visible = false; // Apagado inicialmente
rocketGroup.add(rocketSmoke);


// Posicionamiento inicial de Carga (Centro)
rocketGroup.scale.set(0.6, 0.6, 0.6); // Más grande durante la carga
rocketGroup.position.set(0, 0, 0); 
scene.add(rocketGroup);
// ==========================================


// Interacción
let scrollY = 0;
let maxScroll = document.body.scrollHeight - window.innerHeight;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    maxScroll = document.body.scrollHeight - window.innerHeight;
});

let mouseX = 0, mouseY = 0;
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalf.x);
    mouseY = (event.clientY - windowHalf.y);
});

const clock = new THREE.Clock();

// ESTADOS DE LA ESCENA
let isStateLoading = true;
let isTransitioning = false;
let loadTime = 0;
const loadDuration = 3; // 3 segundos

// Lerp helper
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    stars.rotation.y = time * 0.005;

    if (isStateLoading) {
        // --- ESTADO 1: CARGANDO COMBUSTIBLE ---
        loadTime += delta;
        const progress = Math.min(loadTime / loadDuration, 1);
        
        // El rayo de combustible sube
        fuelBeam.position.y = -10 + (progress * 10);
        
        // Rotación lenta épica
        rocketGroup.rotation.y = time * 0.2;
        
        // Actualizar UI
        const percEl = document.getElementById('loaderPercentage');
        const barEl = document.getElementById('loaderBar');
        const pct = Math.floor(progress * 100);
        if(percEl) percEl.innerHTML = pct + '%';
        if(barEl) barEl.style.width = pct + '%';
        
        if (progress >= 1) {
            isStateLoading = false;
            isTransitioning = true;
            // Ocultar UI de Carga completamente
            const loaderEl = document.getElementById('loader');
            if(loaderEl) {
                loaderEl.style.opacity = 0;
                loaderEl.style.pointerEvents = 'none';
                setTimeout(() => { loaderEl.style.visibility = 'hidden'; }, 900);
            }
            
            // Ignición!
            fuelBeam.visible = false;
            rocketFire.visible = true;
            rocketSmoke.visible = true;
            
            // Iniciar entrada de la página
            setTimeout(() => {
                const mainContent = document.getElementById('main-content');
                if(mainContent) {
                    mainContent.classList.remove('hidden-content');
                    mainContent.classList.add('visible-content');
                }
            }, 500); // 500ms después de ignición para entrada más rápida
        }
    } 
    else if (isTransitioning) {
        // --- ESTADO 2: TRANSICIÓN DE DESPEGUE ---
        // El cohete va a su posición normal (X:7, Y:3, Z:5)
        rocketGroup.position.x = lerp(rocketGroup.position.x, 7, 0.02);
        rocketGroup.position.y = lerp(rocketGroup.position.y, 3 + Math.sin(time * 5) * 0.2, 0.02);
        rocketGroup.scale.x = lerp(rocketGroup.scale.x, 0.4, 0.02);
        rocketGroup.scale.y = lerp(rocketGroup.scale.y, 0.4, 0.02);
        rocketGroup.scale.z = lerp(rocketGroup.scale.z, 0.4, 0.02);
        
        // Inclinación
        rocketGroup.rotation.x = lerp(rocketGroup.rotation.x, Math.PI / 10, 0.02);
        rocketGroup.rotation.z = lerp(rocketGroup.rotation.z, -Math.PI / 15, 0.02);
        rocketGroup.rotation.y = lerp(rocketGroup.rotation.y, Math.sin(time) * 0.05, 0.02);
        
        // La Tierra Sube
        earthGroup.position.y = lerp(earthGroup.position.y, -6, 0.02);
        
        // Terminar transición cuando ya llegó a su posición
        if (Math.abs(earthGroup.position.y - (-6)) < 0.1) {
            isTransitioning = false; 
        }
    }

    if (!isStateLoading) {
        // Animaciones estándar de partículas y Tierra (cuando ya no está cargando)
        earth.rotation.y += 0.001;
        clouds.rotation.y += 0.0012; 
        
        // Scroll Factor (solo aplicarlo cuando la transición cinemática haya TERMINADO por completo)
        if(!isTransitioning) {
            const scrollFactor = maxScroll > 0 ? scrollY / maxScroll : 0;
            earthGroup.position.y = -6 - (scrollFactor * 15);
        }

        // Fuego
        const fPositions = fireGeo.attributes.position.array;
        for(let i=0; i<fireCount; i++) {
            fPositions[i*3+1] -= 0.3; 
            if(fPositions[i*3+1] < -7) fPositions[i*3+1] = -3; 
        }
        fireGeo.attributes.position.needsUpdate = true;

        // Humo
        const sPositions = smokeGeo.attributes.position.array;
        for(let i=0; i<smokeCount; i++) {
            sPositions[i*3+1] -= 0.15;
            if (sPositions[i*3] > 0) sPositions[i*3] += 0.02;
            else sPositions[i*3] -= 0.02;
            
            if(sPositions[i*3+1] < -20) {
                sPositions[i*3+1] = -5;
                sPositions[i*3] = (Math.random() - 0.5) * 3;
            }
        }
        smokeGeo.attributes.position.needsUpdate = true;
        
        // Flote constante en modo normal
        if (!isTransitioning || earthGroup.position.y > -6.5) {
            rocketGroup.position.y = 3 + Math.sin(time * 5) * 0.2;
            rocketGroup.position.x = 7 + Math.cos(time * 2) * 0.1;
            rocketGroup.rotation.y = Math.sin(time) * 0.05;
        }
    }

    // Paralaje
    target.x = (mouseX * 0.005);
    target.y = (-mouseY * 0.005);
    camera.position.x += (target.x - camera.position.x) * 0.05;
    camera.position.y += (target.y + 5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    composer.render();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
