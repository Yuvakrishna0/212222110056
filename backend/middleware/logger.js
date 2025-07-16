const axios = require('axios');

async function Log(stack, level, pkg, message) {
  try {
    const response = await axios.post("http://20.244.56.144/evaluation-service/logs", {
      stack,
      level,
      package: pkg,
      message
    }, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`  
      }
    });
    console.log("Log sent:", response.data.message);
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
}

module.exports = Log;
