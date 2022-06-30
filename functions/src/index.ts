import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Twilio} from "twilio";
import Stripe from "stripe";
import {createClient} from "redis";
import {Client as Discord, Intents} from "discord.js";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
const db = admin.firestore();

const redis = createClient({
  url: functions.config().redis.url,
  password: functions.config().redis.pass,
});

redis.connect();

const SID = functions.config().twilio.sid;
const ATOKEN = functions.config().twilio.atoken;
const twilio = new Twilio(SID, ATOKEN);

const stripe = new Stripe(functions.config().stripe.secret,
    {apiVersion: "2020-08-27"});


const discordBot = new Discord({intents: [Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_VOICE_STATES], partials: ["CHANNEL"]});


discordBot
    .login(functions.config().discord.key);

/** ************************** Called Functions *******************************/
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
    } else earliest = newEarliest-1000;
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
  const userId = context?.auth?.uid;
  const userRef = db.doc(`users/${userId as string}`);
  const userData = (await userRef.get()).data();
  const billing = (userData as any).billing;
  const bRef = db.doc(`billing/${billing}/accounts/${userId as string}`);
  if (!Array.isArray(data.to)) data.to = [data.to];
  return await sendMessages(data.to, userId as string,
      userRef, userData, bRef, data);
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
    await billingRef.doc(userId as string).set({
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

export const createBilling = functions.https.onCall( async (req, context) => {
  const userId = context?.auth?.uid;
  const userMail = context?.auth?.token.email;
  const billingRef = db.doc(`billing/${userId}/accounts/${userId}`);
  const userRef = db.doc(`users/${userId}`);
  billingRef.set({
    active: false,
    email: userMail,
  });
  userRef.update({
    billing: userId,
    billmail: userMail,
    active: false,
  });
  return {success: true, message: "Billing account created," +
    " activate account and purchase phone numbers & credits" +
    " from Settings page."};
});

export const transferCredits = functions.https.onCall(
    async (request, context) => {
      const user = context?.auth?.uid;
      const to = request.to;
      const amount = request.amount;
      const uRef = db.doc(`users/${user}`);
      const bRef = db.doc(`billing/${user}/accounts/${user}`);
      const toRef = db.doc(`users/${to}`);
      const btoRef = db.doc(`billing/${user}/accounts/${to}`);
      const batch = db.batch();
      batch.update(toRef, {
        credits: admin.firestore.FieldValue.increment(amount),
      });
      batch.update(btoRef, {
        credits: admin.firestore.FieldValue.increment(amount),
      });
      batch.update(uRef, {
        credits: admin.firestore.FieldValue.increment(amount*-1),
      });
      batch.update(bRef, {
        credits: admin.firestore.FieldValue.increment(amount*-1),
      });
      await batch.commit();

      return JSON.parse(JSON.stringify("numbers"));
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
  if (user != billing) {
    await db.collection("users").doc(billing as string).update({
      numbers: admin.firestore.FieldValue.arrayUnion(number.phoneNumber),
    });
  }
  functions.logger.log("BILL $2");
  return JSON.parse(JSON.stringify(number.phoneNumber));
});

export const createCheckout = functions.https.onCall( async (req, context) => {
  const sessionObject: any = {
    payment_method_types: ["card"],
    mode: req.sub? "subscription" : "payment",
    success_url: "https://crm.georgeanthony.net/account",
    cancel_url: "https://crm.georgeanthony.net/error",
    line_items: [],
    client_reference_id: context.auth?.uid,
  };
  if (!req.sub) {
    sessionObject.line_items = [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: req.amount * 2,
          product_data: {
            name: `${(req.amount*1).toLocaleString("en-US")} credits`,
            description: "Use credits for sendings texts & owning numbers.",
          },
        },
      },
    ];
  } else {
    sessionObject.line_items = [
      {
        quantity: 1,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 999,
        },
        price: "price_1L3qL8HLtKSOneliHVz1fNVz",
      },
    ];
  }
  const ref = db.doc(`billing/${context.auth?.uid}`);
  const userData = (await ref.get()).data();
  if (userData && userData.stripeId) {
    sessionObject.customer = userData.stripeId;
  }
  const session = await stripe.checkout.sessions.create(sessionObject);
  return {id: session.id};
});

/** *************************** Automatic functions ***************************/

export const userCreated = functions.auth.user().onCreate(async (user) => {
  await db.collection("users").doc(user.uid).set({
    email: user.email,
    numbers: [],
    drafts: [],
    settings: {doubletext: 3},
    tags: [],
    active: false,
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

export const stripeEvent = functions.https.onRequest(async (req, res) => {
  const sig: any = req.headers["stripe-signature"];
  const endpointSecret = "whsec_XHzS8Mz6Pe1oA2nJ0cWYyCs9qkJmTJg0";

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    functions.logger.log((err as Error).message);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }
  functions.logger.log(event.type);
  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const data = (event.data.object as any);
      const user = data.client_reference_id;
      const bRef = db.doc(`billing/${user}`);
      const uRef = db.doc(`users/${user}`);
      const bData = (await bRef.get()).data();
      const batch = db.batch();
      if (bData && !bData.stripeId) {
        batch.update(bRef, {stripeId: data.customer});
      }
      if (!data.subscription) {
        batch.update(uRef, {credits: admin.firestore.FieldValue
            .increment(data.amount_subtotal/2)});
        batch.update(bRef, {credits: admin.firestore.FieldValue
            .increment(data.amount_subtotal/2)});
      }
      batch.commit();
      res.end();
      break;
    }
    case "customer.created": {
      res.end();
      break;
    }
    case "invoice.paid": {
      const data = (event.data.object as any);
      const customerId = data.customer;
      const customer = db.doc(`payments/${customerId}`);
      const ref = db.collection(`payments/${customerId}/history`);
      const date = Date.now();
      if ((await customer.get()).exists) {
        await customer.update({
          total_paid: admin.firestore.FieldValue.increment(data.total),
        });
      } else {
        await customer.set({
          total_paid: admin.firestore.FieldValue.increment(data.total),
        });
      }
      await ref.add({date: date, amount: data.total});
      functions.logger.log("--------------------INVOICE-------------------");
      functions.logger.log(data);
      functions.logger.log("----------------------------------------------");
      switch (data.billing_reason) {
        case "subscription_create": {
          const snapshot = await db.collection("billing")
              .where("stripeId", "==", customerId).limit(1).get();
          if (!snapshot.empty) {
            const user = snapshot.docs[0];
            const subs = db.collection(`billing/${user.id}/subscriptions`);
            const subscription = subs.doc(data.subscription);
            await subscription.set({
              number: data.lines.data[0].quantity,
              expires: addMonths(new Date()).getTime(),
            });
            await user.ref.update({
              subscriptions: admin.firestore.FieldValue
                  .increment(data.lines.data[0].quantity),
            });
          } else {
            functions.logger.log("No Account");
          }
          break;
        }
        case "subscription_cycle": {
          const snapshot = await db.collection("billing")
              .where("stripeId", "==", customerId).limit(1).get();
          if (!snapshot.empty) {
            const user = snapshot.docs[0];
            const subs = db.collection(`billing/${user.id}/subscriptions`);
            const subscription = subs.doc(data.subscription);
            await subscription.update({
              expires: addMonths(new Date()).getTime(),
            });
          } else {
            functions.logger.log("No Account");
          }
          break;
        }
        case "manual": {
          functions.logger.log("-----------------------------------------");
          functions.logger.log(data);
          functions.logger.log("-----------------------------------------");
          break;
        }
        default: {
          functions.logger.log(data.billing_reason);
          break;
        }
      }

      res.end();
      break;
    }
    default: {
      twilio.messages.create(
          {from: "+16476975636", to: "+15164979806", body: event.type}
      );
      res.end();
      break;
    }
  }
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
          if (date >= text.date && !text.sent) {
            text.targets.forEach((to: string) => {
              twilio.messages.create(
                  {from: text.from, to: to, body: text.body}
              );
            });
            if (text.tags && text.tags.length > 0) {
              const contacts = (await db.collection(`users/${user.id}/contacts`)
                  .get()).docs.map((doc) => ({...doc.data(), id: doc.id}));
              let targets: any[] = [];
              text.tags.forEach((tag: string) => {
                contacts.forEach((contact: any) => {
                  if (contact.tags?.includes(tag)) {
                    targets = [...new Set(targets.concat([contact.primary]))];
                  }
                });
              });
              targets.forEach((to: string) => {
                twilio.messages.create(
                    {from: text.from, to: to, body: text.body}
                );
              });
            }
            const ref = db.collection(`users/${user.id}/scheduled`)
                .doc(text.id);
            if (text.repeat) {
              let repeat = text.repeat;
              const newD = new Date(text.date);
              if (repeat <= 60000*60*24*14) {
                repeat = text.date + repeat;
              } else if (repeat > 60000*60*24*14 && repeat <= 60000*60*24*28) {
                newD.setMonth(newD.getMonth()+1);
                repeat = text.date +
                  (newD.getTime() - new Date(text.date).getTime());
              } else if (repeat > 60000*60*24*28 &&
                repeat < 60000*60*24*28*6) {
                newD.setMonth(newD.getMonth()+3);
                repeat = text.date +
                    (newD.getTime() - new Date(text.date).getTime());
              } else if (repeat > 60000*60*24*28*6 &&
                repeat < 60000*60*24*28*12) {
                newD.setMonth(newD.getMonth()+6);
                repeat = text.date +
                    (newD.getTime() - new Date(text.date).getTime());
              } else if (repeat > 60000*60*24*28*12) {
                newD.setFullYear(newD.getFullYear()+1);
                repeat = text.date +
                  (newD.getTime() - new Date(text.date).getTime());
              }
              await ref.update({date: repeat});
            } else await ref.update({sent: true});
          }
        });
      }
    });

export const checkSubscriptions = functions.pubsub.schedule("38 17 * * *")
    .timeZone("America/New_York").onRun( async (context) => {
      const date = Date.now();
      const users = (await db.collection("billing").get())
          .docs.map((doc) => ({...doc.data(), id: doc.id}));
      for (const user of users) {
        const subscriptions = (await db.collection(
            `billing/${user.id}/subscriptions`).get())
            .docs.map((doc) => ({...doc.data(), id: doc.id}));
        for (const subscription of subscriptions as any) {
          if (!subscription.cancelled && date > subscription.expires) {
            const sub = db
                .doc(`billing/${user.id}/subscriptions/${subscription.id}`);
            if (!subscription.pastDue) {
              sub.update({pastDue: true}); // gives an extra day, send email
              functions.logger.log("PAST DUE");
            } else {
              const userRef = db.doc(`billing/${user.id}`);
              const accounts = (await db
                  .collection(`billing/${user.id}/accounts`).get());
              accounts.docs.reverse();
              await userRef.update({
                subscriptions: admin.firestore.FieldValue
                    .increment(subscription.number*-1),
              });
              let index = subscription.number;
              for (const doc of accounts.docs) {
                const account = doc.data();
                if (account.active && index > 0) {
                  await doc.ref.update({active: false});
                  await db.doc(`users/${doc.id}`).update({active: false});
                  index -= 1;
                }
              }
              sub.update({cancelled: true});
              stripe.subscriptions.del(sub.id);
            }
          }
        }
      }
    });

/**
 * @param {array} targets
 * @param {string} userId
 * @param {any} userRef
 * @param {any} userData
 * @param {any} bRef
 * @param {any} data
 */
async function sendMessages(targets: Array<string>, userId: string,
    userRef: any, userData: any, bRef: any, data: any) {
  const date = Date.now();
  const toTargets = [];
  functions.logger.log(process.env.DISCORD_KEY);
  functions.logger.log(process.env.REDIS_URL);
  if (targets.length > 1) {
    const sentData = JSON.parse(await redis.get(`${userId}-sent`) || "{}");
    const newSent = JSON.parse(JSON.stringify(sentData));
    for (const to of targets) {
      if (newSent[to]) {
        const data = newSent[to];
        if (data && (data as any).last +
            ((userData as any).settings.doubletext*86400000) < date) {
          newSent[`${to}.last`] = date;
          toTargets.push(to);
        }
        delete newSent[to];
      } else {
        newSent[to] = {last: date};
        toTargets.push(to);
      }
    }
    if (JSON.stringify(newSent) !== "{}") {
      await redis.set(`${userId}-sent`, JSON.stringify(newSent));
    }
  } else toTargets.push(targets[0]);

  toTargets.forEach( (to: string) => {
    twilio.messages.create(
        {from: data.from, to: to, body: data.body}
    );
  });
  functions.logger.log(`Sent ${toTargets.length}`);
  await userRef.update({credits: admin.firestore.FieldValue
      .increment(toTargets.length*-1)});
  await bRef.update({credits: admin.firestore.FieldValue
      .increment(toTargets.length*-1)});
  return {success: true, sent: toTargets.length};
}

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
    return null;
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
  const Messages = messagesTo?.concat(messagesFrom || []);
  const messages: any = {};
  Messages?.forEach((msg: any) => {
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
/**
   * add days
   * @param {any} date
   * @param {number} months
   * @return {any} date
   */
function addMonths(date: any = new Date(), months = 1): any {
  const newDate = new Date(date);
  newDate.setDate(newDate.getMonth() + months);
  return newDate;
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param {Array<string>} myArray array to split
 * @param {number} chunkSize Size of every group
 * @return {Array<string>} tempArray
 *//*
function chunkArray(myArray: Array<string>, chunkSize: number) {
  let index = 0;
  const arrayLength = myArray.length;
  const tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index+chunkSize);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}


/**
   * remove time
   * @param {any} date
   * @return {any} date

 function removeTime(date: any = new Date()): any {
  return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
  );
}
/**
   * add days
   * @param {any} date
   * @param {number} days
   * @return {any} date

function addDays(date: any = new Date(), days = 1): any {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}*/
