const Twilio = require("twilio");

const SID = "AC688466c5775a5441bc7e9e15b774ccb5";
const ATOKEN = "6d80905c9144e65f95e25473755b923e";
const client = new Twilio(SID, ATOKEN);

const number = '+15162616031';

async function run() {
    const date = false;

    const toQuery = {to: number, limit: 20, dateSentBefore: new Date(Date.now())};
    const fromQuery = {from: number, limit: 20,
      dateSentBefore: new Date(Date.now()),
    };
    if (date) {
      toQuery.dateSentBefore = date;
      fromQuery.dateSentBefore = date;
    }
    const messagesTo = await getMessages(toQuery);
    const messagesFrom = await getMessages(fromQuery);
    const Messages = messagesTo.concat(messagesFrom);
    Messages.sort((a, b) => (a.dateUpdated - b.dateUpdated));
    const messages = {};
    Messages.forEach((msg) => {
        const contactNumber = msg.from == number ? msg.to : msg.from
        if (!messages[contactNumber]) {
            messages[contactNumber] = [];
        }
        messages[contactNumber].push({
            date: msg.dateUpdated,
            body: msg.body,
            sent: msg.from == number,
        });
    });
    console.log(Messages.length)
    //getMessages({to: number, limit: 20, dateSentBefore: new Date(Date.now())})
}
async function getMessages(query) {
    try {
        const messages = await client.messages.list(query);
        return (messages) ;
    } catch (e) {
        console.log(e);
    }
}
run()
/**
 *
 * Get latest messages
 * @param {any} number phone number to query
 * @param {any} date
 * @return {array} messages
async function getConversations(number: string, date: any) {
    const to = {to: number, limit: 20, dateSentBefore: new Date(Date.now())};
    const from = {from: number, limit: 20,
        dateSentBefore: new Date(Date.now()),
    };
    if (date) {
        to.dateSentBefore = date;
        from.dateSentBefore = date;
    }
    const mTo = await getMessages(to);
    const mFrom = await getMessages(from);
    const Messages = mTo.concat(mFrom);
    Messages.sort((a: any, b: any) => {
        return a.dateUpdated - b.dateUpdated;
    });
    const messages = {};
    Messages.forEach((msg: any) => {
        if (!(messages as any)[msg.from]) {
        (messages as any)[msg.from] = [];
        }
        (messages as any)[msg.from].push({
        date: msg.dateUpdated,
        body: msg.body,
        sent: false,
        });
    });
    return (messages);
}
 */