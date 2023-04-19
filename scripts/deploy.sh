#!/bin/bash

# Get the version number from package.json
version=$(node -p "try {require('./package.json').version} catch (e) {''}")

if [[ -z "$version" ]]; then
    echo "Unable to retrieve version number from package.json"
    exit 1
fi

# Set S3 bucket and path
bucket="js.boxcast.com"
path="libs/boxcast-sdk-js-$version"

# Parse command line arguments
check=0
while [[ $# -gt 0 ]]; do
    case $1 in
        --check)
            check=1
            shift
            ;;
        *)
            echo "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# Dry run: check if directory exists on S3. Also helps to check if credentials are valid
if [ $check -eq 1 ]; then
    if aws s3 ls "s3://$bucket/$path" --profile=prod-boxcast >/dev/null 2>&1; then
        echo "Directory $path exists on S3"
    else
        echo "Directory $path does not exist on S3"
    fi
    exit 0
fi

echo "Building for Production..."

# Build & move files
npm run prepublishOnly

# Create directory if it does not exist
if ! aws s3 ls "s3://$bucket/$path" --profile=prod-boxcast >/dev/null 2>&1; then
    echo "Directory does not exist. Creating it."
    aws s3api put-object --bucket "$bucket" --key "$path" --profile=prod-boxcast
fi

echo "Uploading files.."

# Upload files to S3
aws s3 cp ./node.js "s3://$bucket/$path/node.js" --profile=prod-boxcast 
aws s3 cp ./node.js.map "s3://$bucket/$path/node.js.map" --profile=prod-boxcast
aws s3 cp ./browser.js "s3://$bucket/$path/browser.js" --profile=prod-boxcast
aws s3 cp ./browser.js.map "s3://$bucket/$path/browser.js.map" --profile=prod-boxcast

echo "Done"