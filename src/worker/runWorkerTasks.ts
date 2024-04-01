import getNewReleases from "./getNewReleases";

async function runWorkerTasks() {
  console.log("Running worker tasks");
  await getNewReleases();
  console.log("Worker tasks complete");
}

runWorkerTasks();
