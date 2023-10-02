const globalMap = require('./globalMap')
const http = require('https');
const axios = require("axios")
function sendMessageToSocketIds(key, message) {
  
    if (globalMap.has(key)) {
      const socketIds = globalMap.get(key);
      for (const socketId of socketIds) {
        io.to(socketId).emit('greetings', message);
      }
    }
  };

  async function  getNearestWorkers(workers , location){
    return new Promise((resolve, reject) => {
    const result = []
    const locationss = workers.map(worker => ({
      _id: worker._id,
      location: worker.location
  }));
  console.log("locationss:",locationss)
  const stringLocation = locationss.map(loc => `${loc.location}`).join(';');
  console.log("string location", stringLocation)

    const distanceMatrixApi =`https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=${stringLocation}&destinations=35.821575863921325,10.578255617886242&travelMode=driving&key=Ak8acI2md4vts6Wkau8r_1evGaZwBN-xgT87WyCfFLg0Z_ICnoNz0PHACm3-oMRA`
    
  const req = http.request(distanceMatrixApi, (res) => {
    let data = '';
  
    res.on('data', (chunk) => {
      data += chunk;

    });
  
    res.on('end', () => {
    // Parse the JSON response into a JavaScript object
const responseObject = JSON.parse(data);
/* creer un dictionnaire pour stocker les positions des travailleurs et les distances */

// Create an empty dictionary (object) to store the data
const originToDistanceDict = {};

// Access resourceSets if it exists
if (responseObject.resourceSets) {
    responseObject.resourceSets.forEach((resourceSet) => {
        // Access resources within the resource set if they exist
        if (resourceSet.resources) {
            resourceSet.resources.forEach((resource) => {
                // Access origins and results
                const origins = resource.origins;
                const results = resource.results;

                // Iterate through origins and results and create dictionary entries
                origins.forEach((origin, originIndex) => {
                    // Access the corresponding result for the origin
                    const result = results[originIndex];

                    // Use the origin as the key and travelDistance as the value
                    const originKey = `${origin.latitude},${origin.longitude}`;
                    const travelDistanceValue = result ? result.travelDistance : null;

                    // Add the entry to the dictionary
                    originToDistanceDict[originKey] = travelDistanceValue;
                });
            });
        }
    });
}

console.log(originToDistanceDict);
// trier les travailleurs 
const entries = Object.entries(originToDistanceDict);
entries.sort((a, b) => a[1] - b[1]);
const sortedOriginToDistanceDict = Object.fromEntries(entries);
console.log("sorted" ,sortedOriginToDistanceDict )

/* creer une liste des 5 premiers travailleurs  */
const first5LocationsList = [];

// Extract the first 5 locations from the sorted dictionary
let count = 0;
for (const origin of Object.keys(sortedOriginToDistanceDict)) {
  if (count < 5) {
    first5LocationsList.push(origin);
    count++;
  } else {
    break; // Stop iterating after the first 5 locations
  }
}

// Now, first5LocationsList contains the first 5 locations from the sorted dictionary
console.log("first5LocationsList:",first5LocationsList);

/* create a list of workerIds */
const matchingKeysList = [];

// Iterate over the map and check for matching values
locationss.forEach((worker) => {
  if (first5LocationsList.includes(worker.location)) {
    matchingKeysList.push(worker._id.toString());
  }
});

// Now, matchingKeysList contains the keys from the map whose values match the list of locations
matchingKeysList.forEach(item => {
  result.push(item);
});
resolve(matchingKeysList);
    });
    
  });
  
  req.on('error', (error) => {
    console.error(error);
    reject(error);
  });
 
  req.end();

  
});
  }
  
  function addToOnlineUsers(key, value) {
    // Check if the key already exists in the dictionary
    if (globalMap.has(key)) {
      
      const existingValues = globalMap.get(key);
      existingValues.push(value);
    }else {
      globalMap.set(key, [value]);
      }
    }


module.exports = {addToOnlineUsers , sendMessageToSocketIds , getNearestWorkers}