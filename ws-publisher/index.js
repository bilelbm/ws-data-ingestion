var WebSocketClient = require("websocket").client;
const axios = require("axios");
const crypto = require('crypto');

const { SQSClient, CreateQueueCommand, SQS, SendMessageBatchCommand }  = require("@aws-sdk/client-sqs");
const MAX_BATCH_SIZE = 10; // sqs batch only supports max 10 per batch
const sqsClient = new SQSClient({ region: "us-east-1", endpoint: 'http://localhost:4566' });

var queueURL = "http://localhost:4566/queue/BTC_QUEUE";


const sendBatch = async (bodyList) => {
    try {
        var params = {
            QueueUrl: queueURL,
            Entries: bodyList
        }
        const data = await sqsClient.send(new SendMessageBatchCommand(params));
        console.log("Success, batch sent.");
    } catch (err) {
        console.log("Error", err);
    }
};

const connect = async () => {
    var client = new WebSocketClient();

    const auth = await axios.default.get(
        'https://test.deribit.com/api/v2/public/auth',
        {
            params: {
                client_id: 'HD5Poh0t',
                client_secret: "B4rgiZopaPg83Od0oah037IUPJ96teR8-1svxUmeFB8",
                grant_type: "client_credentials",
            },
        }
    );
    const access_token = auth.data.result.access_token;
    return new Promise((resolve, reject) => {
        var batch = [];
        client.on("connect", async function (connection) {
            console.log("WebSocket Client Connected");
            const msg = {
                jsonrpc: "2.0",
                method: "private/subscribe",
                params: {
                    channels: [`ticker.BTC-29DEC23-16000-C.raw`, `ticker.BTC-29DEC23-18000-C.raw`, `ticker.BTC-29DEC23-20000-C.raw`],
                    access_token
                },
            }
            if (connection.connected) {
                connection.sendUTF(JSON.stringify(msg));
            }
            connection.on("error", async function (error) {
                if (batch.length > 0) {
                    // in case of error send data if batch is interrupted
                    await sendBatch(batch);
                    batch = [];
                }
                console.log("Connection Error: " + error.toString());
            });
            connection.on("closed", async function (error) {
                if (batch.length > 0) {
                    // in case of error send data if batch is interrupted
                    await sendBatch(batch);
                    batch = [];
                }
                console.log("Connection closed: ");
            });
            connection.on("message", async function (message) {
                const response = JSON.parse(message.utf8Data);
                if (response.method == "subscription") {
                    const params = response.params;
                    const channel = `${params.channel}`.split(".");
                    if (channel[0] === "ticker") {
                        const data = params.data;

                        batch.push({Id: crypto.randomUUID(), MessageBody: JSON.stringify(data)});
                        console.log(`got data from ws, current batch size: ${batch.length}`);
                        if (batch.length == MAX_BATCH_SIZE) {
                            console.log(`Sending batch of size ${batch.length}`);
                            await sendBatch(batch);
                            batch = [];
                        }

                    }
                }
            });
        });
        client.connect("wss://test.deribit.com/ws/api/v2");
    });
};

connect()