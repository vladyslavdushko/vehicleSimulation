window.machine1XTranslate = 0;
window.machine1YTranslate = 0;
window.machine2XTranslate = 0;
window.machine2YTranslate = 0;

let machine1RotationAngle = 0;
let machine2RotationAngle = 0;

let initialMachine1Points = [];
let initialMachine2Points = [];

window.lines = [];

function getTransformedPoints(points, xTranslate, yTranslate, rotationAngle) {
  const canvas = document.getElementById("machinesCanvas");
  const transformedPoints = [];
  const angleRad = (rotationAngle * Math.PI) / 180;

  let sumX = 0;
  let sumY = 0;
  points.forEach((point) => {
    sumX += point[0];
    sumY += point[1];
  });
  const centerX = sumX / points.length;
  const centerY = sumY / points.length;

  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  points.forEach((point) => {
    let x = point[0];
    let y = point[1];

    let dx = x - centerX;
    let dy = y - centerY;

    const rotatedX = dx * cosAngle - dy * sinAngle;
    const rotatedY = dx * sinAngle + dy * cosAngle;

    const finalX = rotatedX + centerX + xTranslate;
    const finalY = rotatedY + centerY + yTranslate;

    transformedPoints.push([finalX, canvas.height - finalY]);
  });

  return transformedPoints;
}

function drawMachine(transformedPoints, color) {
  const canvas = document.getElementById("machinesCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  transformedPoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawAllMachines() {
  const canvas = document.getElementById("machinesCanvas");
  const ctx = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  window.transformedMachine1Points = getTransformedPoints(
    initialMachine1Points,
    window.machine1XTranslate,
    window.machine1YTranslate,
    machine1RotationAngle
  );

  window.transformedMachine2Points = getTransformedPoints(
    initialMachine2Points,
    window.machine2XTranslate,
    window.machine2YTranslate,
    machine2RotationAngle
  );

  drawMachine(window.transformedMachine1Points, "red");
  drawMachine(window.transformedMachine2Points, "blue");

  const intersectionsCanvas = document.getElementById("intersectionsCanvas");
  if (intersectionsCanvas) {
    const intersectionsCtx = intersectionsCanvas.getContext("2d");
    intersectionsCtx.clearRect(
      0,
      0,
      intersectionsCanvas.width,
      intersectionsCanvas.height
    );
  }
}

window.moveMachine = (machineId, xTranslate, yTranslate) => {
  if (machineId === 1) {
    window.machine1XTranslate = xTranslate;
    window.machine1YTranslate = yTranslate;
  } else if (machineId === 2) {
    window.machine2XTranslate = xTranslate;
    window.machine2YTranslate = yTranslate;
  }
  drawAllMachines();
};

window.rotateMachine = (machineId, rotationAngle) => {
  if (machineId === 1) {
    machine1RotationAngle = rotationAngle;
  } else if (machineId === 2) {
    machine2RotationAngle = rotationAngle;
  }
  drawAllMachines();
};

window.clearCanvas = () => {
  const linesCanvas = document.getElementById("linesCanvas");
  const machinesCanvas = document.getElementById("machinesCanvas");
  const intersectionsCanvas = document.getElementById("intersectionsCanvas");

  if (linesCanvas) {
    const ctx = linesCanvas.getContext("2d");
    ctx.clearRect(0, 0, linesCanvas.width, linesCanvas.height);
  }

  if (machinesCanvas) {
    const ctx = machinesCanvas.getContext("2d");
    ctx.clearRect(0, 0, machinesCanvas.width, machinesCanvas.height);
  }

  if (intersectionsCanvas) {
    const ctx = intersectionsCanvas.getContext("2d");
    ctx.clearRect(0, 0, intersectionsCanvas.width, intersectionsCanvas.height);
  }

  window.lines = [];
  drawAllMachines();
};

window.drawLine = (startX, startY, endX, endY) => {
  const canvas = document.getElementById("linesCanvas");
  const ctx = canvas.getContext("2d");
  const canvasHeight = canvas.height;

  startY = canvasHeight - startY;
  endY = canvasHeight - endY;

  const line = {
    startX,
    startY,
    endX,
    endY,
  };

  window.lines.push(line);

  ctx.beginPath();
  ctx.moveTo(line.startX, line.startY);
  ctx.lineTo(line.endX, line.endY);
  ctx.stroke();
};

function getLinePoints(x1, y1, x2, y2) {
  const points = [];

  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / steps;
  const yIncrement = dy / steps;

  let x = x1;
  let y = y1;

  for (let i = 0; i <= steps; i++) {
    points.push([x, y]);
    x += xIncrement;
    y += yIncrement;
  }
  return points;
}

function findMatchingPairsWithIntersections(array1, array2) {
  let count = 0;
  const tolerance = 0.5;
  const intersectionPoints = [];

  array1.forEach((pair1) => {
    array2.forEach((pair2) => {
      if (
        Math.abs(pair1[0] - pair2[0]) <= tolerance &&
        Math.abs(pair1[1] - pair2[1]) <= tolerance
      ) {
        count++;
        const intersectionX = (pair1[0] + pair2[0]) / 2;
        const intersectionY = (pair1[1] + pair2[1]) / 2;
        intersectionPoints.push([intersectionX, intersectionY]);
      }
    });
  });

  return { count, intersectionPoints };
}

function drawIntersectionPoints(points, color) {
  const canvas = document.getElementById("intersectionsCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
}

window.findAllIntersections = (selectedMachine) => {
  const startTime = performance.now();

  const machinePoints =
    selectedMachine === 1
      ? window.transformedMachine1Points
      : window.transformedMachine2Points;

  const otherMachinePoints =
    selectedMachine === 1
      ? window.transformedMachine2Points
      : window.transformedMachine1Points;

  const {
    count: machineIntersectionCount,
    intersectionPoints: machineIntersectionPoints,
  } = findMatchingPairsWithIntersections(machinePoints, otherMachinePoints);

  let lineIntersectionCount = 0;
  let lineIntersectionPoints = [];

  window.lines.forEach((line) => {
    const linePoints = getLinePoints(
      line.startX,
      line.startY,
      line.endX,
      line.endY
    );
    const { count, intersectionPoints } = findMatchingPairsWithIntersections(
      machinePoints,
      linePoints
    );
    lineIntersectionCount += count;
    lineIntersectionPoints = lineIntersectionPoints.concat(intersectionPoints);
  });

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  const message = `Перетини знайдено за ${totalTime.toFixed(
    2
  )} мс. Знайдено ${machineIntersectionCount} перетинів між Машиною ${selectedMachine} та іншими машинами, а також ${lineIntersectionCount} перетинів з лініями.`;

  if (window.dotNetHelper) {
    window.dotNetHelper.invokeMethodAsync(
      "UpdateMessage",
      selectedMachine,
      message
    );
  }

  const intersectionsCanvas = document.getElementById("intersectionsCanvas");
  if (intersectionsCanvas) {
    const intersectionsCtx = intersectionsCanvas.getContext("2d");
    intersectionsCtx.clearRect(
      0,
      0,
      intersectionsCanvas.width,
      intersectionsCanvas.height
    );
  }

  if (machineIntersectionPoints.length > 0) {
    drawIntersectionPoints(machineIntersectionPoints, "purple");
  }

  if (lineIntersectionPoints.length > 0) {
    drawIntersectionPoints(lineIntersectionPoints, "green");
  }
};

window.drawMachines = (dotNetHelper, machine1Points, machine2Points) => {
  initialMachine1Points = machine1Points.map((point) => [
    parseFloat(point[0]),
    parseFloat(point[1]),
  ]);
  initialMachine2Points = machine2Points.map((point) => [
    parseFloat(point[0]),
    parseFloat(point[1]),
  ]);

  window.dotNetHelper = dotNetHelper;

  window.isMachine1Mirrored = false;

  drawAllMachines();
};

window.mirrorMachine1 = () => {
  const xValues = initialMachine1Points.map((p) => p[0]);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const xDifference = maxX - minX;

  initialMachine1Points = initialMachine1Points.map(([x, y]) => [
    -x + xDifference,
    y,
  ]);

  window.isMachine1Mirrored = true;

  drawAllMachines();
};
