# sportradar-advanced-challenge

## Tech Stack
- Express
- PostgreSQL
- TypeScript
- TypeORM
- Cron
- Sinon
- Jest

## How to run

- Clone this repository
- Rename `.env.example` to `.env`
- Install node modules: `yarn install`
- Migrate database schemas: `yarn migrate`
- Start project: `yarn start`

## Endpoints

- GET: http://locahost:3000/jobs/ Returns a list of jobs in the queue.
- GET: http://locahost:3000/games/ Returns a list of games.
- GET: http://locahost:3000/games/:id/ Returns a game info
- GET: http://locahost:3000/games/:gameId/players/:playerId/ Return a player's stats in the game
- GET: http://localhost:3000/players/:playerId/games/:gameId/ Return a player's stats in the game
- GET: http://localhost:3000/players/:playerId/games Return player's games stats

## How to test
- Run `yarn test` command in the terminal
