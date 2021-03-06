const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Game Variables

const players = {};
const positions = ["North", "East", "South", "West"];

// Socket Events

io.on("connection", socket => {
	io.in("players").clients((err, clients) => {
		if (clients.length < 4) {

			const availablePositions = positions.filter(position => !Object.keys(players).includes(position));
			const playerPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];

			io.emit("join", playerPosition);

			socket.emit("positions", Object.keys(players), playerPosition);

			players[playerPosition] = socket.id;

			socket.join("players");

			console.log(players);

			socket.on("disconnect", () => {
				delete players[playerPosition];

				io.emit("leave", playerPosition);

				console.log(players);
			});

			socket.on("codeWords", codeWords => {
				console.log(playerPosition + " Sending CodeWords");
				io.to("players").emit("codeWords", codeWords, playerPosition);
			});

			socket.on("shuffledDeck", shuffledDeck => {
				console.log(playerPosition + " Shuffling");
				io.to("players").emit("shuffledDeck", shuffledDeck, playerPosition);
			});

			socket.on("lockedDeck", lockedDeck => {
				console.log(playerPosition + " Locking");
				io.to("players").emit("lockedDeck", lockedDeck, playerPosition);
			});

			socket.on("cardKeys", cardKeys => {
				console.log(playerPosition + " Sending Keys");
				io.to("players").emit("cardKeys", cardKeys, playerPosition);
			});

			socket.on("dealerCommitment", dealerCommitment => {
				console.log(playerPosition + " Sending Dealer Commitment");
				io.to("players").emit("dealerCommitment", dealerCommitment, playerPosition);
			});

			socket.on("revealedCommitment", revealedCommitment => {
				console.log(playerPosition + " Revealing Commitment");
				io.to("players").emit("revealedCommitment", revealedCommitment, playerPosition);
			});

			if (Object.keys(players).length == 4) {
				io.to("players").emit("start");
			}

		} else {
			socket.emit("positions", [Object.keys(players), null]);

			socket.join("spectators");
		}
	});
});

server.listen(8000);
