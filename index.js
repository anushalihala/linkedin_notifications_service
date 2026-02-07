const {
  main: getLinkedinNotifications,
} = require("@anusha/linkedin-notifications");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

db.collection("users")
  .where("enabled", "==", true)
  .get()
  .then((snapshot) => {
    snapshot.forEach(async (doc) => {
      console.log("####################  USER: ", doc.id);
      const data = doc.data();
      if (!data.linkedin_job_url || !data.filter_config || !data.questions) {
        console.log(
          "####################  USER: ",
          doc.id,
          " has no linkedin_job_url, filter_config, or questions",
        );
        return;
      }
      await getLinkedinNotifications({
        runFounderAnalysis: false,
        jobUrl: data.linkedin_job_url,
        filterConfig: data.filter_config,
        questions: data.questions,
      });
    });
  });
