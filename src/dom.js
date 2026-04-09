export function getDomElements() {
    return {
        container: document.getElementById('canvas-container'),
        video: document.querySelector('.input_video'),
        status: document.getElementById('status-text'),
        statusBox: document.querySelector('.status-box'),
        loader: document.getElementById('loader'),
        cursorLeft: document.getElementById('cursor-left'),
        cursorRight: document.getElementById('cursor-right'),
        colorPicker: document.getElementById('color-picker'),
        templateButtons: Array.from(document.querySelectorAll('.btn-group button[data-template]'))
    };
}

export function bindUiEvents(dom, handlers) {
    const { onTemplateChange, onColorChange } = handlers;

    dom.templateButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const template = button.dataset.template;
            setActiveTemplate(dom, template);
            onTemplateChange(template);
        });
    });

    dom.colorPicker.addEventListener('input', (event) => {
        onColorChange(event.target.value);
    });
}

export function setActiveTemplate(dom, template) {
    dom.templateButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.template === template);
    });
}

export function setStatus(dom, html, borderColor) {
    dom.status.innerHTML = html;
    dom.statusBox.style.borderLeftColor = borderColor;
}
