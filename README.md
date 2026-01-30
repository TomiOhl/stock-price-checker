# Stock Price Checker

## Description

A simple [Nest](https://github.com/nestjs/nest) application that provides a way to check stock prices and calculates the moving average of recent price records.

### Project setup

Install dependencies:

```bash
$ npm install
```

Create a file named `.env` and fill in the environment variables based on [`.env.example`](.env.example).

## Run everything in Docker

Run this command to start the database and the app:

```bash
$ docker compose up --build
```

## Run the app locally

### Start a database

Spin up a local PostgreSQL database:

```bash
$ docker compose -f docker-compose-local.yml up
```

Init the database:

```bash
$ npx prisma db push
```

### Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API docs

A Swagger UI is available at [`localhost:3000/api`](http://localhost:3000/api).

## Run tests

In order to run the tests, make sure you have a running local database (see the [Start a database](#start-a-database) section above).

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```
