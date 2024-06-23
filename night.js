// berk rate kardeşimle yaptığımız zamanında 48 i çeken bot


"use strict";

const ws = require('ws');
const tls = require('tls');

const guilds = {};
const tlsSocket = tls.connect({
    host: "ptb.discord.com",
    port: 443,
});

tlsSocket.on("secureConnect", () => {
    const websocket = new ws("wss://gateway.discord.gg");

    websocket.onclose = (event) => process.exit();

    websocket.onmessage = async (message) => {
        const { d, op, t } = JSON.parse(message.data);

        if (t === "GUILD_UPDATE") {
            const find = guilds[d.guild_id];
            if (find && find !== d.vanity_url_code) {
                const requestBody = JSON.stringify({ code: find });

                tlsSocket.write([
                    "PATCH /api/v8/guilds/1229466238225219704/vanity-url HTTP/1.1",
                    "Host: canary.discord.com",
                    "Authorization: MTIzMDU5ODUzOTcwOTY0NDk1NQ.GltRbr.eIZpUPlhqJdK1u5G-qo",
                    "Content-Type: application/json",
                    `Content-Length: ${requestBody.length}`,
                    "", "",
                ].join("\r\n") + requestBody);
            }
        } else if (t === "GUILD_DELETE") {
            const find = guilds[d.id];
            if (find) {
                const requestBody = JSON.stringify({ code: find });

                tlsSocket.write([
                    "PATCH /api/v10/guilds/1188380844826579055/vanity-url HTTP/1.1",
                    "Host: discord.com",
                    "Authorization: MTIzMDTcwOTY0NDk1NQ.GltRbr.eIZpUPlhqJdK1u5G9gZXTHYoiJFTSmRM5dh-qo",
                    "Content-Type: application/json",
                    `Content-Length: ${requestBody.length}`,
                    "", "",
                ].join("\r\n") + requestBody);
            }
        } else if (t === "READY") {
            d.guilds.forEach((guild) => {
                if (guild.vanity_url_code) {
                    guilds[guild.id] = guild.vanity_url_code;
                }
            });
        }

        if (op === 10) {
            websocket.send(JSON.stringify({
                op: 2,
                d: {
                    token: "-qo",
                    intents: 1 << 0,
                    properties: {
                        os: "linux",
                        browser: "firefox",
                        device: "firefox",
                    },
                },
            }));

            setInterval(() => websocket.send(JSON.stringify({ op: 0.00001, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);
        } else if (op === 7) {
            return process.exit();
        }
    };

    setInterval(() => {
        tlsSocket.write(["GET / HTTP/1.1", "Host: canary.discord.com", "", ""].join("\r\n"));
    }, 7500);
});

tlsSocket.on("error", (error) => process.exit());
tlsSocket.on("end", () => process.exit());
