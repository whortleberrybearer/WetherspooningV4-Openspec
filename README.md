# Infrastructure & Setup

## Prerequisites

Before you begin, ensure you have the following tools installed:

### 1. Node.js
- Download and install the latest LTS version from: https://nodejs.org/

### 2. Firebase CLI
- Install globally using npm:
	```sh
	npm install -g firebase-tools
	```
- Docs: https://firebase.google.com/docs/cli

### 3. Google Cloud SDK (gcloud)
- Required for scripting project creation and API enablement.
- Download and install from: https://cloud.google.com/sdk/docs/install
- After installation, initialize with:
	```sh
	gcloud init
	```
- Docs: https://cloud.google.com/sdk/docs

**Note:** The script uses `gcloud beta billing` commands. Make sure the beta components are installed:
```sh
gcloud components install beta
```

Continue to the next section for project setup and automation scripts.

## Automated Project Bootstrap (PowerShell)

You can automate the creation and setup of your Firebase/GCP project using the provided PowerShell script. This script will:

- Create a new Google Cloud project
- Enable required Google APIs (Firestore, Firebase, IAM, etc.)
- Initialize Firebase
- Deploy your Firebase configuration

### Script Location
Place your script in the `scripts/` directory, e.g. `scripts/bootstrap-firebase.ps1`.

## Infrastructure Project Automation

This project includes a PowerShell script to automate the creation and setup of your Firebase/GCP project.

### Script Location
- The script is located at: `infrastructure/bootstrap-firebase.ps1`

### What the Script Does
- Creates a new Google Cloud project
- Enables required Google APIs (Firestore, Firebase, IAM, etc.)
- Initializes Firebase
- Deploys your Firebase configuration

### How to Run the Script
Open a PowerShell terminal and run:
```powershell
cd scripts
./bootstrap-firebase.ps1 -ProjectId "your-firebase-project-id" -BillingAccountId "your-billing-account-id"
```

- If you omit a parameter, the script will prompt you to enter it interactively.
- You can find your Project ID and Billing Account ID in the Google Cloud Console:
  - Project ID: https://console.cloud.google.com/cloud-resource-manager
  - Billing Account ID: https://console.cloud.google.com/billing

#### Example (with prompts):
```powershell
./bootstrap-firebase.ps1
# The script will ask for ProjectId and BillingAccountId if not provided.
```

> **Note:**
> - You must have owner permissions in your GCP organization to create projects and link billing.
> - Billing account is required for Firestore and Functions. You can omit `-BillingAccountId` if not needed.
> - The script is idempotent: it will skip steps if resources already exist.

---
> - You must have owner permissions in your GCP organization to create projects and link billing.
