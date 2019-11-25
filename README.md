# projectPlanner
As part of a job application, I am building a REST api to be used at the marketplace for contractors. The market place allows the clients to post jobs, while contractors can bid for projects. 

# Tech Stack
    ### MongoDB
MongoDB is a non-relational database, which stores objects (documents). The data objects are stored as separate documents inside a collection — instead of storing the data into the columns and rows of a traditional relational database.  Data is represented in JSON. No joins allows you the freedom to grab all data in one query instead of multiple queries with SQL relational databases. At the same time, it can also create relationships with object embedding or object referencing. Its native scale-out architecture, enabled by auto ‘sharding,’ aligns well with the horizontal scaling and agility afforded by cloud computing. Sharding essentially means distributing the data  records across multiple machines on multiple servers rather than a single server hosting the entire database.
    ### Express 
Express is a server side web application framework for Node.js, released as free and open-source software under the MIT License. It is designed for building web applications and APIs. It has been called the de facto standard server framework for Node.js Express is preferred because it adds dead simple routing, support for handling requests and views, support for Connect middleware, and allowing many other extensions and useful features. 
## NodeJS 
A run time environment that allows JavaScript to be ran in the back-end.  This is especially useful when the front-end application is also written in JavaScript using more of the popular front end frameworks such as Angular and React.  Since the whole application front end back is one language, it allows developers to be more uniformed in coding style and format and more well versed in dealing with all aspects of the application. NodeJS is non-blocking meaning multiple things could be happening at the same time, it does not wait for the callback to complete. It runs on a V8 engine that also processes C++ code behind the scenes to manage other events.
### REST API
Representational State Transfer is nothing more than what the server will transfer back to the client a representation of the state of the requested resource.  For our application, our endpoints and methods are the following:
* POST https://www.websitename.com/projects 
    * Creating a new project.
* GET https://www.websitename.com/projects 
    * Retrieving all projects
* GET https://www.websitename.com/projects/:projectId 
    * Retrieving a single Project with a project id in the parameters. Project Object includes lowest currentBid and currentBidder.
* PUT https://www.websitename.com/projects/:projectId 
    * Updates a project details
* PUT https://www.websitename.com/projects/bid/:projectId 
    * Places the lowest min bid on a project that a contractor is willing to work.
* DELETE https://www.websitename.com/projects/:projectId 
    * Deletes a project with a project id.
* POST https://www.websitename.com/users/create 
    * Registers a user.
* POST https://www.websitename.com/users/authenticate 
    * Authenticates a user.
    
## Promises 
Promises were used instead of callbacks because of its ability to easily chain asynchronous calls and avoid nested callbacks, therefore, making the code much more readable.  By chaining asynchronous calls, we can catch all the errors in one catch statement.

## Auto-Bid Logic
* Project contains ‘currentBid’ field, which displays the current lowest winning bid for the project.
* Project also contains ‘currentBidder’ field, which also displays the details of the winning currentBidder and their absolute lowest minimum bid for the project.  This bid can be equal to or less than the currentBid, in other words, the current winning bid for the project.
* As subsequent bids are placed, we compare each bid placed to the currentBid (the current winning bid) and then to the currentBidder’s minimumBid (the lowest bid current winning bidder made).
* If the bid is less in both cases, then we have a new currentBid and currentBidder for the project.
* If the bid is less than the currentBid, but not lower than the absolute lowest of the currentBidder’s lowest bid minBid, then we set the currentBid to the bid made.

A few interesting things I added:

## User Type
By destinguishing the user model with a type field, we can add extra controls to our APIs and make certain CRUD operations in the back-end only available to Clients vs Contractors.  Currently, when deleting or updating a project, I have a check to see if the current logged in user’s id matches the one that created the project.  There are also additional checks on user type:1 (contractors) and user type: 2 (clients). For example, a Contractor should not be able to create, delete, or update projects.  A client should not be able to place bids on other projects.  The user type will also be critical in the front-end application for defining what views, buttons, and pages are available for the user.  If the user is a client vs a contractor, he may get an entirely different view and front-end functionality.

## Bid History
On the project model, I added a field called bidHistory, which is simply an array of objects that we are able to query for all history of bid objects placed against the projects.  Since this field embedded inside the project object, only one query is necessary to grab the history. I have added this operation at the end of every addBid method.  For the front-end application, this will be important for analytics dashboards very informational for the user if he would like to know what kind of bids are being placed, by whom, and at what rate, etc.

## JWT Tokens Authorization
On registration, a user is generated a token that is signed with the server’s secret key that is also tied to the logged in user’s user id and type. The token is set to expire in one hour.  Upon any subsequent private api calls, the token must be present in the headers as the key ‘x-access-token’ and verified against the server’s secret key where it would be decoded to attach the user id and type to the request body for API endpoint call.  For this exercise, I have added the server’s secret key in plain view on the secret.env file.  This would typically not be present and added to the .gitignore file, but was done to demonstrate a working application upon submission.

## Production Ready
Security is a big thing for this API to be production ready. For this application to be production ready, I would generate the secret key to be added to a .env file where it would be added to the .gitignore.  This .env file would be encrypted and sent over to the application’s developer for safekeeping and deployment on their environment. There should be ways to address logging out of the application by removing the token from the client in the front-end.
 
In addition, writing unit test cases for each controller method is necessary to test all Input/Output of the system.  Every if statement to be tested along with every expected output. All scenarios of missing data, data types, should be tested as well. Jest test cases would have to be written for each controller method and these are to be queued to ran every time a production build occurs.

## Testing
Pseudo-code testing can be found in the unit-test folder.  In a nutshell, I test for input and outputs and check all if statements for both positives and negative outcomes, and check that against the expected status messages
