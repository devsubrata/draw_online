const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");
const expandButton = document.getElementById("expand_canvas");

// Tools
const tools = {
    brush: document.getElementById("brush"),
    eraser: document.getElementById("eraser"),
    horizontalLine: document.getElementById("horizontalLine"),
    verticalLine: document.getElementById("verticalLine"),
    rectangle: document.getElementById("rectangle"),
    filledRectangle: document.getElementById("filledRectangle"),
    circle: document.getElementById("circle"),
    filledCircle: document.getElementById("filledCircle"),
    typeText: document.getElementById("typeText"),
};

let painting = false;
let isTyping = false;
let brushSize = 1;
let opacity = 1.0;
let brushColor = `rgba(0,0,0,${opacity})`;
let currentTool = "brush";
let startX, startY;
let snapshot; // Store canvas state before drawing a rectangle
const undoStack = [];
const redoStack = [];

// Set active tool
function setActiveTool(tool) {
    if (tool !== "typeText") isTyping = false;

    currentTool = tool;
    Object.values(tools).forEach((btn) => btn.classList.remove("active"));
    tools[tool].classList.add("active");
}

// Convert touch event to mouse-like coordinates
function getTouchPos(evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.touches[0].clientX - rect.left,
        y: evt.touches[0].clientY - rect.top,
    };
}

// Start drawing
function startPainting(e) {
    e.preventDefault();
    if (isTyping) return;

    painting = true;

    let pos = e.type.includes("touch") ? getTouchPos(e) : { x: e.offsetX, y: e.offsetY };
    startX = pos.x;
    startY = pos.y;

    ctx.beginPath();

    switch (currentTool) {
        case "rectangle":
        case "filledRectangle":
        case "circle":
        case "filledCircle":
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            break;
        default:
            ctx.moveTo(startX, startY);
    }
}

// Draw function
function draw(e) {
    if (!painting) return;
    e.preventDefault();

    let pos = e.type.includes("touch") ? getTouchPos(e) : { x: e.offsetX, y: e.offsetY };

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : brushColor;

    switch (currentTool) {
        case "horizontalLine":
            ctx.strokeRect(startX, startY, pos.x - startX, 1);
            break;
        case "verticalLine":
            ctx.strokeRect(startX, startY, 1, pos.y - startY);
            break;
        case "rectangle":
        case "filledRectangle":
            ctx.putImageData(snapshot, 0, 0);
            let width = pos.x - startX;
            let height = pos.y - startY;
            if (currentTool === "rectangle") {
                ctx.strokeRect(startX, startY, width, height);
            } else {
                ctx.fillStyle = brushColor;
                ctx.fillRect(startX, startY, width, height);
            }
            break;
        case "circle":
        case "filledCircle":
            ctx.putImageData(snapshot, 0, 0);
            const radius = Math.sqrt((startX - pos.x) ** 2 + (startY - pos.y) ** 2);
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            if (currentTool === "circle") {
                ctx.stroke();
            } else {
                ctx.fillStyle = brushColor;
                ctx.fill();
            }
            break;
        default:
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
    }
}

// Stop drawing
function stopPainting() {
    painting = false;
    ctx.closePath();
    saveState();
}

function addText(x, y, text) {
    ctx.font = "20px Arial";
    ctx.fillStyle = brushColor;
    ctx.fillText(text, x, y);
}

function showModal(e) {
    if (!isTyping) return;

    const modal = document.getElementById("modal");
    const submitBtn = document.getElementById("submitText");
    const textInput = document.getElementById("textInput");
    const closeBtn = document.getElementById("closeModal");
    if (textInput) textInput.focus();

    // Position modal at click point
    modal.style.left = `${e.pageX}px`;
    modal.style.top = `${e.pageY}px`;
    modal.style.display = "block";

    // Remove previous event listener to prevent duplicates
    submitBtn.onclick = () => {
        if (textInput.value.trim() !== "") {
            addText(e.offsetX, e.offsetY + 25, textInput.value);
        }
        modal.style.display = "none";
        textInput.value = "";
    };

    closeBtn.onclick = () => {
        modal.style.display = "none";
    };
}

// Event Listeners for mouse
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopPainting);
canvas.addEventListener("mouseout", stopPainting);
canvas.addEventListener("click", showModal);

// Event Listeners for touch
canvas.addEventListener("touchstart", startPainting);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopPainting);

// Disable scrolling while drawing
document.body.style.touchAction = "none";

// Tool Handlers
tools.brush.addEventListener("click", () => setActiveTool("brush"));
tools.eraser.addEventListener("click", () => setActiveTool("eraser"));
tools.horizontalLine.addEventListener("click", () => setActiveTool("horizontalLine"));
tools.verticalLine.addEventListener("click", () => setActiveTool("verticalLine"));
tools.rectangle.addEventListener("click", () => setActiveTool("rectangle"));
tools.filledRectangle.addEventListener("click", () => setActiveTool("filledRectangle"));
tools.circle.addEventListener("click", () => setActiveTool("circle"));
tools.filledCircle.addEventListener("click", () => setActiveTool("filledCircle"));
tools.typeText.addEventListener("click", () => {
    isTyping = true;
    setActiveTool("typeText");
});

// Color Picker
colorPicker.addEventListener("input", (e) => {
    brushColor = createRGBA(e.target.value, opacity);
});

// Brush Size
brushSizeInput.addEventListener("input", (e) => {
    brushSize = e.target.value;
    document.getElementById("rangeValue").textContent =
        parseInt(brushSize) >= 10 ? brushSize : `0${brushSize}`;
});

// Clear Canvas
document.getElementById("clear").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Save Image
document.getElementById("save").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "paint.png";
    link.click();
});

// Opacity Control
document.getElementById("opacity").addEventListener("input", (e) => {
    opacity = e.target.value;
    document.getElementById("opacityValue").textContent = opacity;
    const { r, g, b } = extractRGB(brushColor);
    brushColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
});

// Function to save the current canvas state
function saveState() {
    const state = canvas.toDataURL(); // Save canvas as data URL
    undoStack.push(state); // Push to undo stack
    redoStack.length = 0; // Clear redo stack when a new action is performed
}

// Undo functionality
document.getElementById("undo").addEventListener("click", () => {
    if (undoStack.length > 1) {
        // Ensure there's a state to undo to
        const currentState = undoStack.pop(); // Pop current state
        redoStack.push(currentState); // Push to redo stack
        const prevState = undoStack[undoStack.length - 1]; // Get previous state
        restoreCanvas(prevState); // Restore canvas
    }
});

// Redo functionality
document.getElementById("redo").addEventListener("click", () => {
    if (redoStack.length > 0) {
        // Ensure there's a state to redo to
        const nextState = redoStack.pop(); // Pop next state
        undoStack.push(nextState); // Push to undo stack
        restoreCanvas(nextState); // Restore canvas
    }
});

// Function to restore canvas from a state
function restoreCanvas(state) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        ctx.drawImage(img, 0, 0); // Draw the saved state
    };
}

// Expand Canvas Area when your canvas is full
expandButton.addEventListener("click", () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height += 600;
    ctx.putImageData(imageData, 0, 0);
});

// Helper function
function createRGBA(hex, opacity) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function extractRGB(rgbaString) {
    const rgbaRegex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/;
    const match = rgbaString.match(rgbaRegex);
    return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
}
