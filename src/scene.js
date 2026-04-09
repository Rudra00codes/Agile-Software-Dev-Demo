function assertThree() {
    if (!window.THREE) {
        throw new Error('Three.js is not loaded.');
    }
    return window.THREE;
}

function createGlowTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

function buildGenerators(config) {
    return {
        saturn: () => {
            const positions = [];
            const sizes = [];

            for (let i = 0; i < config.particleCount; i += 1) {
                let x;
                let y;
                let z;
                let size;

                if (Math.random() < 0.2) {
                    const radius = 6 * Math.cbrt(Math.random());
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);

                    x = radius * Math.sin(phi) * Math.cos(theta);
                    y = radius * Math.sin(phi) * Math.sin(theta);
                    z = radius * Math.cos(phi);
                    size = Math.random() * 0.6 + 0.1;
                } else {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 8 + Math.random() * 14;

                    x = Math.cos(angle) * distance;
                    z = Math.sin(angle) * distance;
                    y = (Math.random() - 0.5) * 0.5;
                    size = Math.random() * 0.3;
                }

                positions.push(x, y, z);
                sizes.push(size);
            }

            return { positions, sizes };
        },
        galaxy: () => {
            const positions = [];
            const sizes = [];
            const branches = 5;

            for (let i = 0; i < config.particleCount; i += 1) {
                const radius = Math.random() * 25;
                const spin = radius * 0.5;
                const branchAngle = ((i % branches) / branches) * Math.PI * 2;
                const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
                const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
                const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);

                positions.push(
                    Math.cos(branchAngle + spin) * radius + randomX,
                    (Math.random() - 0.5) * (15 / (radius * 0.5 + 1)) + randomY,
                    Math.sin(branchAngle + spin) * radius + randomZ
                );
                sizes.push(Math.random() * 0.4 + 0.1);
            }

            return { positions, sizes };
        }
    };
}

export function createSceneController(container, config) {
    const THREE = assertThree();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 35;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    const particleTexture = createGlowTexture(THREE);
    const generators = buildGenerators(config);
    let particlesMesh = null;

    function buildParticles(type) {
        if (particlesMesh) {
            universeGroup.remove(particlesMesh);
            particlesMesh.geometry.dispose();
            particlesMesh.material.dispose();
        }

        const data = generators[type]();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(data.sizes, 1));

        const material = new THREE.PointsMaterial({
            color: config.baseColor,
            size: 0.5,
            map: particleTexture,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        particlesMesh = new THREE.Points(geometry, material);
        universeGroup.add(particlesMesh);
    }

    function setColor(color) {
        if (particlesMesh) {
            particlesMesh.material.color.set(color);
        }
    }

    function switchTemplate(name) {
        buildParticles(name);
        universeGroup.rotation.set(0, 0, 0);
    }

    function updateFrame(deltaTime) {
        const scaleTarget = 0.5 + config.rightHandOpenness * 2.5;
        config.currentScale += (scaleTarget - config.currentScale) * 0.1;

        const rotYTarget = (config.leftHandX - 0.5) * 4;
        const rotXTarget = (config.leftHandY - 0.5) * 3;

        config.currentRotY += (rotYTarget - config.currentRotY) * 0.05;
        config.currentRotX += (rotXTarget - config.currentRotX) * 0.05;

        universeGroup.scale.setScalar(config.currentScale);
        universeGroup.rotation.y += 0.02 * deltaTime;
        universeGroup.rotation.y += config.currentRotY * 0.1;
        universeGroup.rotation.x = config.currentRotX;

        if (particlesMesh) {
            particlesMesh.material.size = 0.2 + config.rightHandOpenness * 0.4;
        }
    }

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function render() {
        renderer.render(scene, camera);
    }

    return {
        buildParticles,
        setColor,
        switchTemplate,
        updateFrame,
        resize,
        render
    };
}
