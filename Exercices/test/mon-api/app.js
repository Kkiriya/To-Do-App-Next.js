const http = require("http");
const serveur = http.createServer((req, res) => {
  res.writeHead(200, { "Content-type": "text/html" });
  res.end("<h1>Hello world, this is my first backend server node.js</h1>");
});
serveur.listen(8080, () =>
  console.log("Serveur actif sur http://localhost:8080"),
);
