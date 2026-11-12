// Grow Your Knowledge keeps its state in the browser, so it remains after refreshes.
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const completedCount = document.querySelector("#completed-count");
const progressNumber = document.querySelector("#progress-number");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const progressCaption = document.querySelector("#progress-caption");
const progressMessage = document.querySelector("#progress-message");
const taskFeedback = document.querySelector("#task-feedback");
const gardenScene = document.querySelector("#garden-scene");
const growthStage = document.querySelector("#growth-stage");
const waterCount = document.querySelector("#water-count");
const waterPlantButton = document.querySelector("#water-plant-button");
const resetGardenButton = document.querySelector("#reset-garden-button");
const gardenStatus = document.querySelector("#garden-status");
const plant = document.querySelector(".plant");
const waterDropAnimation = document.querySelector("#water-drop-animation");
const stageTooltip = document.querySelector("#stage-tooltip");
const plantProgressTrack = document.querySelector("#plant-progress-track");
const plantProgressFill = document.querySelector("#plant-progress-fill");
const plantProgressCaption = document.querySelector("#plant-progress-caption");
const celebration = document.querySelector("#celebration");

const storageKey = "growYourKnowledgeState";
const stages = ["Seed", "Sprout", "Small Plant", "Growing Plant", "Blooming Flower"];
const stageClasses = ["stage-seed", "stage-sprout", "stage-small-plant", "stage-growing-plant", "stage-blooming-flower"];

// These starter tasks appear only when the browser has no saved data yet.
const starterTasks = [
  { id: "task-1", text: "Review JavaScript variables", tag: "20 min", completed: false, rewardEarned: false },
  { id: "task-2", text: "Finish programming lab exercise", tag: "45 min", completed: false, rewardEarned: false },
  { id: "task-3", text: "Read chapter notes", tag: "15 min", completed: false, rewardEarned: false }
];

let tasks = starterTasks.map((task) => ({ ...task }));
let availableWaterDrops = 0;
let totalWaterings = 0;
let currentStage = 0;
let celebrationShown = false;

// Save the complete task and garden state after each meaningful change.
function saveState() {
  const savedState = { tasks, availableWaterDrops, totalWaterings, currentStage, celebrationShown };
  localStorage.setItem(storageKey, JSON.stringify(savedState));
}

// Load saved data safely. If it is missing or damaged, use the starter state.
function loadState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(storageKey));

    if (savedState && Array.isArray(savedState.tasks)) {
      tasks = savedState.tasks;
      availableWaterDrops = Math.max(0, Number(savedState.availableWaterDrops) || 0);
      totalWaterings = Math.min(8, Math.max(0, Number(savedState.totalWaterings) || 0));
      currentStage = Math.min(stages.length - 1, Math.max(0, Number(savedState.currentStage) || 0));
      celebrationShown = savedState.celebrationShown === true;
    }
  } catch (error) {
    console.warn("Saved garden data could not be loaded. Starting fresh.");
  }
}

// Draw every task from the saved tasks array.
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const taskItem = document.createElement("li");
    const checkbox = document.createElement("input");
    const label = document.createElement("label");
    const deleteButton = document.createElement("button");

    taskItem.className = "task-item";
    checkbox.type = "checkbox";
    checkbox.id = task.id;
    checkbox.checked = task.completed;
    checkbox.dataset.taskId = task.id;
    label.htmlFor = task.id;
    label.textContent = task.text;
    deleteButton.type = "button";
    deleteButton.className = "delete-task-button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.taskId = task.id;
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    taskItem.append(checkbox, label);

    if (task.tag) {
      const tag = document.createElement("span");
      tag.className = "task-tag";
      tag.textContent = task.tag;
      taskItem.append(tag);
    }

    taskItem.append(deleteButton);
    taskList.append(taskItem);
  });
}

function updateTaskProgress() {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const taskWord = completedTasks === 1 ? "task" : "tasks";
  const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  completedCount.textContent = `${completedTasks} ${taskWord} completed`;
  progressNumber.innerHTML = `${percentComplete}<span>%</span>`;
  progressFill.style.width = `${percentComplete}%`;
  progressTrack.setAttribute("aria-valuenow", percentComplete);
  progressCaption.textContent = `${completedTasks} of ${totalTasks} tasks completed`;

  if (totalTasks === 0) {
    progressMessage.textContent = "Add a learning task whenever you are ready.";
  } else if (completedTasks === 0) {
    progressMessage.textContent = "Complete a task to begin growing your garden.";
  } else if (completedTasks === totalTasks) {
    progressMessage.textContent = "Wonderful work! You completed every task today.";
  } else {
    progressMessage.textContent = "Nice work! Keep learning one small step at a time.";
  }
}

// The celebration needs BOTH goals: a non-empty, fully completed task list and a blooming plant.
function checkForCelebration() {
  const allTasksComplete = tasks.length > 0 && tasks.every((task) => task.completed);
  const plantIsBlooming = currentStage === stages.length - 1;
  const goalsReached = allTasksComplete && plantIsBlooming;

  if (!goalsReached) {
    celebration.classList.remove("is-visible", "is-animated");
    celebration.setAttribute("aria-hidden", "true");
    return;
  }

  celebration.classList.add("is-visible");
  celebration.setAttribute("aria-hidden", "false");

  if (!celebrationShown) {
    celebrationShown = true;
    celebration.classList.remove("is-animated");
    void celebration.offsetWidth; // Restart the animation only for the first celebration.
    celebration.classList.add("is-animated");
    taskFeedback.textContent = "Amazing work! You completed your tasks and grew a blooming flower.";
  }
}

// A task earns its water-drop reward just once, even if it is checked again.
function awardWaterDrop(task) {
  if (task.completed && !task.rewardEarned) {
    availableWaterDrops += 1;
    task.rewardEarned = true;
    taskFeedback.textContent = "Wonderful! You earned a water drop for your plant. 💧";
  }
}

function advanceGrowthStage() {
  if (totalWaterings % 2 === 0 && currentStage < stages.length - 1) {
    currentStage += 1;
  }
}

function waterPlant() {
  if (availableWaterDrops === 0) {
    gardenStatus.textContent = "Complete a task first to earn a water drop.";
    return;
  }

  if (currentStage === stages.length - 1) {
    gardenStatus.textContent = "Your plant is already blooming!";
    return;
  }

  availableWaterDrops -= 1;
  totalWaterings += 1;
  const stageBeforeWatering = currentStage;
  advanceGrowthStage();
  updateGardenDisplay();
  playWaterDropAnimation();

  if (currentStage > stageBeforeWatering) {
    playGrowthAnimation();
  }

  checkForCelebration();
  saveState();
}

function playWaterDropAnimation() {
  waterDropAnimation.classList.remove("is-watering");
  void waterDropAnimation.offsetWidth;
  waterDropAnimation.classList.add("is-watering");
}

function playGrowthAnimation() {
  plant.classList.remove("is-growing");
  void plant.offsetWidth;
  plant.classList.add("is-growing");
}

function updateGardenDisplay() {
  const isBlooming = currentStage === stages.length - 1;
  const dropWord = availableWaterDrops === 1 ? "water drop" : "water drops";
  const growthPercent = Math.round((totalWaterings / 8) * 100);

  growthStage.textContent = stages[currentStage];
  waterCount.textContent = `💧 ${availableWaterDrops} ${dropWord} available`;
  gardenScene.className = `garden-scene ${stageClasses[currentStage]}`;
  gardenScene.setAttribute("aria-label", `${stages[currentStage]} in a warm brown pot`);
  stageTooltip.textContent = `Current stage: ${stages[currentStage]}`;
  waterPlantButton.disabled = availableWaterDrops === 0 || isBlooming;
  plantProgressFill.style.width = `${growthPercent}%`;
  plantProgressTrack.setAttribute("aria-valuenow", totalWaterings);
  plantProgressCaption.textContent = `${totalWaterings} of 8 waterings toward Blooming Flower`;

  if (isBlooming) {
    gardenStatus.textContent = "Your plant is blooming! It has reached the final stage.";
  } else {
    const wateringsUntilGrowth = 2 - (totalWaterings % 2);
    gardenStatus.textContent = `${wateringsUntilGrowth} more watering${wateringsUntilGrowth === 1 ? "" : "s"} until the next stage.`;
  }
}

function addTask(taskText) {
  const cleanText = taskText.trim();

  if (cleanText === "") {
    taskFeedback.textContent = "Please type a learning task before adding it.";
    return;
  }

  tasks.push({
    id: `task-${Date.now()}`,
    text: cleanText,
    tag: "",
    completed: false,
    rewardEarned: false
  });
  taskFeedback.textContent = "Your new learning task has been added.";
  renderTasks();
  updateTaskProgress();
  checkForCelebration();
  saveState();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  taskFeedback.textContent = "Task deleted. Any water drop it already earned stays in your garden.";
  renderTasks();
  updateTaskProgress();
  checkForCelebration();
  saveState();
}

// Reset only the garden resources. Learning tasks stay saved and untouched.
function resetGarden() {
  const shouldReset = window.confirm("Reset the garden to Seed and remove all water drops? Your learning tasks will stay.");

  if (shouldReset) {
    availableWaterDrops = 0;
    totalWaterings = 0;
    currentStage = 0;
    celebrationShown = false;
    taskFeedback.textContent = "Your garden was reset. Your learning tasks are still here.";
    updateGardenDisplay();
    checkForCelebration();
    saveState();
  }
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

taskList.addEventListener("change", (event) => {
  if (event.target.matches('input[type="checkbox"]')) {
    const task = tasks.find((item) => item.id === event.target.dataset.taskId);

    if (task) {
      task.completed = event.target.checked;
      awardWaterDrop(task);
      updateTaskProgress();
      updateGardenDisplay();
      checkForCelebration();
      saveState();
    }
  }
});

taskList.addEventListener("click", (event) => {
  if (event.target.matches(".delete-task-button")) {
    deleteTask(event.target.dataset.taskId);
  }
});

waterPlantButton.addEventListener("click", waterPlant);
resetGardenButton.addEventListener("click", resetGarden);
waterDropAnimation.addEventListener("animationend", () => waterDropAnimation.classList.remove("is-watering"));
plant.addEventListener("animationend", () => plant.classList.remove("is-growing"));

// Start the page by restoring the saved state and drawing it on screen.
loadState();
renderTasks();
updateTaskProgress();
updateGardenDisplay();
checkForCelebration();
