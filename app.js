import express from "express";
import bodyParser from "body-parser";
import usersRounter from "./routes/users.js";
import questionsRounter from "./routes/questions.js";
import commentsRouter from "./routes/commets.js";

const app = express();
const PORT = 4000;
app.use(bodyParser.json());

app.use("/users", usersRounter);
app.use("/questions", questionsRounter);
app.use("/questions", commentsRouter);

app.listen(PORT, () => {
  console.log(`Server start at Port ${PORT}`);
});
