// index.js
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// Endpoint to handle Alexa requests
app.post('/familia', (req, res) => {
  const { request } = req.body;


  // Check if the request type is IntentRequest
  if (request.type === 'IntentRequest') {
    const { intent } = request;
    const { name, value } = intent.slots.FirstName;

    console.log(value);

    switch (intent.name) {
      case 'GetPersonInfo':
        handleGetPersonInfo(value, res);
        break;
      default:
        res.json({ error: 'Invalid intent' });
    }
  } else {
    res.json({ error: 'Invalid request type' });
  }
});

// Function to handle GetPersonInfo intent
function handleGetPersonInfo(firstName, res) {
  // Retrieve person information from the data
  const person = getPersonByName(firstName);

  if (person) {
    let responseText = '';

    if (person.birthdate) {
      responseText = `${firstName}'s birthdate is ${person.birthdate}.`;
    } else if (person.message) {
      responseText = person.message;
    }

    res.json({
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: responseText,
        },
        shouldEndSession: true,
      },
    });
  } else {
    res.json({ error: 'Person not found' });
  }
}

function getPersonByName(firstName) {
  try {
    // Get the absolute path to the JSON file
    const jsonFilePath = path.join(__dirname, 'names.json');

    // Read the JSON file asynchronously
    const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');

    // Parse the JSON data
    const names = JSON.parse(jsonData).names;

    // Find and return the person by name
    return names.find((person) => person.name.toLowerCase() === firstName.toLowerCase());
  } catch (error) {
    console.error('Error reading or parsing names.json:', error);
    return null; // Handle the error gracefully or return a default value
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
