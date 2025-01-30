const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");

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
};

let painting = false;
let brushSize = 1;
let opacity = 1.0;
let brushColor = `rgba(0,0,0,${opacity})`;
let currentTool = "brush";
let startX, startY;
let snapshot; // To store canvas state before drawing a rectangle

// Function to set the active tool and highlight it
function setActiveTool(tool) {
    currentTool = tool;
    Object.values(tools).forEach((btn) => btn.classList.remove("active"));
    tools[tool].classList.add("active");
}

function startPainting(e) {
    painting = true;
    startX = e.offsetX;
    startY = e.offsetY;

    ctx.beginPath();

    switch (currentTool) {
        case "rectangle":
        case "filledRectangle":
        case "circle":
        case "filledCircle":
            // Take a snapshot of the canvas before drawing the rectangle
            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            break;
        default:
            ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    if (!painting) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : brushColor;

    switch (currentTool) {
        case "horizontalLine":
            ctx.strokeRect(startX, startY, e.offsetX - startX, 1);
            break;

        case "verticalLine":
            ctx.strokeRect(startX, startY, 1, e.offsetY - startY);
            break;

        case "rectangle":
        case "filledRectangle":
            ctx.putImageData(snapshot, 0, 0); // Restore canvas before drawing a new rectangle

            let width = e.offsetX - startX;
            let height = e.offsetY - startY;

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
            const radius = Math.sqrt((startX - e.offsetX) ** 2 + (startY - e.offsetY) ** 2);

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
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
    }
}

function stopPainting(e) {
    painting = false;
    ctx.closePath();
}

// Event Listeners
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopPainting);

// Tool Handlers
tools.brush.addEventListener("click", () => setActiveTool("brush"));
tools.eraser.addEventListener("click", () => setActiveTool("eraser"));
tools.horizontalLine.addEventListener("click", () => setActiveTool("horizontalLine"));
tools.verticalLine.addEventListener("click", () => setActiveTool("verticalLine"));
tools.rectangle.addEventListener("click", () => setActiveTool("rectangle"));
tools.filledRectangle.addEventListener("click", () => setActiveTool("filledRectangle"));
tools.circle.addEventListener("click", () => setActiveTool("circle"));
tools.filledCircle.addEventListener("click", () => setActiveTool("filledCircle"));

colorPicker.addEventListener("input", (e) => {
    brushColor = createRGBA(e.target.value, opacity);
});

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

document.getElementById("opacity").addEventListener("input", (e) => {
    opacity = e.target.value;
    document.getElementById("opacityValue").textContent = opacity;

    const { r, g, b } = extractRGB(brushColor);
    brushColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
});

function createRGBA(hex, opacity) {
    // Remove the '#' if it's present
    hex = hex.replace("#", "");
    // Convert the hex color to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function extractRGB(rgbaString) {
    // Regular expression to match rgba values
    const rgbaRegex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/;

    const match = rgbaString.match(rgbaRegex);

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return { r, g, b };
}
