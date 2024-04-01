import getNewReleases from "./getNewReleases";
import triggerRevalidateStaticPages from "./triggerRevalidateStaticPages";

async function runWorkerTasks() {
  console.log("Running worker tasks");
  await getNewReleases();
  await triggerRevalidateStaticPages();
  console.log("Worker tasks complete");
}

await runWorkerTasks();
process.exit(0);
