const functions = require('firebase-functions');
const { createTransport } = require('nodemailer');
const twilio = require('twilio');

const twilioAccountSid = functions.config().twilio.account_sid;
const twilioAuthToken = functions.config().twilio.auth_token;
const twilioPhoneNumber = functions.config().twilio.phone_number;
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
module.exports.SignUpAndFriends = (firestore) => {
    const {
        outlook: { password, sender },
    } = functions.config();

    const transporter = createTransport({
        service: 'outlook',
        auth: {
            user: sender,
            pass: password,
        },
    });


    async function sendSMS(phoneNumber, message) {
        await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: (String(phoneNumber))
        });
    }
    async function findUsersEmail(userEmail) {
        let userName = '';
        await firestore.collection('users')
            .where('email', '==', userEmail)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    userName = doc.data().name;
                });
            })
            .catch(error => {
                console.log('Error getting documents: ', error);
            });
        return userName;
    }

    const transport = (error, { messageId }) =>
        error ? console.log(error) : console.log(messageId);

    return functions.firestore
        .document('users/{userId}')
        .onUpdate(async (change, context) => {
            //Settings SignUp
            const prePrefNotification = change.before.data()['prefNotification'];
            const prefNotification = change.after.data()['prefNotification'];


            if (prePrefNotification != prefNotification) {
                let userSnapshot, res, emailContent,
                    mailOptionsWithRecipient, userEmail,
                    userPhoneNumber, smsMessage;
                switch (prefNotification) {
                    case "emailNotif":
                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        userEmail = userSnapshot.data().email;

                        res = nameFormater(userSnapshot.data().name);
                        tempPrefNotif = "email";
                        emailContent = signUpEmail(res, userEmail, tempPrefNotif, sender);
                        mailOptionsWithRecipient = sendMailWithContent(emailContent);

                        transporter.sendMail(mailOptionsWithRecipient, transport);
                        console.log(`Send email for user ${context.params.userId}`);

                        break;
                    case "bothNotif":
                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        userEmail = userSnapshot.data().email;

                        res = nameFormater(userSnapshot.data().name);
                        tempPrefNotif = "sms and email";
                        emailContent = signUpEmail(res, userEmail, tempPrefNotif, sender);
                        mailOptionsWithRecipient = sendMailWithContent(emailContent);
                        transporter.sendMail(mailOptionsWithRecipient, transport);
                        userPhoneNumber = userSnapshot.data().phoneNumber;
                        smsMessage = `Hello ${res}, you have chosen to be notified for "bites" and friend requests by both sms and email.`;


                        sendSMS(userPhoneNumber, smsMessage);

                        break;
                    case "phoneNotif":

                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        res = nameFormater(userSnapshot.data().name);
                        userPhoneNumber = userSnapshot.data().phoneNumber;
                        smsMessage = `Hello ${res}, you have chosen to be notified for "bites" and friend requests by sms.`;

                        sendSMS(userPhoneNumber, smsMessage);
                        break;

                    default:
                        break;

                }

            }

            //Friends Requests 
            const preIncomingRequests = change.before.data()['incomingRequests'] || [];
            const incomingRequests = change.after.data()['incomingRequests'] || [];

            const addedRequest = incomingRequests.find(request => !preIncomingRequests.includes(request));
            const userSnapshot = await firestore.collection('users').doc(context.params.userId).get();

            const prefNotificationStatus = userSnapshot.data().prefNotification;
            //change when phone number works 
            if (addedRequest) {
                let userSnapshot, res, emailContent,
                    mailOptionsWithRecipient, userEmail,
                    userPhoneNumber, smsMessage, foundName;
                switch (prefNotificationStatus) {
                    case "emailNotif":
                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        userEmail = userSnapshot.data().email;

                        res = nameFormater(userSnapshot.data().name);
                        foundName = nameFormater(await findUsersEmail(addedRequest));
                        emailContent = friendRequestEmail(emailContent, foundName, userEmail, res, sender);
                        mailOptionsWithRecipient = sendMailWithContent(emailContent);
                        transporter.sendMail(mailOptionsWithRecipient, transport);

                        break;
                    case "bothNotif":
                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        userEmail = userSnapshot.data().email;

                        res = nameFormater(userSnapshot.data().name);
                        foundName = nameFormater(await findUsersEmail(addedRequest));
                        emailContent = friendRequestEmail(emailContent, foundName, userEmail, res, sender);
                        mailOptionsWithRecipient = sendMailWithContent(emailContent);
                        transporter.sendMail(mailOptionsWithRecipient, transport);
                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        userPhoneNumber = userSnapshot.data().phoneNumber;
                        smsMessage = `Hello ${res}, you have a friend request from ${foundName}!`;
                        sendSMS(userPhoneNumber, smsMessage);
                        break;
                    case "phoneNotif":
                        userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                        foundName = nameFormater(await findUsersEmail(addedRequest));
                        res = nameFormater(userSnapshot.data().name);
                        userPhoneNumber = userSnapshot.data().phoneNumber;
                        smsMessage = `Hello${res}, you have a friend request from ${foundName}!`;
                        sendSMS(userPhoneNumber, smsMessage);
                        break;
                    default:
                        break;
                }
            }

        });
};

//Bites Requests (new collection so new trigger)


module.exports.Bites = (firestore) => {
    const {
        outlook: { password, sender },
    } = functions.config();

    const transporter = createTransport({
        service: 'outlook',
        auth: {
            user: sender,
            pass: password,
        },
    });

    async function findUsersEmail(userName) {
        let userEmail = '';
        await firestore.collection('users')
            .where('name', '==', userName)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    userEmail = doc.data().email;
                });
            })
            .catch(error => {
                console.log('Error getting documents: ', error);
            });
        return userEmail;
    }


    const transport = (error, { messageId }) =>
        error ? console.log(error) : console.log(messageId);

    async function findUserIdByName(userName) {
        let userId = '';
        await firestore.collection('users')
            .where('name', '==', userName)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    userId = doc.id; // Get the document ID, which is the user ID
                });
            })
            .catch(error => {
                console.log('Error getting documents: ', error);
            });
        return userId;
    }


    return functions.firestore
        .document('bite/{biteId}')
        .onCreate(async (snap, context) => {
            const biteData = snap.data();

            const owner = biteData.owner;
            const invited = biteData.invited;


            for (const userName of invited) {
                const userId = await findUserIdByName(userName);

                if (userId) {
                    let userSnapshot = await firestore.collection('users').doc(userId).get();
                    if (!userSnapshot.exists) {
                        console.log(`No document found for user: ${userName}`);
                        continue;
                    }
                    const prefNotificationStatus = userSnapshot.data().prefNotification;

                    let res, emailContent,
                        mailOptionsWithRecipient, userEmail,
                        userPhoneNumber, smsMessage, foundName;
                    switch (prefNotificationStatus) {
                        case "emailNotif":
                            userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                            userEmail = userSnapshot.data().email;

                            res = nameFormater(userSnapshot.data().name);
                            foundName = nameFormater(await findUsersEmail(addedRequest));
                            emailContent = emailBiteContent(userEmail, userName, owner, sender);
                            mailOptionsWithRecipient = sendMailWithContent(emailContent);
                            transporter.sendMail(mailOptionsWithRecipient, transport);

                            break;
                        case "bothNotif":
                            userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                            userEmail = userSnapshot.data().email;

                            res = nameFormater(userSnapshot.data().name);
                            foundName = nameFormater(await findUsersEmail(addedRequest));
                            emailContent = emailBiteContent(userEmail, userName, owner, sender);
                            mailOptionsWithRecipient = sendMailWithContent(emailContent);
                            transporter.sendMail(mailOptionsWithRecipient, transport);
                            userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                            userPhoneNumber = userSnapshot.data().phoneNumber;
                            smsMessage = `Hello${res}, you have a bite request from ${foundName}!`;
                            sendSMS(userPhoneNumber, smsMessage);
                            break;
                        case "phoneNotif":
                            userSnapshot = await firestore.collection('users').doc(context.params.userId).get();
                            foundName = nameFormater(await findUsersEmail(addedRequest));
                            res = nameFormater(userSnapshot.data().name);
                            userPhoneNumber = userSnapshot.data().phoneNumber;
                            smsMessage = `Hello${res}, you have a bite request from ${foundName}!`;
                            sendSMS(userPhoneNumber, smsMessage);
                            break;
                        default:
                            break;
                    }

                }
            }

        });
};
function emailBiteContent(userEmail, userName, owner, sender) {
    return {
        subject: `BiteDash: New Bite Invitation`,
        recipient: userEmail,
        html: `
        <h2>BiteDash Notfication System</h2>
        <h3>Hello ${userName}</h3>
        <p>${owner} has invited you to a new bite! 
        To accept or reject got to <a href = https://bitedash.gcc.edu/friends/join-a-bite> BiteDash!</a></p>
        <br/>
        <p>DO NOT REPLY TO THIS EMAIL</p>`,
        sender: sender
    };
}

function friendRequestEmail(emailContent, foundName, userEmail, res, sender) {
    emailContent = {
        subject: `BiteDash: Friend Request from${foundName}`,
        recipient: userEmail,
        html: `
        <h2>BiteDash Notfication System</h2>
        <h3>Hello ${res}</h3>
        <p>You have a friend request from ${foundName}! 
        To accept or reject go to <a href = https://bitedash.gcc.edu/friends/search-friends> BiteDash!</a></p>
        <br/>
        <p>DO NOT REPLY TO THIS EMAIL</p>`,
        sender: sender
    };
    return emailContent;
}

function signUpEmail(res, userEmail, prefNotification, sender) {
    return {
        subject: 'BiteDash Email Notification',
        name: res,
        recipient: userEmail,
        html: `
        <h2>BiteDash Notfication System</h2>
        <h3>Hello ${res}</h3>
        <p>You have chosen to be notified for "bites" and friend requests by ${String(prefNotification)}</p>
        <br/>
        <p>DO NOT REPLY TO THIS EMAIL</p>`,
        sender: sender
    };
}

function sendMailWithContent({ subject, recipient, text, html, sender }) {
    return {
        from: sender,
        to: recipient,
        subject,
        text,
        html,
    };
}

function nameFormater(s) {
    let [s1, s2] = s.split(',');
    return ([s2, s1].join(' '));
}

