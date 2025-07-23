const { createServer } = require("node:http")
const { readFileSync } = require("node:fs")
createServer((req, res) => {
	if (req.url === "/") {
		res.setHeader("Content-Type", "text/html")
		const data = readFileSync("./client.html", "utf8")
		res.end(data.toString())
	}

	if (req.url.search("js") > -1) {
		res.setHeader("Content-Type", "application/javascript")
		try {
			const data = readFileSync("." + req.url, "utf8")
			res.end(data.toString())
		} catch {}
	}
}).listen(3000, () => console.log("Started"))