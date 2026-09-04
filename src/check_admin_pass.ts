import "dotenv/config";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const user = await db.user.findUnique({
    where: { email: "admin@cmibattery.com" },
  });

  if (!user) {
    console.log("User admin@cmibattery.com NOT found!");
    return;
  }

  console.log("User found:", user.email);
  console.log("Password hash:", user.password);

  const testPasswords = [
    "admin123"
  ];

  let matched = false;
  if (user.password) {
    for (const pwd of testPasswords) {
      const match = await bcrypt.compare(pwd, user.password);
      if (match) {
        console.log(`MATCH FOUND! Password is: "${pwd}"`);
        matched = true;
        break;
      }
    }
  }

  if (!matched) {
    console.log("None of the test passwords matched the stored hash.");
  }
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
