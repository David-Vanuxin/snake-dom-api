const { createServer } = require("node:http")
const { readFileSync } = require("node:fs")
createServer((req, res) => {
	if (req.url === "/") {
		res.setHeader("Content-Type", "text/html")
		const data = readFileSync("./client.html", "utf8")
		res.end(data.toString())
	}

	if (req.url === "/client.js") {
		res.setHeader("Content-Type", "application/javascript")
		const data = readFileSync("./client.js", "utf8")
		res.end(data.toString())
	}
}).listen(3000, () => console.log("Started"))