## What is it?
- A small Node.js application that searches Indeed.ca for job postings. As a demonstration, a single job posting is sent via SMS to the requested phone number.

## How to use it?

#### Installation
Inside the project directory type:
```
npm install
```

#### Requirements
You must create `credentials.js` within root directory with the following:

```javascript
const credentials = {
    googleGeocodeKey: '', // necessary for Google Geocode API
    twilioSID: '',
    twilioAuthToken: '',
    twilioSendNumber: '',
    receiveNumber: ''
};

module.exports = credentials;
```

#### Basic usage.
Within project directory type:

`node app.js 'Job Title' 'Location' x y`

`x` represents the radius relative to `location`. In kilometers.

`y` represents the number of postings to search for. Maximum 50.

Example: `node app.js 'Software Engineer Intern' 'Toronto' 5 50`

#### Output
Below is the output you will receive from Twilio SMS:

![screen shot 2017-12-30 at 5 56 57 pm](https://user-images.githubusercontent.com/15149835/34457822-0ac6c73c-ed8b-11e7-9383-0a026b7730ff.png)