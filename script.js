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
};

let painting = false;
let brushSize = 1;
let brushColor = "#01052b";
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
            ctx.lineTo(e.offsetX, startY);
            ctx.stroke();
            break;

        case "verticalLine":
            ctx.lineTo(startX, e.offsetY);
            ctx.stroke();
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

colorPicker.addEventListener("input", (e) => {
    brushColor = e.target.value;
});

brushSizeInput.addEventListener("input", (e) => {
    brushSize = e.target.value;
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
