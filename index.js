const {
  main: getLinkedinNotifications,
} = require("@anusha/linkedin-notifications");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

const SEQUENTIAL = false;

async function run() {
  try {
    const snapshot = await db
      .collection("users")
      .where("enabled", "==", true)
      .get();

    console.log(snapshot.size, "enabled users")

    const jobs = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (
        !data.linkedin_job_url ||
        !data.filter_config ||
        !data.questions ||
        !data.notification_email
      ) {
        console.log(
          "#################### USER:",
          doc.id,
          "missing linkedin_job_url, filter_config, questions, or email"
        );
        return;
      }

      const job = () =>
        getLinkedinNotifications({
          runFounderAnalysis: false,
          jobUrl: data.linkedin_job_url,
          filterConfig: data.filter_config,
          questions: data.questions,
          userEmail: data.notification_email,
          userId: doc.id,
        });

      jobs[doc.id] = job;
    });

    console.log(`Processing ${jobs.length} users`);
    console.log(`Mode: ${SEQUENTIAL ? "SEQUENTIAL" : "PARALLEL"}`);

    if (SEQUENTIAL) {
      for (const [id, job] of Object.entries(jobs)) {
        console.log("#################### USER:", id);
        await job();
      }
    } else {
      await Promise.all(Object.entries(jobs).map((jobData) => {
        const [id, job] = jobData
        console.log("#################### USER:", id);
        job()
      }));
    }

    console.log("All users processed ✅");
  } catch (err) {
    console.error("Error running linkedin notifications:", err);
    process.exitCode = 1;
  }
}

run();
