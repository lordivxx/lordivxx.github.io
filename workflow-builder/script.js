// --- SCRIPT START ---

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearCanvasBtn = document.getElementById('clear-canvas');
const addNodeBtns = document.querySelectorAll('.add-node-btn');
const runWorkflowBtn = document.getElementById('run-workflow');
const saveWorkflowBtn = document.getElementById('save-workflow');
const loadWorkflowBtn = document.getElementById('load-workflow');
const loadInput = document.getElementById('load-input');
const outputContent = document.getElementById('output-content');

const nodeList = document.getElementById('node-list');
const configPanel = document.getElementById('config-panel');
const configTitle = document.getElementById('config-title');
const configContent = document.getElementById('config-content');
const configSaveBtn = document.getElementById('config-save');
const configBackBtn = document.getElementById('config-back');

let nodes = [];
let connections = [];
let selectedNode = null;
let dragging = false;
let drawingConnection = false;
let startConnector = null;
let mousePos = { x: 0, y: 0 };

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const CONNECTOR_RADIUS = 8;
const NODE_HEADER_HEIGHT = 30;

const NODE_TYPES = {
    Start: { color: '#2ECC71', icon: '▶', inputs: [], outputs: ['output'] },
    UserInput: { color: '#3498DB', icon: '⌨️', inputs: ['input'], outputs: ['output'] },
    Text: { color: '#3498DB', icon: 'T', inputs: ['input'], outputs: ['output'] },
    Image: { color: '#E67E22', icon: '🖼️', inputs: ['input'], outputs: ['output'] },
    Sound: { color: '#9B59B6', icon: '🔊', inputs: ['input'], outputs: ['output'] },
    Delay: { color: '#F1C40F', icon: '⏳', inputs: ['input'], outputs: ['output'] },
    Condition: { color: '#E74C3C', icon: '?', inputs: ['input'], outputs: ['output_true', 'output_false'] }
};

// --- Drawing ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    for (const conn of connections) {
        const startNode = nodes.find(n => n.id === conn.from.nodeId);
        const endNode = nodes.find(n => n.id === conn.to.nodeId);
        if (startNode && endNode) {
            const startPos = getConnectorPos(startNode, conn.from.connector);
            const endPos = getConnectorPos(endNode, conn.to.connector);
            drawArrow(startPos.x, startPos.y, endPos.x, endPos.y);
        }
    }
    if (drawingConnection && startConnector) {
        const startNode = nodes.find(n => n.id === startConnector.nodeId);
        const startPos = getConnectorPos(startNode, startConnector.connector);
        drawArrow(startPos.x, startPos.y, mousePos.x, mousePos.y);
    }
    for (const node of nodes) {
        drawNode(node);
    }
}

function drawNode(node) {
    const nodeType = NODE_TYPES[node.type];
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = node.isExecuting ? '#F1C40F' : (selectedNode === node ? '#3498DB' : '#333');
    ctx.lineWidth = 3;
    ctx.fillRect(node.x, node.y, node.width, node.height);
    ctx.strokeRect(node.x, node.y, node.width, node.height);
    ctx.fillStyle = nodeType.color;
    ctx.fillRect(node.x, node.y, node.width, NODE_HEADER_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${nodeType.icon} ${node.type}`, node.x + 10, node.y + NODE_HEADER_HEIGHT / 2);
    
    nodeType.inputs.forEach(input => drawConnector(node, input));
    nodeType.outputs.forEach(output => drawConnector(node, output));
}

function drawConnector(node, name) {
    const pos = getConnectorPos(node, name);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, CONNECTOR_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#555';
    ctx.font = '12px Arial';
    ctx.textAlign = name.startsWith('output') ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    const label = name.replace('output_', '').replace('input', '');
    ctx.fillText(label, pos.x + (name.startsWith('output') ? 12 : -12), pos.y);
}

function drawArrow(fromx, fromy, tox, toy) {
    const headlen = 10;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function getConnectorPos(node, name) {
    const nodeType = NODE_TYPES[node.type];
    const isInput = name.startsWith('input');
    const connectors = isInput ? nodeType.inputs : nodeType.outputs;
    const index = connectors.indexOf(name);
    const total = connectors.length;
    const y = node.y + NODE_HEADER_HEIGHT + ((node.height - NODE_HEADER_HEIGHT) / (total + 1)) * (index + 1);
    const x = isInput ? node.x : node.x + node.width;
    return { x, y };
}

// --- Node & Workflow Management ---

function addNode(type) {
    const newNode = {
        id: Date.now(), type, x: 50, y: 50 + nodes.length * 50, width: NODE_WIDTH, height: NODE_HEIGHT, properties: {}, isExecuting: false,
    };
    // Set default properties
    switch (type) {
        case 'Text': newNode.properties.text = 'Hello, {{data.name || "world"}}!'; break;
        case 'Image': newNode.properties.url = 'https://cataas.com/cat/says/{{data.topic || "Hello"}}'; break;
        case 'Sound': newNode.properties.url = 'https://www.soundjay.com/buttons/beep-07a.mp3'; break;
        case 'Delay': newNode.properties.duration = 1000; break;
        case 'UserInput': newNode.properties.prompt = 'What is your name?'; newNode.properties.variable = 'name'; break;
        case 'Condition': newNode.properties.condition = 'data.name === "Admin"'; break;
    }
    nodes.push(newNode);
    draw();
}

function resolveValue(template, data) {
    if (!template || typeof template !== 'string') return template;
    return template.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
        try {
            // Safely evaluate expression with data context
            return new Function('data', `return ${expr}`)(data);
        } catch (e) {
            return match; // Return original if evaluation fails
        }
    });
}

// --- Config Panel ---

function showConfigPanel(node) {
    selectedNode = node;
    configTitle.textContent = `${node.type} Settings`;
    configContent.innerHTML = ''; // Clear previous content

    const addConfigItem = (label, type, key, value) => {
        const id = `config-${key}`;
        configContent.innerHTML += `
            <div class="config-item">
                <label for="${id}">${label}</label>
                ${type === 'textarea' ? 
                    `<textarea id="${id}" rows="3">${value}</textarea>` : 
                    `<input type="${type}" id="${id}" value="${value}">`
                }
            </div>
        `;
    };

    switch (node.type) {
        case 'Text': addConfigItem('Text to Display', 'textarea', 'text', node.properties.text); break;
        case 'Image': addConfigItem('Image URL', 'text', 'url', node.properties.url); break;
        case 'Sound': addConfigItem('Sound URL', 'text', 'url', node.properties.url); break;
        case 'Delay': addConfigItem('Delay (ms)', 'number', 'duration', node.properties.duration); break;
        case 'UserInput':
            addConfigItem('Prompt Question', 'text', 'prompt', node.properties.prompt);
            addConfigItem('Variable to Store', 'text', 'variable', node.properties.variable);
            break;
        case 'Condition': addConfigItem('JavaScript Condition (e.g., data.name === "Admin")', 'textarea', 'condition', node.properties.condition); break;
    }

    nodeList.classList.add('hidden');
    configPanel.classList.remove('hidden');
}

function hideConfigPanel() {
    selectedNode = null;
    configPanel.classList.add('hidden');
    nodeList.classList.remove('hidden');
}

configSaveBtn.addEventListener('click', () => {
    if (!selectedNode) return;
    const inputs = configContent.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const key = input.id.replace('config-', '');
        const isNumber = input.type === 'number';
        selectedNode.properties[key] = isNumber ? parseInt(input.value, 10) : input.value;
    });
    hideConfigPanel();
    draw();
});

configBackBtn.addEventListener('click', hideConfigPanel);

// --- Execution Engine ---

async function runWorkflow() {
    outputContent.innerHTML = '';
    const startNode = nodes.find(n => n.type === 'Start');
    if (!startNode) { alert('Add a "Start" node!'); return; }

    let executionQueue = [{ node: startNode, data: {} }];
    
    while (executionQueue.length > 0) {
        const { node, data } = executionQueue.shift();
        
        node.isExecuting = true;
        draw();

        const result = await executeNode(node, data);
        
        node.isExecuting = false;
        draw();

        if (result.exit) continue;

        const nextConnections = connections.filter(c => c.from.nodeId === node.id);
        for (const conn of nextConnections) {
            if (result.nextConnector && conn.from.connector !== result.nextConnector) continue;
            
            const nextNode = nodes.find(n => n.id === conn.to.nodeId);
            if (nextNode) {
                executionQueue.push({ node: nextNode, data: result.data });
            }
        }
    }
}

function executeNode(node, data) {
    return new Promise(resolve => {
        const p = (text) => { const el = document.createElement('p'); el.innerHTML = text; outputContent.appendChild(el); outputContent.scrollTop = outputContent.scrollHeight; };
        
        switch (node.type) {
            case 'Start': resolve({ data }); break;
            case 'Text': p(`[Text] ${resolveValue(node.properties.text, data)}`); resolve({ data }); break;
            case 'Image':
                const img = document.createElement('img');
                img.src = resolveValue(node.properties.url, data);
                img.style.cssText = 'max-width:90%; display:block; margin:10px 0; border-radius: 5px;';
                outputContent.appendChild(img);
                img.onload = () => resolve({ data });
                img.onerror = () => { p(`[Image] Error loading: ${img.src}`); resolve({ data }); };
                break;
            case 'Sound':
                const audio = new Audio(resolveValue(node.properties.url, data));
                p(`[Sound] Playing...`);
                audio.play();
                audio.onended = () => resolve({ data });
                audio.onerror = () => { p(`[Sound] Error playing sound.`); resolve({ data }); };
                break;
            case 'Delay':
                p(`[Delay] Waiting for ${node.properties.duration}ms...`);
                setTimeout(() => { p(`[Delay] ...Done.`); resolve({ data }); }, node.properties.duration);
                break;
            case 'UserInput':
                p(`[Input] ${resolveValue(node.properties.prompt, data)}`);
                const input = document.createElement('input');
                const button = document.createElement('button');
                button.textContent = 'Submit';
                input.type = 'text';
                input.className = 'config-item';
                button.className = 'sidebar-btn';
                outputContent.appendChild(input);
                outputContent.appendChild(button);
                input.focus();
                button.onclick = () => {
                    const newData = { ...data, [node.properties.variable]: input.value };
                    input.remove();
                    button.remove();
                    resolve({ data: newData });
                };
                break;
            case 'Condition':
                let result = false;
                try {
                    result = new Function('data', `return ${node.properties.condition}`)(data);
                } catch (e) { p(`[Condition] Error: ${e.message}`); }
                p(`[Condition] '${node.properties.condition}' evaluated to: <strong>${result}</strong>`);
                resolve({ data, nextConnector: result ? 'output_true' : 'output_false' });
                break;
            default: resolve({ data });
        }
    });
}

// --- Event Listeners & Save/Load ---

function getMousePos(canvas, evt) { const rect = canvas.getBoundingClientRect(); return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }; }
function getNodeAtPos(pos) { return nodes.slice().reverse().find(n => pos.x > n.x && pos.x < n.x + n.width && pos.y > n.y && pos.y < n.y + n.height); }
function getConnectorAtPos(pos) {
    for (const node of nodes) {
        const allConnectors = [...NODE_TYPES[node.type].inputs, ...NODE_TYPES[node.type].outputs];
        for (const name of allConnectors) {
            const cPos = getConnectorPos(node, name);
            if (Math.hypot(pos.x - cPos.x, pos.y - cPos.y) < CONNECTOR_RADIUS) return { nodeId: node.id, connector: name };
        }
    }
    return null;
}

canvas.addEventListener('mousedown', (e) => {
    mousePos = getMousePos(canvas, e);
    const connector = getConnectorAtPos(mousePos);
    if (connector && connector.connector.startsWith('output')) {
        drawingConnection = true;
        startConnector = connector;
    } else {
        const node = getNodeAtPos(mousePos);
        if (node) { selectedNode = node; dragging = true; }
    }
});
canvas.addEventListener('mousemove', (e) => {
    mousePos = getMousePos(canvas, e);
    if (dragging && selectedNode) {
        selectedNode.x += e.movementX;
        selectedNode.y += e.movementY;
        draw();
    } else if (drawingConnection) {
        draw();
    }
});
canvas.addEventListener('mouseup', (e) => {
    if (drawingConnection && startConnector) {
        const endConnector = getConnectorAtPos(getMousePos(canvas, e));
        if (endConnector && endConnector.connector.startsWith('input') && endConnector.nodeId !== startConnector.nodeId) {
            connections.push({ from: startConnector, to: endConnector });
        }
    }
    dragging = false; drawingConnection = false; startConnector = null;
    draw();
});
canvas.addEventListener('dblclick', (e) => {
    const node = getNodeAtPos(getMousePos(canvas, e));
    if (node) showConfigPanel(node);
});

addNodeBtns.forEach(btn => btn.addEventListener('click', () => addNode(btn.dataset.nodeType)));
clearCanvasBtn.addEventListener('click', () => { nodes = []; connections = []; outputContent.innerHTML = ''; draw(); });
runWorkflowBtn.addEventListener('click', runWorkflow);

saveWorkflowBtn.addEventListener('click', () => {
    const data = JSON.stringify({ nodes, connections }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = 'workflow.json';
    a.click();
});
loadWorkflowBtn.addEventListener('click', () => loadInput.click());
loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const { nodes: loadedNodes, connections: loadedConnections } = JSON.parse(event.target.result);
            nodes = loadedNodes;
            connections = loadedConnections;
            draw();
        } catch (err) { alert('Error parsing workflow file.'); }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
});

draw();
// --- SCRIPT END ---