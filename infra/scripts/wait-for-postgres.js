const { exec } = require("node:child_process");

const spinnerFrames = ["|", "/", "-", "\\"];
let frameIndex = 0;

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(
        "\r🟠 " + spinnerFrames[frameIndex] + " Waiting for Postgres...",
      );

      frameIndex = (frameIndex + 1) % spinnerFrames.length;

      setTimeout(checkPostgres, 100);
      return;
    }

    //process.stdout.write("\r" + " ".repeat(50) + "\r");
    process.stdout.write("\r" + "🟠 Waiting for Postgres...");
    console.log("\n🟢 Postgres is ready and accepting connections");
  }
}

process.stdout.write("🟠 Waiting for Postgres...");
checkPostgres();

// const { exec } = require("node:child_process");

// function checkPostgres() {
//   exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

//   function handleReturn(error, stdout) {
//     if (stdout.search("accepting connections") === -1) {
//       process.stdout.write(".");
//       //console.log(stdout);
//       checkPostgres();
//       return;
//     }
//     console.log("\n🟢 Postgres is ready and accepting connections");
//   }
// }

// process.stdout.write("\n🟠 Waiting for Postgress acepting connections");
// checkPostgres();
