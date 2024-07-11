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

const isRandom = (num) => true; // Placeholder for random number filter

const numberQualifiers = {
  'prime': isPrime,
  'fibo': isFibonacci,
  'even': isEven,
  'rand': isRandom,
};

// Mock server for testing
const mockApp = express();
mockApp.get('/mock-numbers', (req, res) => {
  // Mock data for different calls
  const primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
  const fibonacciNumbers = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  const evenNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const randomNumbers = [7, 15, 23, 31, 44, 50, 68, 72, 89, 97];

  const { numberid } = req.query;

  // Determine which set of numbers to return based on the query parameter
  let numbers = [];
  if (numberid === 'prime') {
    numbers = primeNumbers;
  } else if (numberid === 'fibo') {
    numbers = fibonacciNumbers;
  } else if (numberid === 'even') {
    numbers = evenNumbers;
  } else if (numberid === 'rand') {
    numbers = randomNumbers;
  } else {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  res.json({ numbers });
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
    const response = await axios.get(`http://localhost:9877/mock-numbers?numberid=${numberid}`);
    const numbers = response.data.numbers;

    const qualifiedNumbers = numbers.filter(numberQualifiers[numberid]);
    const uniqueNumbers = [...new Set(qualifiedNumbers)];

    const windowPrevState = [...numbersWindow];

    if (uniqueNumbers.length > 0) {
      numbersWindow.push(...uniqueNumbers);
    }

    while (numbersWindow.length > windowSize) {
      numbersWindow.shift();
    }

    const average = numbersWindow.reduce((sum, num) => sum + num, 0) / numbersWindow.length;

    res.json({
      numbers: uniqueNumbers,
    });

  } catch (error) {
    res.status(500).json({ error: 'Error fetching numbers from mock server' });
  }
});

app.listen(port, () => {
  console.log(`Average Calculator Microservice running on http://localhost:9876`);
});
