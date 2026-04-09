import { setStatus } from './dom.js';

function assertMediaPipe() {
    if (!window.Hands || !window.Camera) {
        throw new Error('MediaPipe dependencies are not loaded.');
    }

    return {
        Hands: window.Hands,
        Camera: window.Camera
    };
}

function updateCursorPosition(cursor, x, y) {
    cursor.style.display = 'block';
    cursor.style.left = `${x * 100}%`;
    cursor.style.top = `${y * 100}%`;
}

export function initializeHandTracking(config, dom) {
    const { Hands, Camera } = assertMediaPipe();

    function onResults(results) {
        dom.loader.style.display = 'none';

        let leftDetected = false;
        let rightDetected = false;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i += 1) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i];
                const label = handedness.label;

                if (label === 'Left') {
                    leftDetected = true;
                    const palmX = landmarks[9].x;
                    const palmY = landmarks[9].y;

                    config.leftHandX = 1 - palmX;
                    config.leftHandY = palmY;
                    updateCursorPosition(dom.cursorLeft, config.leftHandX, config.leftHandY);
                }

                if (label === 'Right') {
                    rightDetected = true;

                    const thumbTip = landmarks[4];
                    const indexTip = landmarks[8];
                    const wrist = landmarks[0];
                    const middleTip = landmarks[12];

                    const handSize = Math.hypot(wrist.x - middleTip.x, wrist.y - middleTip.y);
                    const pinchDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

                    const openness = Math.min(Math.max(pinchDistance / (handSize * 0.8), 0), 1);
                    config.rightHandOpenness = openness;

                    updateCursorPosition(dom.cursorRight, 1 - landmarks[9].x, landmarks[9].y);
                    const cursorScale = 0.5 + openness * 0.5;
                    dom.cursorRight.style.transform = `translate(-50%, -50%) scale(${cursorScale})`;
                }
            }
        }

        if (!leftDetected) {
            dom.cursorLeft.style.display = 'none';
        }

        if (!rightDetected) {
            dom.cursorRight.style.display = 'none';
        }

        if (leftDetected && rightDetected) {
            setStatus(dom, 'Both Hands Active<br><small>Left: Rotate | Right: Zoom</small>', '#00ff88');
        } else if (leftDetected) {
            setStatus(dom, 'Left Hand Detected<br><small>Controlling Rotation</small>', '#00ffff');
        } else if (rightDetected) {
            setStatus(dom, 'Right Hand Detected<br><small>Controlling Zoom</small>', '#a29bfe');
        } else {
            setStatus(dom, 'No Hands Detected', '#ff4757');

            config.leftHandX += (0.5 - config.leftHandX) * 0.05;
            config.leftHandY += (0.5 - config.leftHandY) * 0.05;
        }
    }

    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    const camera = new Camera(dom.video, {
        onFrame: async () => {
            await hands.send({ image: dom.video });
        },
        width: 640,
        height: 480
    });

    camera.start();
}
