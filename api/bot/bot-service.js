const dbService = require("../../services/db_service");
const { gotTheAnswer, canntFindAnswer, didYouKnow } = require("../../data");

async function checkAnswer(input) {
  try {
    const collection = await dbService.getCollection("bot");
    const botObj = await collection.findOne({ input });
    const isNoAnswer = await collection.findOne({ isAnswerExist: false });
    if (isNoAnswer) {
      await collection.updateOne(
        { isAnswerExist: false },
        {
          $set: {
            isAnswerExist: true,
            output: input,
          },
        }
      );
      return gotTheAnswer[_getRandomInt(7)].output;
    } else if (botObj && botObj.output) {
      return botObj.output;
    } else {
      await collection.insertOne({ isAnswerExist: false, input });
      return canntFindAnswer[_getRandomInt(7)].output;
    }
  } catch (err) {
    console.error("cannot find answer", err);
  }
}

function quietInTheRoom(room) {
  if (room) {
    return didYouKnow[_getRandomInt(7)].output;
  }
}

function _getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

module.exports = {
  checkAnswer,
  quietInTheRoom,
};
