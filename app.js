/* 
    Author: Adam Sinclair
    Date: December 30th 2017
    Purpose: 
        This small project showcases the combination of several APIs:
            * IndeedService API to scrape Indeed.ca jobs
            * Google Geocode API to retrieve longitude/latitude of a location
            * Twilio API to send SMS of job information
*/

const 
    _util = require('./_util.js'),
    credentials = require('./credentials.js'),
    IndeedService = require('scrape-indeed')(),
    twilio = require('twilio'),
    client = new twilio(credentials.twilioSID, credentials.twilioAuthToken)
    options = {
        title: process.argv[2],
        location: process.argv[3],
        radius: process.argv[4],
        count: process.argv[5]
    }
;

// Fetch jobs from Indeed using command-line arguments
IndeedService.query(options)
.then(function(data) {

    // Build an array of Promise function calls
    // This will ensure all functions resolve before continuing.
    let apiArray = [];
    data.jobList.forEach(function(job) {
        apiArray.push(getGoogleGeocode(job, options.location, credentials.googleGeocodeKey));
    });

    return Promise.all(apiArray);
})
.then(function(data) {

    // Fetch an arbitrary object from the array
    jobInfo = data[0];

    // Build string representation of the first job received
    let geoString = '\n----------------------------------\n';
    geoString += 'Job Title: ' + jobInfo.job.title;
    geoString += '\n----------------------------------\n';
    geoString += 'Company: ' + jobInfo.job.company;
    geoString += '\n----------------------------------\n';
    geoString += 'Location: ' + jobInfo.location;
    geoString += '\n----------------------------------\n';
    geoString += 'Address: ' +  jobInfo.address.results[0].formatted_address;
    geoString += '\n----------------------------------\n';
    geoString += 'Coordinates: (' + jobInfo.address.results[0].geometry.location.lat + 
                 ', ' + jobInfo.address.results[0].geometry.location.lng + ')';
    geoString += '\n----------------------------------\n';

    // Send SMS of first geodata
    client.messages.create({
        body: geoString,
        to: credentials.receiveNumber,
        from: credentials.twilioSendNumber
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err));
})
.catch(function(err) {
    console.log(err);
});


const getGoogleGeocode = function(jobData, location, apiKey) {
    return new Promise(function(resolve, reject) {
        if(jobData == undefined || location == undefined || apiKey == undefined)
            reject(new Error('getGoogleGeocode() - Parameter(s) is undefined.'));

        // Replace any whitespace with '+'
        let ws_regex = /\s+/g,
            encodedCompany = jobData.company.replace(ws_regex, '+'),
            query = '/maps/api/geocode/json?address=' + (encodedCompany+'+'+location) + '&region=ca' + '&key=' + apiKey
        ;

        // HTTPS request to get Geocoordinates of specific location
        _util.getHTTPS('maps.googleapis.com', query)
        .then(function(data) {
            let geocodes = JSON.parse(data);
            resolve({
                job: jobData,
                location: location,
                address: geocodes
            });
        })
        .catch(function(err) {
            reject(new Error('getGoogleGeocode() - ' + err));
        });
    });
};