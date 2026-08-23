# EventPulse API

EventPulse is a Node.js backend for discovering events, registering attendees, managing administrator announcements, and delivering event-room updates in real time.

## GitHub Repository

[View the EventPulse API repository on GitHub](https://github.com/marwansherif21/eventpulse-backend)

## Tech Stack

- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT and bcryptjs authentication
- Socket.io real-time announcements
- Swagger UI and OpenAPI
- Jest and Supertest

## Local Installation

```bash
git clone https://github.com/marwansherif21/eventpulse-backend.git
cd eventpulse-backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/eventpulse
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Start MongoDB, then seed sample data and run the API:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:3000`. Production-style startup uses `npm start`.

The development seed creates an admin account: `admin@eventpulse.com` with password `Admin123!`. Change or remove these development credentials before production use.

## Documentation

- Swagger UI: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`
- Postman collection: [postman/EventPulse.postman_collection.json](postman/EventPulse.postman_collection.json)
- Postman environment: [postman/EventPulse.postman_environment.json](postman/EventPulse.postman_environment.json)

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Runtime and database health status |
| POST | `/api/auth/register` | Register an attendee account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/events` | List, filter, search, sort, and paginate events |
| GET | `/api/events/:id` | Get one event with populated references |
| POST | `/api/events` | Create an event as an admin |
| PATCH | `/api/events/:id` | Update an event as an admin |
| DELETE | `/api/events/:id` | Delete an event as an admin |
| POST | `/api/registrations` | Register the logged-in attendee for an event |
| GET | `/api/registrations/my` | List the attendee's registrations |
| DELETE | `/api/registrations/:id` | Cancel an owned registration |
| GET | `/api/announcements/:eventId` | Read chronological event announcements |
| POST | `/api/announcements` | Publish an admin announcement to an event room |
| WebSocket | `join-event` | Join a Socket.io event room |

Write endpoints require `Authorization: Bearer <token>`. Event creation, updates, deletion, and announcements also require the `admin` role.

## MongoDB Atlas

Create an M0 cluster, database user, and a Network Access entry for the deployment environment. Set the Atlas connection string as `MONGO_URI` in Vercel environment variables. Never commit `.env` or database credentials.

## Vercel Deployment

Import the public GitHub repository into Vercel and configure:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV=production`

The repository includes `vercel.json` for the Node serverless entrypoint. After deployment, verify:

```text
https://<your-vercel-domain>/health
https://<your-vercel-domain>/api-docs
```

Live deployment URL: **Set this after the Vercel deployment is created.**

### Socket.io Hosting Note

The HTTP API is Vercel-compatible. Socket.io requires a persistent WebSocket-capable process, so run the realtime server (`npm start`) on a long-running host such as Render, Railway, or Fly.io, or use a managed realtime provider. Point clients at that realtime server while using the Vercel URL for HTTP requests.

## Testing

```bash
npm test
```

The test suite covers `AppError`, `asyncHandler`, validation, authentication guards, and Events API request flows.

## Release Workflow

Use Conventional Commits such as `feat: add event registrations` and `test: cover event validation`. From a configured Git repository, create the release tag with:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

Keep `.env` private and confirm repository visibility is Public before submission.
