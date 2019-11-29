# projectPlanner
As part of a job application, I am building a REST api to be used at the marketplace for contractors. The market place allows the clients to post jobs, while contractors can bid for projects. Key requirements are that the API can:
* Create a Project.
* Get a Project.
* Get the lowest bid amount for a project, which should be calculated efficiently.
* Add new bid.

# Tech Stack
## MongoDB
MongoDB is a non-relational database, which stores objects (documents). The data objects are stored as separate documents inside a collection — instead of storing the data into the columns and rows of a traditional relational database.  Data is represented in JSON. No joins allows you the freedom to grab all data in one query instead of multiple queries with SQL relational databases. At the same time, it can also create relationships with object embedding or object referencing. Its native scale-out architecture, enabled by auto ‘sharding,’ aligns well with the horizontal scaling and agility afforded by cloud computing. Sharding essentially means distributing the data  records across multiple machines on multiple servers rather than a single server hosting the entire database.
## Express 
Express is a server side web application framework for Node.js, released as free and open-source software under the MIT License. It is designed for building web applications and APIs. It has been called the de facto standard server framework for Node.js Express is preferred because it adds dead simple routing, support for handling requests and views, support for Connect middleware, and allowing many other extensions and useful features. 
## NodeJS 
A run time environment that allows JavaScript to be ran in the back-end.  This is especially useful when the front-end application is also written in JavaScript using more of the popular front end frameworks such as Angular and React.  Since the whole application front end back is one language, it allows developers to be more uniformed in coding style and format and more well versed in dealing with all aspects of the application. NodeJS is non-blocking meaning multiple things could be happening at the same time, it does not wait for the callback to complete. It runs on a V8 engine that also processes C++ code behind the scenes to manage other events.
### REST API
Representational State Transfer is nothing more than what the server will transfer back to the client a representation of the state of the requested resource.  

Local Development domain name is: `localhost:3000`

For our application, our resource endpoints and methods are the following:

### Public Routes
* POST https://`domainName`/users/create 
    * Registers a user. Type:`1` contractors, Type: `2` clients
      ```
      {
       "firstName": "{firstName}",
       "lastName": "{lastName}",
       "email": "{email}",
       "password": "{password}",
       "type": "{type}"
      }
      
    
* POST https://`domainName`/users/authenticate 
    * Authenticates a user.
      ```
      {
      "password":"{password}",
      "email":"{email}"
      }

### Private Routes
The following routes require token authorization that comes from authenticating the user.  

Request headers need to be passed `'x-access-token'` with the value of the token from authenticating a user.

Example: `'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ4kE5_ioAoIE'`

* POST https://`domainName`/projects 
    * Creating a new project.
    Example:
      ```
      {
       "name": "{projectName}",
       "description": "{description}",
       "budget": {number},
       "date": "{mm/dd/yyyy}"
      }
    
* GET https://`domainName`/projects 
    * Retrieving all projects
    
* GET https://`domainName`/projects/:projectId 
    * Retrieving a single Project with a project id in the parameters. Project Object includes lowest currentBid and currentBidder.
    
* PUT https://`domainName`/projects/:projectId 
    * Updates a project details
    
* PUT https://`domainName`/projects/bid/:projectId 
    * Places the lowest min bid on a project that a contractor is willing to work.
    
* DELETE https://`domainName`/projects/:projectId 
    * Deletes a project with a project id.
    

    
## Promises 
Promises were used instead of callbacks because of its ability to easily chain asynchronous calls and help with nested callbacks which makes the code much more readable.  Also by chaining asynchronous calls, it is possible to catch all the errors in one catch statement.

# Application Features
## Auto-Bid Logic with Fast Exits
* Project contains ‘currentBid’ field, which displays the current lowest winning bid for the project.
* Project also contains ‘currentBidder’ field, which also displays the details of the winning currentBidder and their absolute lowest minimum bid for the project.  This bid can be equal to or less than the currentBid, in other words, the current winning bid for the project.
* If the bid placed is greater than the budget, or bid date is greater than the project due date, then we fail placing the bid the return.
* If there isn't a project current bid, we set the first bid to be the winning current bid and current bidder.
* As subsequent bids are placed, we compare each bid placed to the currentBid (the current winning bid) and then to the currentBidder’s minimumBid (the lowest bid current winning bidder made).
* If the bid is less in both cases, then we have a new currentBid and currentBidder for the project.
* If the bid is less than the currentBid, but not lower than the absolute lowest of the currentBidder’s lowest bid minBid, then we set the currentBid to the bid made.
* If current bid is not lower than the current bid, then we fail placing the bid, and return.
* Any successful bids are pushed into the bid history array and the project object saved.


A few interesting things I added:

## User Type
By destinguishing the user model with a type field, we can add extra controls to our APIs and make certain CRUD operations in the back-end only available to Clients (type:2) as opposed to Contractors (type: 1).  
User type checks implemented:
* Contractor should not be able to create, delete, or update projects.  
* A client should not be able to place bids on other projects.  
* A contractor should also not be able to see the lowest bid from a user, only the current lowest winning bid.
The user type will also be critical in the application's front-end functionality for defining what views, buttons, and pages are available for the user.  

## Bid History
On the project model, I added a field called bidHistory, which is simply an array of objects that we are able to query for all history of bid objects placed against the projects.  Since this field embedded inside the project object, only one query is necessary to grab the history. I have added this operation at the end of every addBid method.  For the front-end application, this will be important for analytics dashboards very informational for the user if he would like to know what kind of bids are being placed, by whom, and at what rate, etc.

## JWT Token Authorizations for Security
* On registration, a user is generated a token that is signed with the server’s secret key and is tied to the logged in user’s userId and type. 
* The token is set to expire in one hour in case it was somehow stolen.  
* Upon any subsequent private api calls, the token must be present in the headers as the key ‘x-access-token’ and verified against the server’s secret key where it would be decoded to attach the userId and type to the request body for any API endpoint call.  
* Thus, when perofrming an api call to delete or update a project, there is a check with the request body's userId against the userId of the target object for an additional layer of security.  
* For this exercise, the server’s secret key is in plain view on the secret.env file.  This would typically not be present and added to the .gitignore file, but was done to demonstrate a working application upon submission.

## Production Ready
Security is a big thing for this API to be production ready. For this application to be production ready, I would generate the secret key to be added to a .env file where it would be added to the .gitignore.  This .env file would be encrypted and sent over to the application’s developer for safekeeping and deployment on their environment. There should be ways to address logging out of the application by removing the token from the client in the front-end.
 
In addition, writing unit test cases for each controller method is necessary to test all Input/Output of the system.  Every if statement to be tested along with every expected output. All scenarios of missing data, data types, should be tested as well. Jest test cases would have to be written for each controller method and these are to be queued to ran every time a production build occurs.

## Testing
Pseudo-code testing can be found in the unit-test folder.  In a nutshell, I test for input and outputs and check all if statements for both positives and negative outcomes, and check that against the expected status messages
