const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;
const windowSize = 10;
const numbersWindow = [];

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isFibonacci = (num) => {
  const isPerfectSquare = (x) => {
    const s = Math.sqrt(x);
    return s * s === x;
  };
  return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
};

const isEven = (num) => num % 2 === 0;

const isRandom = (num) => true;

const numberQualifiers = {
  'p': isPrime,
  'f': isFibonacci,
  'e': isEven,
  'r': isRandom,
};

// Mock endpoint for testing
const mockNumbersEndpoint = 'http://localhost:9877/mock-numbers';

// Mock server for testing
const mockApp = express();
mockApp.get('/mock-numbers', (req, res) => {
  res.json([2, 4, 6, 8]);
});
mockApp.listen(9877, () => {
  console.log('Mock server running on http://localhost:9877');
});

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!numberQualifiers[numberid]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  try {
    const response = await axios.get(mockNumbersEndpoint);
    const numbers = response.data;

    const qualifiedNumbers = numbers.filter(numberQualifiers[numberid]);
    const uniqueNumbers = [...new Set(qualifiedNumbers)];

    // Assuming all fetched numbers are valid (as there's no timestamp in the mock data)
    const validNumbers = uniqueNumbers;

    if (validNumbers.length > 0) {
      numbersWindow.push(...validNumbers);
    }

    while (numbersWindow.length > windowSize) {
      numbersWindow.shift();
    }

    const average = numbersWindow.reduce((sum, num) => sum + num, 0) / numbersWindow.length;

    res.json({
      numbers: validNumbers,
      windowPrevState: [],
      windowCurrState: numbersWindow,
      avg: average.toFixed(2),
    });

  } catch (error) {
    res.status(500).json({ error: 'Error fetching numbers from test server' });
  }
});

app.listen(port, () => {
  console.log('Average Calculator Microservice running on http://localhost:9876');
});