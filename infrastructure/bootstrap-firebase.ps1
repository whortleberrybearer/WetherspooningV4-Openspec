
param(
    [string]$ProjectId,
    [string]$BillingAccountId
)

# Prompt for ProjectId if not provided
if (-not $ProjectId) {
    Write-Host "You are about to create a new Google Cloud project. Choose a unique Project ID (e.g. wetherspooning-live)."
    Write-Host "Project IDs must be globally unique and cannot be changed later."
    $ProjectId = Read-Host "Enter a new Google Cloud Project ID to create"
}

# 1. Create GCP project
Write-Host "Creating GCP project: $ProjectId"
gcloud projects create $ProjectId

# Prompt for BillingAccountId if not provided
if (-not $BillingAccountId) {
    Write-Host "You can find your Billing Account ID in the Google Cloud Console: https://console.cloud.google.com/billing"
    Write-Host "Look for a string like 01A2B3-456C78-90D1EF under 'Account Management' or 'My Billing Accounts'."
    $BillingAccountId = Read-Host "Enter your Billing Account ID (or leave blank to skip linking billing)"
}

# 2. Link billing account (required for Firestore/Functions)
if ($BillingAccountId) {
    Write-Host "Linking billing account: $BillingAccountId"
    gcloud beta billing projects link $ProjectId --billing-account $BillingAccountId
}

# 3. Enable required APIs
$apis = @(
    'cloudresourcemanager.googleapis.com',            # Project/resource management
    'firebase.googleapis.com',                        # Firebase core services
    'firestore.googleapis.com',                       # Firestore database
    'iam.googleapis.com',                             # Identity and Access Management
    'cloudfunctions.googleapis.com',                  # Cloud Functions
    'identitytoolkit.googleapis.com',                 # Firebase Authentication
    'maps-backend.googleapis.com',                    # Maps JavaScript API
    'geocoding-backend.googleapis.com',               # Geocoding API
    'places-backend.googleapis.com'                   # Places API (New)
)
foreach ($api in $apis) {
    Write-Host "Enabling API: $api"
    gcloud services enable $api --project $ProjectId
}


# 4. Add Firebase to project
Write-Host "Adding Firebase to project: $ProjectId"
$firebaseLoginCheck = firebase login:list 2>&1
if ($firebaseLoginCheck -match "No authorized accounts") {
    Write-Host "No Firebase CLI authentication found. Launching 'firebase login'..."
    firebase login
}
firebase projects:addfirebase $ProjectId

# 5. Initialize Firestore (in native mode, location europe-west2)
Write-Host "Creating Firestore database in europe-west2"
gcloud firestore databases create --project $ProjectId --location=europe-west2

