# URL Shortener

A scalable serverless URL shortening application built with AWS Lambda, DynamoDB, and hosted static frontend on AWS S3. This project includes automated CI/CD using GitHub Actions for seamless frontend deployments.

---

## Tech Stack

- **Backend:** AWS Lambda (Node.js, TypeScript)
- **Database:** AWS DynamoDB
- **Frontend:** Static HTML, CSS, and JavaScript hosted on AWS S3
- **DevOps:** GitHub Actions for CI/CD, AWS CLI, AWS IAM, CloudWatch Logs for monitoring

---

## Features

- Generate shortened URLs with unique codes
- Redirect short URLs to original long URLs
- Serverless architecture for scalability and cost efficiency
- Static frontend deployed and hosted on S3
- Automated frontend deployment on every push to `main` branch using GitHub Actions
- Centralized logging and error monitoring via AWS CloudWatch

---

## Setup & Installation

### Backend

1. **Configure AWS credentials:**  
   Ensure your AWS credentials are set in your environment (e.g., via `~/.aws/credentials` or environment variables).

2. **Set environment variables:**  
   - `AWS_REGION` (e.g., `us-east-1`)  
   - `TABLE_NAME` (DynamoDB table for storing URLs)

3. **Deploy Lambda functions:**  
   Use your preferred deployment method (AWS CLI, CDK, SAM, or manual console upload).

### Frontend

1. **Create an S3 bucket:**  
   - Region should match backend AWS region  
   - Enable static website hosting  
   - Configure bucket policy to allow public read access  

2. **Upload frontend files:**  
   - `index.html`  
   - `styles.css`  
   - `script.js`

3. **Automate deployment:**  
   - Add AWS credentials as GitHub secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)  
   - Use the included GitHub Actions workflow in `.github/workflows/frontend-deploy.yml` to automatically sync frontend files on push to `main`

---

## Usage

- **Create Short URL:**  
  POST request to Lambda endpoint with JSON body `{ "url": "https://example.com" }`  
  Returns a short code and original URL.

- **Redirect:**  
  Access short URL via path parameter to get redirected to the original URL.

---

## Monitoring & Troubleshooting

- AWS CloudWatch Logs are enabled on Lambda functions to capture detailed invocation and error logs.  
- Use CloudWatch Logs Insights or AWS Console to debug and monitor runtime issues.

---

## Contributing

Contributions and improvements are welcome! Please open an issue or submit a pull request.

---

## License

MIT License © [Your Name or Company]

