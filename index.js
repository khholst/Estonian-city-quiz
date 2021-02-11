const express = require("express");
const dataStore = require("nedb");

const app = express();

app.listen(process.env.PORT || 3000);
app.use(express.static("data"));
app.use(express.json())

const dataBase = new dataStore("database.db");
dataBase.loadDatabase();


app.get("/api", (request, response) => {
    dataBase.find({}, (error, data) => {
        if (error) {
            response.end();
            return;
        }
    response.json(data.sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 5));
    });
});


app.post("/api", (request, response) => {
    const score = request.body;
    dataBase.insert(score);
    response.json({
        status: "success",
        indata: score
    });
})
