// Get the parts of the page that the user will interact with.
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const completedCount = document.querySelector("#completed-count");
const progressNumber = document.querySelector("#progress-number");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const progressCaption = document.querySelector("#progress-caption");
const progressMessage = document.querySelector("#progress-message");
const gardenScene = document.querySelector("#garden-scene");
const growthStage = document.querySelector("#growth-stage");
const waterCount = document.querySelector("#water-count");
const waterPlantButton = document.querySelector("#water-plant-button");
const gardenStatus = document.querySelector("#garden-status");

let nextTaskNumber = 4;
let availableWaterDrops = 0;
let totalWaterings = 0;
let currentStage = 0;

const stages = ["Seed", "Sprout", "Small Plant", "Growing Plant", "Blooming Flower"];
const stageClasses = ["stage-seed", "stage-sprout", "stage-small-plant", "stage-growing-plant", "stage-blooming-flower"];

// This function counts checked boxes and refreshes both progress displays.
function updateTaskProgress() {
  const completedTasks = taskList.querySelectorAll("input:checked").length;
  const totalTasks = taskList.querySelectorAll(".task-item").length;
  const taskWord = completedTasks === 1 ? "task" : "tasks";
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  completedCount.textContent = `${completedTasks} ${taskWord} completed`;
  progressNumber.innerHTML = `${percentComplete}<span>%</span>`;
  progressFill.style.width = `${percentComplete}%`;
  progressTrack.setAttribute("aria-valuenow", percentComplete);
  progressCaption.textContent = `${completedTasks} of ${totalTasks} tasks completed`;

  if (completedTasks === 0) {
    progressMessage.textContent = "Complete a task to begin growing your garden.";
  } else if (completedTasks === totalTasks) {
    progressMessage.textContent = "Wonderful work! You completed every task today.";
  } else {
    progressMessage.textContent = "Nice work! Keep learning one small step at a time.";
  }
}

// Add one water drop when a task is completed for the first time.
function awardWaterDrop(checkbox) {
  if (checkbox.checked && checkbox.dataset.rewardEarned !== "true") {
    availableWaterDrops += 1;
    checkbox.dataset.rewardEarned = "true";
    updateGardenDisplay();
  }
}

// Move to the next stage after every second watering, unless the plant is finished.
function advanceGrowthStage() {
  if (totalWaterings % 2 === 0 && currentStage < stages.length - 1) {
    currentStage += 1;
  }
}

// Use one water drop, count the watering, and then check for growth.
function waterPlant() {
  if (availableWaterDrops === 0 || currentStage === stages.length - 1) {
    return;
  }

  availableWaterDrops -= 1;
  totalWaterings += 1;
  advanceGrowthStage();
  updateGardenDisplay();
}

// Refresh all garden text, button state, and the plant illustration class.
function updateGardenDisplay() {
  const isBlooming = currentStage === stages.length - 1;
  const dropWord = availableWaterDrops === 1 ? "water drop" : "water drops";

  growthStage.textContent = stages[currentStage];
  waterCount.textContent = `💧 ${availableWaterDrops} ${dropWord} available`;
  gardenScene.className = `garden-scene ${stageClasses[currentStage]}`;
  gardenScene.setAttribute("aria-label", `${stages[currentStage]} in a warm brown pot`);
  waterPlantButton.disabled = availableWaterDrops === 0 || isBlooming;

  if (isBlooming) {
    gardenStatus.textContent = "Your plant is blooming! It has reached the final stage.";
  } else {
    const wateringsUntilGrowth = 2 - (totalWaterings % 2);
    gardenStatus.textContent = `${wateringsUntilGrowth} more watering${wateringsUntilGrowth === 1 ? "" : "s"} until the next stage.`;
  }
}

// This function creates one new task item from the user's text.
function addTask(taskText) {
  const taskItem = document.createElement("li");
  const checkbox = document.createElement("input");
  const label = document.createElement("label");
  const deleteButton = document.createElement("button");

  checkbox.type = "checkbox";
  checkbox.id = `task-${nextTaskNumber}`;
  label.htmlFor = checkbox.id;
  label.textContent = taskText;
  deleteButton.type = "button";
  deleteButton.className = "delete-task-button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${taskText}`);
  taskItem.className = "task-item";

  taskItem.append(checkbox, label, deleteButton);
  taskList.append(taskItem);
  nextTaskNumber += 1;
  updateTaskProgress();
}

// When the form is submitted, use the typed text to make a new task.
taskForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Keeps the page from refreshing.
  const newTaskText = taskInput.value.trim();

  if (newTaskText !== "") {
    addTask(newTaskText);
    taskInput.value = ""; // Clear the field for the next task.
    taskInput.focus();
  }
});

// One listener handles checkbox changes and delete-button clicks in the list.
taskList.addEventListener("change", function (event) {
  if (event.target.matches('input[type="checkbox"]')) {
    awardWaterDrop(event.target);
    updateTaskProgress();
  }
});

taskList.addEventListener("click", function (event) {
  if (event.target.matches(".delete-task-button")) {
    event.target.closest(".task-item").remove();
    updateTaskProgress();
  }
});

waterPlantButton.addEventListener("click", waterPlant);

// Show the correct task and garden information when the page first loads.
updateTaskProgress();
updateGardenDisplay();
