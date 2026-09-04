const { execSync } = require('child_process');
const { Client } = require('pg');
async function run() {
  const token = execSync('aws rds generate-db-auth-token --hostname cmis-store-db.cluster-cteo02w0ywrp.ap-south-1.rds.amazonaws.com --port 5432 --region ap-south-1 --username postgres').toString().trim();
  const client = new Client({ connectionString: 'postgresql://postgres:' + encodeURIComponent(token) + '@cmis-store-db.cluster-cteo02w0ywrp.ap-south-1.rds.amazonaws.com:5432/postgres?sslmode=require' });
  await client.connect();
  await client.query("CREATE USER cmi_app WITH PASSWORD 'App12345!';");
  await client.query("GRANT ALL PRIVILEGES ON DATABASE postgres TO cmi_app;");
  await client.query("GRANT ALL ON SCHEMA public TO cmi_app;");
  await client.query("ALTER USER cmi_app CREATEDB;");
  console.log('User created successfully.');
  await client.end();
}
run().catch(console.error);
