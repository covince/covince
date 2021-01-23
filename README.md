# Covid-19 Web app

## Install the app (first time)

1. Clone the repository
2. Build the docker images

```
docker-compose up -d --build
```

3. Initialise the databse

```
docker-compose exec web python app/config.py
```

4. Populate the databse with example data

Switch into the `services/populate` folder and execute

```
python populate.py
```

The react front end should run on `localhost:3007` and the FastAPI backend `localhost:8002`.

## Useful commands

### General

Build the docker image(s)

```
docker-compose build
```

Run the docker containers (the `-d` flag runs docker in the background)

```
docker-compose up -d
```

Rebuild the image and run it

```
docker-compose up -d --build
```

### Database

Access the the database via `psql`

```
docker-compose exec web-db psql -U postgres
```

Initialise DB

```
docker-compose exec web python app/config.py
```

### Testing

Run tests

```
docker-compose exec web python -m pytest
```

### Linting

Flake8

```
docker-compose exec web flake8 .
```

Code formatting with Black

```
docker-compose exec web black . --diff # just checks the code
docker-compose exec web black . # formats code
```
