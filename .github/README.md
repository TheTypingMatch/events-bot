# Events Bot
A Discord.js bot for hosting typing tournaments in TheTypingMatch community Discord.

## Contribute
1. Fork the repository
2. Clone the repository & install required dependencies:
```
$ git clone git@github.com:YOUR_GITHUB_USERNAME/events-bot.git
$ yarn install
```

**Local Bot Development Setup**
<br>
Testing the application using a database on your own machine will require a localhost database setup:

1. Create a `.env` in the root directory of the repository.
2. Inside of the `.env` file, include the following:
```
TOKEN="<token>"
URI="<uri>"
```
Replace `<uri>` and `<token>` with your MongoDB database connection URI and bot token.

**Running The Bot**
```
yarn build
yarn start
```
...or alternatively:
```
cd scripts
sh start.sh
```
...or on Windows:
```
cd scripts
start
```
