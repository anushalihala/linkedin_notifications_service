const {
  main: getLinkedinNotifications,
} = require("@anusha/linkedin-notifications");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

db.collection("users")
  .where("enabled", "==", true)
  .get()
  .then((snapshot) => {
    const notificationPromises = [];

    snapshot.forEach((doc) => {
      console.log("####################  USER: ", doc.id);
      const data = doc.data();

      if (
        !data.linkedin_job_url ||
        !data.filter_config ||
        !data.questions ||
        !data.notification_email
      ) {
        console.log(
          "####################  USER: ",
          doc.id,
          " has no linkedin_job_url, filter_config, or questions",
        );
        return;
      }

      notificationPromises.push(
        getLinkedinNotifications({
          runFounderAnalysis: false,
          jobUrl: data.linkedin_job_url,
          filterConfig: data.filter_config,
          questions: data.questions,
          userEmail: data.notification_email,
          userId: doc.id,
        }),
      );
    });

    return Promise.all(notificationPromises);
  })
  .catch((err) => {
    console.error("Error running linkedin notifications:", err);
    process.exitCode = 1;
  });
