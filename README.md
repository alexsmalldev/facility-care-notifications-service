# facility-care-notification-service

A serverless notification microservice extending the [Facility Care](https://github.com/alexsmalldev/facility-care) platform. Sends transactional emails to clients when their service request status changes or a comment is added to their request timeline.

---

## Features

- Event-driven email notifications triggered by SQS messages
- Emails sent via AWS SES from a verified custom domain
- Notification logs persisted to MongoDB Atlas
- Dead Letter Queue for failed message handling
- Structured JSON logging to CloudWatch
- Infrastructure as code via AWS SAM/CloudFormation

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20, TypeScript |
| Compute | AWS Lambda |
| Messaging | AWS SQS |
| Email | AWS SES |
| Database | MongoDB Atlas |
| Infrastructure | AWS SAM, CloudFormation |
| Logging | AWS CloudWatch |

## Notification Flow

1. A status change or comment is made in Facility Care
2. The Django backend publishes an event to an SQS queue
3. SQS triggers the Lambda function
4. Lambda sends a transactional email via AWS SES
5. The notification is logged to MongoDB Atlas

If processing fails, SQS retries the message up to 3 times before moving it to a Dead Letter Queue for investigation.

## Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `STATUS_CHANGED` | Admin updates request status | Customer |
| `COMMENT_ADDED` | Admin or customer adds a timeline comment | Customer or Admin |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FROM_EMAIL` | Verified SES sender address |

Both are stored securely in AWS Parameter Store and resolved at deploy time.

## Deployment

### Prerequisites

- AWS CLI configured
- AWS SAM CLI installed
- Node.js 20

### Deploy

```bash
sam build
sam deploy --guided
```

### Running Tests

```bash
cd notification-handler
npm run test
```
