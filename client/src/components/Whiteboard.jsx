import { useRef, useEffect, useState } from "react";
import { socket } from "../socket";

const DEFAULT_COLOR = "#111827";
const DEFAULT_WIDTH = 2;

// Available tools: freehand pen, eraser, rectangle, straight line, circle, text
const TOOLS = ["pen", "eraser", "rect", "line", "circle", "text"];

export default function Whiteboard({ name, roomId, canDraw }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [lineWidth, setLineWidth] = useState(DEFAULT_WIDTH);
  const [tool, setTool] = useState("pen"); // pen | eraser | rect | line | circle | text
  const prevRef = useRef({});
  const shapeStartRef = useRef(null);
  const nameRef = useRef(name);
  
  // Keep nameRef updated with the latest name prop
  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth - 20;
        canvas.height = Math.max(500, window.innerHeight - 260);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleDraw = ({ x0, y0, x1, y1, color, lineWidth }) => {
      ctx.strokeStyle = color || DEFAULT_COLOR;
      ctx.lineWidth = lineWidth || DEFAULT_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };

    const handleStrokeEnd = ({ x, y, name: drawerName }) => {
      if (!drawerName) return;
      ctx.font = "11px Arial";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(drawerName, x + 6, y + 6);
    };

    const handleShapeDraw = (payload) => {
      const {
        type,
        x0,
        y0,
        x1,
        y1,
        color: shapeColor,
        lineWidth: shapeWidth,
        text,
        name: drawerName,
      } = payload;

      const strokeColor = shapeColor || DEFAULT_COLOR;
      const width = shapeWidth || DEFAULT_WIDTH;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (type === "rect") {
        const x = Math.min(x0, x1);
        const y = Math.min(y0, y1);
        const w = Math.abs(x1 - x0);
        const h = Math.abs(y1 - y0);
        ctx.strokeRect(x, y, w, h);
      } else if (type === "line") {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      } else if (type === "circle") {
        const radius = Math.hypot(x1 - x0, y1 - y0);
        ctx.beginPath();
        ctx.arc(x0, y0, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (type === "text" && text) {
        ctx.font = "14px Arial";
        ctx.fillStyle = strokeColor;
        ctx.fillText(text, x0, y0);
      }

      if (drawerName) {
        ctx.font = "11px Arial";
        ctx.fillStyle = "#6b7280";
        const labelX = type === "text" ? x0 + 4 : (x1 || x0) + 6;
        const labelY = type === "text" ? y0 + 14 : (y1 || y0) + 6;
        ctx.fillText(drawerName, labelX, labelY);
      }
    };

    const handleClear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on("draw", handleDraw);
    socket.on("stroke-end", handleStrokeEnd);
    socket.on("draw-shape", handleShapeDraw);
    socket.on("clear-board", handleClear);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      socket.off("draw", handleDraw);
      socket.off("stroke-end", handleStrokeEnd);
      socket.off("draw-shape", handleShapeDraw);
      socket.off("clear-board", handleClear);
    };
  }, [name]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches?.[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!canDraw) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    // Text tool: place text immediately on click
    if (tool === "text") {
      const text = window.prompt("Enter text");
      if (!text) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const currentName =
        nameRef.current || localStorage.getItem("name") || "User";

      ctx.font = "14px Arial";
      ctx.fillStyle = color;
      ctx.fillText(text, coords.x, coords.y);
      ctx.font = "11px Arial";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(currentName, coords.x + 4, coords.y + 14);

      socket.emit("draw-shape", {
        roomId,
        type: "text",
        x0: coords.x,
        y0: coords.y,
        text,
        color,
        name: currentName,
      });
      return;
    }

    setDrawing(true);
    prevRef.current = coords;
    shapeStartRef.current = coords;
  };

  const draw = (e) => {
    if (!canDraw) return;
    e.preventDefault();
    if (!drawing) return;

    // For shapes we only draw on mouse up; skip intermediate moves
    if (tool !== "pen" && tool !== "eraser") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const curr = getCoordinates(e);
    if (!curr) return;

    const strokeColor = tool === "eraser" ? "#ffffff" : color;
    const strokeWidth = tool === "eraser" ? Math.max(lineWidth * 2, 6) : lineWidth;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw locally
    ctx.beginPath();
    ctx.moveTo(prevRef.current.x, prevRef.current.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();

    // Use nameRef to ensure we always have the latest name value
    const currentName = nameRef.current || localStorage.getItem("name") || "User";
    socket.emit("draw", {
      roomId,
      x0: prevRef.current.x,
      y0: prevRef.current.y,
      x1: curr.x,
      y1: curr.y,
      name: currentName,
      color: strokeColor,
      lineWidth: strokeWidth,
    });

    prevRef.current = curr;
  };

  const stopDrawing = (e) => {
    if (!drawing) return;
    e.preventDefault();
    setDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const endCoords = getCoordinates(e) || prevRef.current;
    const start = shapeStartRef.current || prevRef.current;

    const currentName =
      nameRef.current || localStorage.getItem("name") || "User";

    // Handle shape tools on mouse up
    if (tool === "rect" && start && endCoords) {
      const x = Math.min(start.x, endCoords.x);
      const y = Math.min(start.y, endCoords.y);
      const w = Math.abs(endCoords.x - start.x);
      const h = Math.abs(endCoords.y - start.y);

      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, w, h);

      socket.emit("draw-shape", {
        roomId,
        type: "rect",
        x0: x,
        y0: y,
        x1: x + w,
        y1: y + h,
        color,
        lineWidth,
        name: currentName,
      });
    } else if (tool === "line" && start && endCoords) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(endCoords.x, endCoords.y);
      ctx.stroke();

      socket.emit("draw-shape", {
        roomId,
        type: "line",
        x0: start.x,
        y0: start.y,
        x1: endCoords.x,
        y1: endCoords.y,
        color,
        lineWidth,
        name: currentName,
      });
    } else if (tool === "circle" && start && endCoords) {
      const radius = Math.hypot(endCoords.x - start.x, endCoords.y - start.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      socket.emit("draw-shape", {
        roomId,
        type: "circle",
        x0: start.x,
        y0: start.y,
        x1: endCoords.x,
        y1: endCoords.y,
        color,
        lineWidth,
        name: currentName,
      });
    } else {
      // Freehand stroke end - add small name label
      const lastPoint = prevRef.current;
      if (lastPoint?.x != null && lastPoint?.y != null) {
        ctx.font = "11px Arial";
        ctx.fillStyle = "#6b7280";
        ctx.fillText(currentName, lastPoint.x + 6, lastPoint.y + 6);

        socket.emit("stroke-end", {
          roomId,
          x: lastPoint.x,
          y: lastPoint.y,
          name: currentName,
        });
      }
    }

    shapeStartRef.current = null;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard-${roomId || "session"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full h-full border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg relative">
      {!canDraw && (
        <div className="absolute top-2 right-2 z-10 px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 shadow pointer-events-none">
          Drawing disabled by room owner
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-3 border-b bg-gray-50 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {TOOLS.map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-3 py-1 text-xs sm:text-sm rounded border ${
                tool === t
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              disabled={!canDraw && t !== "text"}
            >
              {t === "pen"
                ? "Pen"
                : t === "eraser"
                ? "Eraser"
                : t === "rect"
                ? "Rectangle"
                : t === "line"
                ? "Line"
                : t === "circle"
                ? "Circle"
                : "Text"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 p-0 border rounded cursor-pointer"
            disabled={!canDraw || tool === "eraser"}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Stroke</label>
          <input
            type="range"
            min="1"
            max="12"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            disabled={!canDraw}
            className="w-32"
          />
          <span className="text-xs text-gray-600">{lineWidth}px</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={downloadImage}
            className="px-3 py-1 text-sm rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            Download PNG
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={`w-full h-full ${canDraw ? "cursor-crosshair" : "cursor-not-allowed"}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
}
