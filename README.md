
# List Folders (Node.js version)

*See [`small-projects`](https://github.com/mortalis13/small-projects/tree/master/list-folders/node-js) repository `list-folders/node-js` folder*

## Requirements

1. MySQL server running and database `list_folders_node` created.  
Use `add/db.sql` file to create database with needed structure. To rename database go to `includes/database.js` and edit `database` property in the `mysql.createConnection()` call.
2. [Node.js](http://nodejs.org/) to start the HTTP server.
3. To export folder structure `export` folder and all its subfolders should exist.


## Run

1. Open command line.
2. Enter `cd list-folders` (or other folder you copied to).
3. Enter `npm install`.
4. Enter `node q`.
5. Wait until the message "Listening to port 3000 ..." appears.
6. Open URL in the browser `localhost:3000`.
7. The page with form should appear.


## Node Dependencies

1. [jquery](https://www.npmjs.com/package/jquery)
2. [jsdom](https://www.npmjs.com/package/jsdom)
3. [mysql](https://www.npmjs.com/package/mysql)
4. [open](https://www.npmjs.com/package/open)

## Problems

1. If the following error occurs on `node q` command when the server starts:

    Unexpected token ILLEGAL

for the `jsdom.js` file which creates `throw` statement

    `throw new RangeError(Invalid parsingMode option`

then go to `node_modules/jsdom/lib` and edit `jsdom.js`: replace backticks with single quotes.

2. PHP version problems with encoding (russian/spanish) seem to not appear in Node.js version.

