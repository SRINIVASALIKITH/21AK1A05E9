const express = require('express');
const axios = require('axios');

const app = express();


const WINDOW_SIZE = 10;
const THIRD_PARTY_API_URL = "http://example.com/numbers";
const TIMEOUT = 500; 

let storedNumbers = [];

app.get('/numbers/:number_id', async (req, res) => {
  const numberId = req.params.number_id;

  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(`${THIRD_PARTY_API_URL}/${numberId}`, { timeout: TIMEOUT });
    const number = response.data.number;

    if (number !== undefined && !storedNumbers.includes(number)) {
      if (storedNumbers.length >= WINDOW_SIZE) {
        storedNumbers.shift(); 
      }
      storedNumbers.push(number);
    }

    const duration = Date.now() - startTime;

    if (duration > TIMEOUT) {
      return res.status(504).json({ error: "Request timed out" });
    }
    const average = storedNumbers.length === 0 ? 0 : storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length;

    const responseData = {
      numbers_before: storedNumbers.length > 1 ? storedNumbers.slice(0, -1) : [],
      numbers_after: storedNumbers,
      average: average
    };

    res.status(200).json(responseData);

  } catch (error) {
    res.status(502).json({ error: "Error fetching number" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
