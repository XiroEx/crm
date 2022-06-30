import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Twilio} from "twilio";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

const db = admin.firestore();

const SID = "AC688466c5775a5441bc7e9e15b774ccb5";
const ATOKEN = "6d80905c9144e65f95e25473755b923e";
const twilio = new (Twilio as any)(SID, ATOKEN);


export const buildInbox = functions.https.onCall(async (request, context)=>{
  const Conversations: ({ number: string; messages: any; })[] = [];
  let earliest: any;
  /**
     *
     * @param {any} date
     */
  async function go(date: any) {
    const messages: any =
      await getConversations(request.number, false, date, true);
    Object.keys(messages).forEach((number) => {
      messages[number].sort((a: any, b: any) => {
        return a.date - b.date;
      });
      if (Conversations.length == 0) {
        Conversations.push({
          number: number,
          messages: messages[number],
        });
      } else {
        let index: number | false = false;
        Conversations.forEach((c, i)=>{
          if (c.number == number) index = i;
        });
        if (index !== false) {
          Conversations[index].messages =
            Conversations[index].messages.concat(messages[number]);
        } else {
          Conversations.push({
            number: number,
            messages: messages[number],
          });
        }
      }
    });
    let newEarliest: any;
    Conversations.forEach((convo: any) =>{
      if (!newEarliest || newEarliest > convo.messages[0].date.getTime()) {
        newEarliest = convo.messages[0].date.getTime();
      }
    });
    if (newEarliest == earliest || newEarliest - 864000000 == earliest) {
      earliest = earliest - 864000000;
    } else earliest = newEarliest-1;
    if (Conversations.length < 20 && Object.keys(messages).length !== 0) {
      await go(earliest);
      return;
    } else {
      return;
    }
  }

  await go(false);
  Conversations.forEach((c, i) => {
    c.messages.forEach((m: any, j: any)=>{
      Conversations[i].messages[j].date = m.date.getTime();
    });
  });
  Conversations.sort((a: any, b: any) => (
    b.messages[b.messages.length - 1].date -
      a.messages[a.messages.length - 1].date
  ));
  return {success: true, data: Conversations};
});

export const buildConversation = functions.https
    .onCall(async (request, context)=>{
      const number = request.number;
      const contact = request.contact;
      const date = request.date || Date.now();
      let messages: any[] = [];
      let nomore = false;
      /**
      * @param {number} d date
       *
       */
      async function go(d: number) {
        let m = await getConversations(number, contact, d, nomore);
        if (!m[contact]) m[contact] = [];
        m = m[contact]
            .map((me: any)=>({...me, date: me.date.getTime()}));
        if (m[0]?.body == messages[0]?.body &&
            m[0]?.date == messages[0]?.date) {
          m.splice(0, 1);
        }
        messages = messages.concat(m);
        messages.sort((a: any, b: any) => {
          return a.date - b.date;
        });
        if (m.length == 0 && !nomore) {
          nomore = true;
          await go(messages[0].date-1);
        } else if (messages.length < 40 && !nomore) {
          await go(messages[0].date-1);
        }
      }
      await go(date-1);
      return (messages);
    });

export const send = functions.https.onCall( async (request, context) => {
  const data = {
    to: request.to,
    from: request.from,
    body: request.body,
  };
  if (!Array.isArray(data.to)) data.to = [data.to];
  data.to.forEach( (to: string) => {
    twilio.messages.create(
        {from: data.from, to: to, body: data.body}
    );
  });
  return {success: true};
});


export const addBilling = functions.https.onCall( async (request, context) => {
  const userEmail = request.email.toLowerCase();
  const billingEmail = request.billing.toLowerCase();
  const userId = context?.auth?.uid;
  const userRef = db.collection("users");
  const userSnapshot = await userRef.where("email", "==", billingEmail)
      .limit(1).get();
  if (userSnapshot.empty) {
    return {success: false, message: "User does not exist"};
  } else {
    const billUser = snapshotToArray(userSnapshot)[0];
    const billingRef = db.collection(`billing/${billUser.id}/accounts`);
    await billingRef.add({
      id: userId,
      active: false,
      email: userEmail,
    });
    const user = userRef.doc(userId as string);
    user.update({
      billing: billUser.id,
      billmail: billUser.email,
      active: false,
    });
    return {success: true, message: "Billing connected,"+
      " bill account must activate"};
  }
});

export const getNumbers = functions.https.onCall( async (request, context) => {
  const area = request.area || "516";
  const numbers = await twilio.availablePhoneNumbers("US")
      .local.list({areaCode: area, limit: 20});
  return JSON.parse(JSON.stringify(numbers));
});

export const buyNumber = functions.https.onCall( async (request, context) => {
  const user = context?.auth?.uid;
  const billing = request.billing;
  const number = await twilio.incomingPhoneNumbers.
      create({phoneNumber: request.number});
  functions.logger.log(number);
  await db.collection("users").doc(user as string).update({
    numbers: admin.firestore.FieldValue.arrayUnion(number.phoneNumber),
  });
  await db.collection("billing").doc(billing as string).update({
    numbers: admin.firestore.FieldValue.arrayUnion({
      number: number.phoneNumber, date: Date.now(),
    }),
  });
  functions.logger.log("BILL $2");
  return JSON.parse(JSON.stringify(number.phoneNumber));
});

export const userCreated = functions.auth.user().onCreate(async (user) => {
  await db.collection("users").doc(user.uid).set({
    email: user.email,
    numbers: [],
    drafts: [],
  });
});

export const incomingMessage = functions.https.onRequest(async (req, res) => {
  const usersRef = db.collection("users");
  const userSnapshot = await usersRef
      .where("numbers", "array-contains", req.body.To).get();
  userSnapshot.docs.forEach((doc)=>{
    doc.ref.update({lastMessage: {
      from: req.body.From,
      body: req.body.Body,
      sent: false,
      date: Date.now(),
    }});
  });
  res.end();
});

export const scheduledMessages = functions.pubsub.schedule("*/15 * * * *")
    .timeZone("America/New_York").onRun( async (context) => {
      const date = Date.now();
      const users = (await db.collection("users").get())
          .docs.map((doc) => ({...doc.data(), id: doc.id}));
      for (const user of users) {
        const scheduled = (await db.collection(`users/${user.id}/scheduled`)
            .get()).docs.map((doc) => ({...doc.data(), id: doc.id}));
        scheduled.forEach(async (text: any)=>{
          if (date >= text.date) {
            text.targets.forEach((to: string) => {
              twilio.messages.create(
                  {from: text.from, to: to, body: text.body}
              );
            });
            const ref = db.collection(`users/${user.id}/scheduled`)
                .doc(text.id);
            if (text.repeat) await ref.update({date: text.date + text.repeat});
            else await ref.update({sent: true});
          }
        });
      }
    });

/**
 *
 * @param {any} snapshot
 * @return {array} users
 */
function snapshotToArray(snapshot: any[] | FirebaseFirestore
  .QuerySnapshot<FirebaseFirestore.DocumentData>) {
  const returnArr: any[] = [];

  snapshot.forEach(function(childSnapshot: any) {
    returnArr.push({...childSnapshot.data(),
      id: childSnapshot.id});
  });

  return returnArr;
}

/**
   * Get messages
   * @param {any} query
   * @return {array} messages
   */
async function getMessages(query: any) {
  try {
    const messages = await twilio.messages.list(query);
    return messages;
  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * Get latest messages
 * @param {any} number phone number to query
 * @param {any} contact contact to query
 * @param {any} date before date
 * @param {any} last go for broke
 * @return {array} messages
 */
async function getConversations(number: string,
    contact: string | boolean, date: any, last: boolean) {
  date = date || Date.now();
  const toQuery: any = {to: number,
    dateSentBefore: new Date(date), dateSentAfter: new Date(date - 864000000)};
  const fromQuery: any = {from: contact || number,
    dateSentBefore: new Date(date), dateSentAfter: new Date(date - 864000000)};
  if (contact) {
    toQuery.from = contact;
    fromQuery.from = number;
    fromQuery.to = contact;
  }
  if (last) {
    toQuery.limit = 50;
    fromQuery.limit = 50;
    delete toQuery.dateSentAfter;
    delete fromQuery.dateSentAfter;
  }
  const messagesTo = await getMessages(toQuery)
      .catch((e)=>functions.logger.log(e));
  const messagesFrom = await getMessages(fromQuery)
      .catch((e)=>functions.logger.log(e));
  const Messages = messagesTo.concat(messagesFrom);
  const messages: any = {};
  Messages.forEach((msg: any) => {
    const contactNumber = msg.from == number ? msg.to : msg.from;
    if (!messages[contactNumber]) {
      messages[contactNumber] = [];
    }
    messages[contactNumber].push({
      date: msg.dateUpdated,
      body: msg.body,
      sent: msg.from == number,
    });
  });
  return (messages);
}
