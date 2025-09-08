# AWS Deployment Configuration Guide

## Prerequisites

1. **AWS RDS MySQL Database** - Already created
2. **AWS Elastic Beanstalk Application** - Already created
3. **VPC and Security Groups** configured properly

## Step-by-Step Configuration

### 1. RDS Database Security Group
Your RDS database must allow inbound connections from your Elastic Beanstalk instances:

- **Inbound Rule**: MySQL/Aurora (Port 3306)
- **Source**: Security Group of your EB instances OR the VPC CIDR block

### 2. Elastic Beanstalk Security Group
Your EB instances need outbound access to RDS:

- **Outbound Rule**: MySQL/Aurora (Port 3306) to RDS Security Group

### 3. Environment Variables in Elastic Beanstalk Console

Go to your EB environment → Configuration → Software → Environment Properties and add:

```
NODE_ENV=production
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=wedding_invitation_db
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_MESSAGING_SERVICE_SID=your-messaging-service-sid
WEDDING_INVITATION_CONTENT_SID=your-content-sid
WEDDING_WEBSITE_URL=https://your-wedding-website.com
```

### 4. Update VPC Configuration

In `.ebextensions/02-vpc.config`, replace these placeholders:

- `vpc-xxxxxxxx` → Your VPC ID
- `subnet-xxxxxxxx,subnet-yyyyyyyy` → Your private subnet IDs (for instances)
- `subnet-xxxxxxxx,subnet-yyyyyyyy` → Your public subnet IDs (for load balancer)
- `sg-xxxxxxxx` → Your security group ID

### 5. Deploy Commands

```bash
# Initialize EB (if not done)
eb init

# Create environment (if not done)
eb create wedding-api-prod

# Deploy
eb deploy

# Check status
eb status

# View logs
eb logs
```

### 6. Database Migration

The deployment will automatically run migrations via the container command in `03-node-setup.config`.

If you need to run migrations manually:
```bash
eb ssh
cd /var/app/current
npx sequelize-cli db:migrate
```

## Important Security Notes

1. **Never commit sensitive data** (passwords, tokens) to your repository
2. **Use IAM roles** for EC2 instances to access other AWS services
3. **Enable SSL/TLS** for RDS connections (already configured in database.js)
4. **Use VPC** for network isolation
5. **Configure proper security groups** with minimal required access

## Troubleshooting

### Connection Issues
- Check security groups allow traffic between EB and RDS
- Verify RDS endpoint and credentials
- Check VPC routing

### Deployment Issues
- Check EB logs: `eb logs`
- Verify all environment variables are set
- Check Node.js version compatibility

### Database Issues
- Ensure RDS is in the same VPC as EB
- Check database user permissions
- Verify database name exists
