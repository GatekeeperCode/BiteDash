const functions = require('firebase-functions');

module.exports.biteCleanUp = (firestore) => {
    return functions.pubsub.schedule('every 8 hours').onRun(async (context) => {
        const currentDate = new Date();
        const bitesRef = firestore.collection("bite");
        const biteSnapshot = await bitesRef.get();
        biteSnapshot.forEach(doc => {
            let endTimeFound = doc.data().end_time;
            console.log(endTimeFound);
            if (endTimeFound.toDate() < currentDate) {
                console.log(endTimeFound);
                doc.ref.delete().then(() => {
                    console.log("Document successfully deleted!");
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });            }
        });
    });
};
