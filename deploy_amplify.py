"""
NeuroCodeAI - Deploy frontend to AWS Amplify
Usage: python deploy_amplify.py
"""
import boto3
import zipfile
import os
import io
import time

REGION = "us-east-1"
APP_NAME = "NeuroCodeAI"
BRANCH_NAME = "main"
DIST_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")


def create_zip(dist_dir):
    """Zip the dist directory contents."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(dist_dir):
            for f in files:
                full = os.path.join(root, f)
                arcname = os.path.relpath(full, dist_dir)
                zf.write(full, arcname)
    buf.seek(0)
    return buf


def main():
    amplify = boto3.client("amplify", region_name=REGION)

    # 1. Check for existing app or create new one
    apps = amplify.list_apps()["apps"]
    existing = [a for a in apps if a["name"] == APP_NAME]

    if existing:
        app_id = existing[0]["appId"]
        print(f"Using existing Amplify app: {app_id}")
    else:
        resp = amplify.create_app(
            name=APP_NAME,
            platform="WEB",
            environmentVariables={
                "VITE_API_URL": "http://localhost:8000",
            },
            customRules=[
                {
                    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
                    "target": "/index.html",
                    "status": "200",
                },
            ],
        )
        app_id = resp["app"]["appId"]
        print(f"Created Amplify app: {app_id}")

    # 2. Create branch if it doesn't exist
    try:
        amplify.get_branch(appId=app_id, branchName=BRANCH_NAME)
        print(f"Branch '{BRANCH_NAME}' exists")
    except amplify.exceptions.NotFoundException:
        amplify.create_branch(appId=app_id, branchName=BRANCH_NAME)
        print(f"Created branch '{BRANCH_NAME}'")

    # 3. Create deployment
    deployment = amplify.create_deployment(appId=app_id, branchName=BRANCH_NAME)
    job_id = deployment["jobId"]
    upload_url = deployment["zipUploadUrl"]
    print(f"Deployment job created: {job_id}")

    # 4. Zip and upload dist
    print(f"Zipping {DIST_DIR}...")
    zip_buf = create_zip(DIST_DIR)
    zip_bytes = zip_buf.read()
    print(f"Zip size: {len(zip_bytes)} bytes")

    import urllib.request

    req = urllib.request.Request(
        upload_url,
        data=zip_bytes,
        method="PUT",
        headers={"Content-Type": "application/zip"},
    )
    urllib.request.urlopen(req)
    print("Uploaded zip to Amplify")

    # 5. Start deployment
    amplify.start_deployment(appId=app_id, branchName=BRANCH_NAME, jobId=job_id)
    print("Deployment started!")

    # 6. Wait for deployment
    print("Waiting for deployment to complete...")
    for _ in range(60):
        time.sleep(5)
        job = amplify.get_job(appId=app_id, branchName=BRANCH_NAME, jobId=job_id)
        status = job["job"]["summary"]["status"]
        print(f"  Status: {status}")
        if status == "SUCCEED":
            domain = f"https://{BRANCH_NAME}.{app_id}.amplifyapp.com"
            print(f"\nDeployment successful!")
            print(f"Live URL: {domain}")
            return
        elif status in ("FAILED", "CANCELLED"):
            print(f"\nDeployment {status}!")
            return
    print("Timed out waiting for deployment")


if __name__ == "__main__":
    main()
