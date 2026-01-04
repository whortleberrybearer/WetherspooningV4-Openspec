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

Continue to the next section for project setup and automation scripts.

## Automated Project Bootstrap (PowerShell)

You can automate the creation and setup of your Firebase/GCP project using the provided PowerShell script. This script will:

- Create a new Google Cloud project
- Enable required Google APIs (Firestore, Firebase, IAM, etc.)
- Initialize Firebase
- Deploy your Firebase configuration

### Script Location
Place your script in the `scripts/` directory, e.g. `scripts/bootstrap-firebase.ps1`.

### Example Script
```powershell
param(
	[Parameter(Mandatory=$true)]
	[string]$ProjectId,
	[string]$BillingAccountId
)

# 1. Create GCP project
gcloud projects create $ProjectId

# 2. Link billing account (required for Firestore/Functions)
if ($BillingAccountId) {
	gcloud beta billing projects link $ProjectId --billing-account $BillingAccountId
}

# 3. Enable required APIs
$apis = @(
	'cloudresourcemanager.googleapis.com',
	'firebase.googleapis.com',
	'firestore.googleapis.com',
	'iam.googleapis.com',
	'cloudfunctions.googleapis.com',
	'identitytoolkit.googleapis.com'
)
foreach ($api in $apis) {
	gcloud services enable $api --project $ProjectId
}

# 4. Add Firebase to project
firebase projects:addfirebase $ProjectId

# 5. Initialize Firestore (in native mode, region europe-west2)
gcloud firestore databases create --project $ProjectId --region=europe-west2

# 6. Deploy Firebase config (from repo root)
firebase deploy --project $ProjectId
```

### Usage
```powershell
cd scripts
./bootstrap-firebase.ps1 -ProjectId "your-firebase-project-id" -BillingAccountId "your-billing-account-id"
```

> **Note:**
> - You must have owner permissions in your GCP organization to create projects and link billing.
> - Billing account is required for Firestore and Functions. You can omit `-BillingAccountId` if not needed.
> - The script is idempotent: it will skip steps if resources already exist.

---
# Wetherspooning

Wetherspooning is a website that displays the locations of Wetherspoons pubs and allows users to track visits to them.

## Features

- **Pub Location Map** - Interactive map showing all Wetherspoon's pub locations
- **Visit Tracking** - Track which pubs you've visited
- **User Authentication** - Secure login and signup with Firebase Auth
- **Automated Data Sync** - Daily scheduled sync of pub data from Wetherspoon's website

## Project Structure

- `/Wetherspooning` - Vue.js frontend application
- `/functions` - Firebase Cloud Functions for backend services ([README](functions/README.md))
- `/openspec` - Project specifications and change proposals

## Getting Started

See the [functions README](functions/README.md) for information about the scheduled pub sync feature.
