const { PeerServer } = require('peer');

const peerServer = PeerServer({
    port: process.env.PORT || 9000, // Renderが自動で設定するPORTを利用
    path: '/filebridge', // 接続パス
    allow_discovery: true, // 将来的にデバイス検出機能を使いたい場合はtrue
});

console.log(`PeerJS server running on port ${peerServer.options.port}`);