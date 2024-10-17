window.machine1XTranslate = 0;
window.machine1YTranslate = 0;
window.machine2XTranslate = 0;
window.machine2YTranslate = 0;

let machine1RotationAngle = 0;
let machine2RotationAngle = 0;

let initialMachine1Points = [];
let initialMachine2Points = [];

window.drawMachines = (dotNetHelper, machine1Points, machine2Points) => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const canvasHeight = canvas.height;
  const canvasWidth = canvas.width;
  const yShift = -100;

  window.dotNetHelper = dotNetHelper;

  initialMachine1Points = machine1Points.map((point) => [
    parseFloat(point[0]),
    parseFloat(point[1]),
  ]);
  initialMachine2Points = machine2Points.map((point) => [
    parseFloat(point[0]),
    parseFloat(point[1]),
  ]);

  function getTransformedPoints(points, xTranslate, yTranslate, rotationAngle) {
    const transformedPoints = [];
    const angleRad = (rotationAngle * Math.PI) / 180;

    let sumX = 0;
    let sumY = 0;
    points.forEach((point) => {
      sumX += point[0];
      sumY += point[1];
    });
    const centerX = sumX / points.length;
    const centerY = canvasHeight - sumY / points.length;

    points.forEach((point) => {
      const x = point[0];
      const y = canvasHeight - point[1];

      const dx = x - centerX;
      const dy = y - centerY;

      const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
      const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

      const finalX = rotatedX + centerX + xTranslate;
      const finalY = rotatedY + centerY - yTranslate;

      transformedPoints.push([finalX, finalY]);
    });

    return transformedPoints;
  }

  function drawMachine(transformedPoints, color) {
    ctx.fillStyle = color;
    transformedPoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  function drawAllMachines() {
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
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawAllMachines();
  };

  window.drawLine = (startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(startX, canvasHeight - startY);
    ctx.lineTo(endX, canvasHeight - endY);
    ctx.stroke();

    window.currentLine = {
      startX,
      startY,
      endX,
      endY,
    };
  };

  window.findIntersectionsBetweenMachines = (selectedMachine) => {
    const startTime = performance.now();

    const machinePoints =
      selectedMachine === 1
        ? window.transformedMachine1Points
        : window.transformedMachine2Points;
    const otherMachinePoints =
      selectedMachine === 1
        ? window.transformedMachine2Points
        : window.transformedMachine1Points;

    const matchingPairsCount = findMatchingPairsWithAllComparisons(
      machinePoints,
      otherMachinePoints
    );

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    const message = `Перетини знайдено за ${totalTime.toFixed(
      2
    )} мс. Знайдено ${matchingPairsCount} перетинів між Машиною ${selectedMachine} та іншою машиною.`;

    window.dotNetHelper.invokeMethodAsync(
      "UpdateMessage",
      selectedMachine,
      message
    );
  };

  window.findIntersectionsWithLine = (selectedMachine) => {
    if (!window.currentLine) {
      const message = "Будь ласка, намалюйте лінію перед пошуком перетинів.";
      window.dotNetHelper.invokeMethodAsync(
        "UpdateMessage",
        selectedMachine,
        message
      );
      return;
    }

    const startTime = performance.now();

    const machinePoints =
      selectedMachine === 1
        ? window.transformedMachine1Points
        : window.transformedMachine2Points;

    const linePoints = getLinePoints(
      window.currentLine.startX,
      window.currentLine.startY,
      window.currentLine.endX,
      window.currentLine.endY
    );

    const matchingPairsCount = findMatchingPairsWithAllComparisons(
      machinePoints,
      linePoints
    );

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    const message = `Перетини з лінією знайдено за ${totalTime.toFixed(
      2
    )} мс. Знайдено ${matchingPairsCount} перетинів між Машиною ${selectedMachine} та лінією.`;

    window.dotNetHelper.invokeMethodAsync(
      "UpdateMessage",
      selectedMachine,
      message
    );
  };

  function getLinePoints(x1, y1, x2, y2) {
    const points = [];
    const canvasHeight = canvas.height;

    y1 = canvasHeight - y1;
    y2 = canvasHeight - y2;

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

  function findMatchingPairsWithAllComparisons(array1, array2) {
    let count = 0;
    const tolerance = 0.5;

    array1.forEach((pair1) => {
      array2.forEach((pair2) => {
        if (
          Math.abs(pair1[0] - pair2[0]) <= tolerance &&
          Math.abs(pair1[1] - pair2[1]) <= tolerance
        ) {
          count++;
        }
      });
    });

    return count;
  }

  drawAllMachines();
};
