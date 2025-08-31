// server.js
const express = require('express');
const { ExpressPeerServer } = require('peer');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 9000;

// 接続中のクライアントをIPアドレスごとに管理するオブジェクト
const clientsByIp = {};

const peerServer = ExpressPeerServer(server, {
    path: '/filebridge',
    allow_discovery: true, // これ自体は使いませんが、念のため有効に
});

app.use(peerServer);

// 新しいAPIエンドポイント: /get-local-peers
// 同じIPアドレスを持つピアのリストを返す
app.get('/get-local-peers', (req, res) => {
    // 'x-forwarded-for' はRenderなどが付与する、元のクライアントIP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (clientsByIp[clientIp]) {
        res.json(Object.keys(clientsByIp[clientIp]));
    } else {
        res.json([]);
    }
});

peerServer.on('connection', (client) => {
    const peerId = client.getId();
    // 'getSocket' は内部APIですが、IP取得に利用します
    const ip = client.getSocket().remoteAddress;

    if (!clientsByIp[ip]) {
        clientsByIp[ip] = {};
    }
    clientsByIp[ip][peerId] = true;
    console.log(`Client connected: ${peerId} from IP: ${ip}`);
});

peerServer.on('disconnect', (client) => {
    const peerId = client.getId();
    const ip = client.getSocket().remoteAddress;

    if (clientsByIp[ip] && clientsByIp[ip][peerId]) {
        delete clientsByIp[ip][peerId];
        if (Object.keys(clientsByIp[ip]).length === 0) {
            delete clientsByIp[ip];
        }
    }
    console.log(`Client disconnected: ${peerId}`);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
