window.machine1XTranslate = 0;
window.machine1YTranslate = 0;
window.machine2XTranslate = 0;
window.machine2YTranslate = 0;

let initialMachine1Points = null;
let initialMachine2Points = null;

let machine1RotationAngle = 0;
let machine2RotationAngle = 0;

window.drawMachines = (machine1Points, machine2Points) => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const spaceBetween = 500;
  const marginX = (canvasWidth - spaceBetween) / 4 - 50;
  const yShift = -100;

  if (!initialMachine1Points) {
    initialMachine1Points = machine1Points.map((point) => [...point]);
  }
  if (!initialMachine2Points) {
    initialMachine2Points = machine2Points.map((point) => [...point]);
  }

  function drawMachine(
    points,
    color,
    offsetX,
    xTranslate = 0,
    yTranslate = 0,
    rotationAngle = 0
  ) {
    ctx.fillStyle = color;
    ctx.save();

    const centerX = offsetX + xTranslate;
    const centerY =
      canvasHeight -
      points[0][1] +
      yTranslate +
      (canvasHeight / 2 - 200 + yShift);

    ctx.translate(centerX, centerY);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    points.forEach((point) => {
      ctx.beginPath();
      const invertedY = canvasHeight - parseFloat(point[1]);
      const centeredY = invertedY + (centerY - 200) + yTranslate + yShift;
      ctx.arc(
        parseFloat(point[0]) + offsetX + xTranslate,
        centeredY,
        2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    ctx.restore();
  }

  function drawAllMachines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMachine(
      machine1Points,
      "red",
      marginX,
      window.machine1XTranslate,
      window.machine1YTranslate,
      machine1RotationAngle
    );
    drawMachine(
      machine2Points,
      "blue",
      canvasWidth - marginX - spaceBetween,
      window.machine2XTranslate,
      window.machine2YTranslate,
      machine2RotationAngle
    );
  }

  window.moveMachine = (machineId, xTranslate, yTranslate) => {
    if (machineId === 1) {
      window.machine1XTranslate += xTranslate;
      window.machine1YTranslate -= yTranslate;
    } else if (machineId === 2) {
      window.machine2XTranslate += xTranslate;
      window.machine2YTranslate -= yTranslate;
    }

    drawAllMachines();
  };

  window.rotateMachine1 = (rotationAngle) => {
    machine1RotationAngle = rotationAngle;
    drawAllMachines();
  };

  window.rotateMachine2 = (rotationAngle) => {
    machine2RotationAngle = rotationAngle;
    drawAllMachines();
  };

  window.clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAllMachines();
  };

  window.drawLine = (startX, startY, endX, endY) => {
    ctx.beginPath();
    ctx.moveTo(startX, canvasHeight - startY);
    ctx.lineTo(endX, canvasHeight - endY);
    ctx.stroke();
  };

  drawAllMachines();
};
