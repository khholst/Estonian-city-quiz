const express = require("express");
const dotenv = require("dotenv");
const app = express();

app.listen(process.env.PORT || 3000);

app.use(express.static("data"));
app.use(express.json());

dotenv.config();

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main(){
    try {
        await client.connect();

    } catch(e) {
        console.error(e);
        
    } finally {
        await client.close;
    }
}

app.get('/api', async (request, response) => {

  const cursor = await client.db("leaderboard").collection("EST city quiz").find({})
    .sort({ finalScore: -1 })
    .limit(5)

  const results = await cursor.toArray();
  console.log(JSON.stringify(results));

  response.send(JSON.stringify(results));
});


app.post('/addscore', async (request, response) => {
  let score = request.body;
  await client.db("leaderboard").collection("EST city quiz").insertOne(score)
  .catch(console.error);
  response.send("Skoor andmebaasis");
});


main().catch(console.error);


