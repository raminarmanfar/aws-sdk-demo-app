import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

const s3 = new S3Client({ region: "eu-central-1" });

async function listBuckets() {
    const response = await s3.send(new ListBucketsCommand({}));
    return response.Buckets.map(bucket => bucket.Name);
}

async function uploadFile(bucketName, filePath) {
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileStream,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    console.log(`File "${fileName}" uploaded to bucket "${bucketName}"`);
}

async function main() {
    const buckets = await listBuckets();
    const { bucket, file } = await inquirer.prompt([
        {
            type: 'list',
            name: 'bucket',
            message: 'Select an S3 bucket:',
            choices: buckets,
        },
        {
            type: 'input',
            name: 'file',
            message: 'Enter the full path of the file to upload:',
            validate: (input) => fs.existsSync(input) || 'File not found!',
        },
    ]);

    await uploadFile(bucket, file);
}

main().catch(err => {
    console.error("Error:", err);
});
