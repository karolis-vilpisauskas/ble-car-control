// UI elements.
const deviceNameLabel = document.getElementById("device-name");
const terminalContainer = document.getElementById("terminal");

// Helpers.
const defaultDeviceName = "Waiting for device...";
const terminalAutoScrollingLimit = 0;
let isTerminalAutoScrolling = true;

const scrollElement = (element) => {
  if (!element) return;
  const scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

const logToTerminal = (message, type = "") => {
  terminalContainer.insertAdjacentHTML(
    "beforeend",
    `<div${type && ` class="${type}"`}>${message}</div>`
  );

  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function (data) {
  logToTerminal(data, "in");
};

// Override default log method to output messages to the terminal and console.
terminal._log = function (...messages) {
  // We can't use `super._log()` here.
  messages.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {
  terminal
    .send(data)
    .then(() => logToTerminal(data, "out"))
    .catch((error) => logToTerminal(error));
};

// My UI elements
const turnSlider = document.getElementById("turnSlider");
const currentTurnAngle = document.getElementById("currentTurnAngle");
const speedButton = document.getElementById("speedButton");
const currentSpeed = document.getElementById("currentSpeed");
const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");
const forwardButton = document.getElementById("forwardButton");
const backwardsButton = document.getElementById("backwardsButton");
const stopButton = document.getElementById("stopButton");
const speedSlider = document.getElementById("speedSlider");

turnSlider.oninput = function () {
  const turnAngle = this.value;
  currentTurnAngle.innerHTML = turnAngle;
  setTimeout(() => send(`turn:${turnAngle}`), 35);
};

speedSlider.oninput = function () {
  const speed = this.value;
  currentSpeed.innerHTML = speed;
  setTimeout(() => send(`speed:${speed}`), 35);
};

connectButton.addEventListener("click", () => {
  terminal.connect().then(() => {
    deviceNameLabel.textContent = terminal.getDeviceName()
      ? terminal.getDeviceName()
      : defaultDeviceName;
  });
});

disconnectButton.addEventListener("click", () => {
  deviceNameLabel.textContent = defaultDeviceName;
  terminal.disconnect();
});

stopButton.addEventListener("click", () => {
  send("stop:0");
  turnSlider.value = 90;
  speedSlider.value = 0;
  currentTurnAngle.innerHTML = 90;
  currentSpeed.innerHTML = 0;
});

const holdit = (btn, action, start, speedup) => {
  var t;

  const repeat = () => {
    action();
    t = setTimeout(repeat, start);
    start = start / speedup;
  };

  btn.addEventListener("mousedown", () => repeat());
  btn.addEventListener("mouseup", () => clearTimeout(t));
};

holdit(
  forwardButton,
  () => {
    send("forward:0");
  },
  35,
  1
);

holdit(
  backwardsButton,
  () => {
    send("backwards:0");
  },
  35,
  1
);
