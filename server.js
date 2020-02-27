require("dotenv-flow").config();

const { PORT, NAME } = process.env;

const app = require("./src/app");

console.log(`Begin "${NAME}" microservice in port ${PORT}`);
app.listen(PORT, () => {
  console.log(`Service "${NAME}" microservice in port ${PORT}`);
});

process.on("beforeExit", () => {
  console.log(`Before Exit service "${NAME}" in port ${PORT}`);
});

process.on("exit", () => {
  console.log(`Exit service "${NAME}" in port ${PORT}`);
});
