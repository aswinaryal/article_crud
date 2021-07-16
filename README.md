# article_crud

Restful API for CRUD application using expressJs framework that has following features. - Logged in users can create, delete and update their article - Public user can read the article

## Installation and setup steps

### prerequisites:

Docker & Docker compose tools.

### steps inside project directory:

- generate .env file using .env.example, all the environment variables as placed there as example. (no vulnerable info's to hide)

- start all the services as container in detached mode
  `docker-compose up -d --build `
- verify all the docker images are running successfully using command
  `docker ps `
- Check running containers logs using (Optional)
  ` docker logs container_id`

- Generate article and user table inside local dynamodb using following endpoint: (Just to make table creation process a bit easier, i've exposed table creation mechanism via APIs endpoint rather than script to run.)

  `GET: localhost:3000/api/v1/articles/create-articles-table`

  `GET: localhost:3000/api/v1/users/create-user-table `

- signup user
- login user
- start testing endpoints:
- postman collection will be provided to test.
