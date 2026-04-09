import { config } from './config.js';
import { getDomElements, bindUiEvents, setActiveTemplate } from './dom.js';
import { createSceneController } from './scene.js';
import { initializeHandTracking } from './handTracking.js';

const dom = getDomElements();
const sceneController = createSceneController(dom.container, config);
const THREE = window.THREE;

sceneController.buildParticles(config.template);
setActiveTemplate(dom, config.template);

bindUiEvents(dom, {
    onTemplateChange: (template) => {
        config.template = template;
        sceneController.switchTemplate(template);
    },
    onColorChange: (color) => {
        config.baseColor = color;
        sceneController.setColor(color);
        dom.cursorLeft.style.boxShadow = `0 0 15px ${color}, inset 0 0 10px ${color}`;
    }
});

initializeHandTracking(config, dom);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    sceneController.updateFrame(deltaTime);
    sceneController.render();
}

window.addEventListener('resize', () => {
    sceneController.resize();
});

animate();
