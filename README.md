# Cron Service Documentation

This README provides detailed instructions on how to set up and use the Cron Service for scheduling tasks. The service allows you to define cron jobs that execute at specified times by sending API requests to a designated endpoint.

## Features

- Schedule cron jobs with customizable times and intervals.
- Supports HTTP/HTTPS API calls with headers and payloads.
- Logs the history of cron executions.
- Allows enabling/disabling jobs dynamically.

## Prerequisites

Before using the Cron Service, ensure the following requirements are met:

1. **Node.js Installed**: The service requires Node.js version 14.x or higher.
2. **Environment Variables**:
   - `TRIGGER_API_KEY`: The API key used for authenticating requests.
   - `DATABASE_URL`: Connection string for the database used to store cron job data.
3. **Database Setup**: The service uses a database (PostgreSQL or any supported database). Make sure the database is running and the schema is applied.
4. **Dependencies Installed**: Run `npm install` to install required packages.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd cron-service
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an `.env` file and add the following variables:

   ```env
   TRIGGER_API_KEY=your-api-key
   DATABASE_URL=your-database-connection-string
   ```

4. Set up the database by running migrations:

   ```bash
   npm run migrate
   ```

## Usage

### Adding a Cron Job

To add a new cron job, provide the following data:

- `id` (string): A unique identifier for the job.
- `name` (string): A descriptive name for the job.
- `triggerUrl` (string): The API endpoint to be triggered.
- `apiKey` (string): The API key for authentication.
- `schedule` (string): Cron expression defining the execution schedule.
- `startDate` (ISO string): The start time of the job.
- `isActive` (boolean): Indicates whether the job is active.

### Example Request

You can add a cron job using an HTTP client like Postman or curl:

```bash
curl -X POST https://example.com/api/v1/cron-jobs \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <TRIGGER_API_KEY>" \
-d '{
  "id": "unique-job-id",
  "name": "Daily Backup",
  "triggerUrl": "https://example.com/api/v1/trigger-backup",
  "apiKey": "12345-ABCDE",
  "schedule": "0 0 * * *",
  "startDate": "2025-01-26T00:00:00.000Z",
  "isActive": true
}'
```

### Running the Service

Start the service with the following command:

```bash
npm run start
```

### Logs and Monitoring

- **Execution Logs**: Check cron execution logs in the console or in the database.
- **Error Handling**: Errors are logged with detailed messages for debugging.

### Updating a Cron Job

To update an existing cron job, use the `/api/v1/cron-jobs/:id` endpoint with the desired fields.

### Disabling a Cron Job

You can disable a cron job by setting `isActive` to `false` using the update API.

## Testing the Service

Run tests to verify the service:

```bash
npm run test
```

## Example Cron Expression

Here are some sample cron expressions you can use:

- `0 9 * * *`: Runs every day at 9:00 AM.
- `*/5 * * * *`: Runs every 5 minutes.
- `30 22 * * 1-5`: Runs at 10:30 PM, Monday through Friday.

## API Endpoints

### 1. Add a Cron Job

- **Endpoint**: `/api/v1/cron-jobs`
- **Method**: POST

### 2. List All Cron Jobs

- **Endpoint**: `/api/v1/cron-jobs`
- **Method**: GET

### 3. Update a Cron Job

- **Endpoint**: `/api/v1/cron-jobs/:id`
- **Method**: PATCH

### 4. Delete a Cron Job

- **Endpoint**: `/api/v1/cron-jobs/:id`
- **Method**: DELETE

### 5. View Cron Job Execution History

- **Endpoint**: `/api/v1/cron-jobs/:id/history`
- **Method**: GET

## Troubleshooting

- Ensure the `TRIGGER_API_KEY` is correctly set and matches the API's requirement.
- Verify the cron expression syntax using an online validator.
- Check the database connection and logs for potential issues.

## Contributing

Feel free to fork the repository and submit pull requests for enhancements or bug fixes.

## License

This project is licensed under the MIT License.

---

For further assistance, contact the development team at [support@example.com](mailto\:support@example.com).


