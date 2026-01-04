param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    [string]$BillingAccountId
)

# 1. Create GCP project
Write-Host "Creating GCP project: $ProjectId"
gcloud projects create $ProjectId

# 2. Link billing account (required for Firestore/Functions)
if ($BillingAccountId) {
    Write-Host "Linking billing account: $BillingAccountId"
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
    Write-Host "Enabling API: $api"
    gcloud services enable $api --project $ProjectId
}

# 4. Add Firebase to project
Write-Host "Adding Firebase to project: $ProjectId"
firebase projects:addfirebase $ProjectId

# 5. Initialize Firestore (in native mode, region europe-west2)
Write-Host "Creating Firestore database in europe-west2"
gcloud firestore databases create --project $ProjectId --region=europe-west2

# 6. Deploy Firebase config (from repo root)
Write-Host "Deploying Firebase configuration"
firebase deploy --project $ProjectId
