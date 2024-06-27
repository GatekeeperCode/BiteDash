const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
const biteCleaner = require('./biteCleaner');

exports.biteCleanUp = biteCleaner.biteCleanUp(firestore);