const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

const sendEmail = require('./sendEmail');

exports.SignUpAndFriends = sendEmail.SignUpAndFriends(firestore);
exports.Bites = sendEmail.Bites(firestore);