const express = require("express");
const dotenv = require("dotenv");
const app = express();

app.listen(process.env.PORT || 3000);

app.use(express.static("data"));
app.use(express.json());

dotenv.config();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://khholst:Leaderboard28@leaderboard.xtdau.mongodb.net/Leaderboard?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main(){
    try {
        await client.connect();
        //await getTopScoresFromAtlas(client);

    } catch(e) {
        console.error(e);
        
    } finally {
        await client.close;
    }
}

/* async function getTopScoresFromAtlas(client) {
    const cursor = await client.db("leaderboard").collection("EST city quiz").find({})
    .sort({ finalScore: -1 })
    .limit(5);

    const results = await cursor.toArray();

    getScores(results);
    postScore(client);
} */


//function getScores(results) {



app.get('/api', async (request, response) => {

  const cursor = await client.db("leaderboard").collection("EST city quiz").find({})
    .sort({ finalScore: -1 })
    .limit(5);

  const results = await cursor.toArray();
  console.log(JSON.stringify(results));

  response.send(JSON.stringify(results));
  //console.log(response.body);
});




//}



function postScore(client) {
  app.post('/addscore', (request, response) => {
    let score = request.body;
    client.db("leaderboard").collection("EST city quiz").insertOne(score)
    .catch(console.error);
    response.send("Skoor andmebaasis");
  });
}

/* app.get('/api', (request, response) => {
  response.send(JSON.stringify(Math.random()));
  console.log(response.body)
}); */

main().catch(console.error);


