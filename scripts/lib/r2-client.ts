import { S3Client, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} ontbreekt in .env.import.local`)
  return value
}

export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: required('R2_ENDPOINT'),
    credentials: {
      accessKeyId: required('R2_ACCESS_KEY_ID'),
      secretAccessKey: required('R2_SECRET_ACCESS_KEY'),
    },
  })
}

export function r2Bucket(): string {
  return required('R2_BUCKET')
}

export async function r2Head(client: S3Client, key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: r2Bucket(), Key: key }))
    return true
  } catch {
    return false
  }
}

export async function r2Put(
  client: S3Client,
  key: string,
  body: Buffer,
  contentType: string,
) {
  let lastError: unknown
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: r2Bucket(),
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      )
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
    }
  }
  throw lastError
}

export async function r2List(client: S3Client, prefix?: string, maxKeys = 5) {
  return client.send(
    new ListObjectsV2Command({
      Bucket: r2Bucket(),
      Prefix: prefix,
      MaxKeys: maxKeys,
    }),
  )
}

export async function r2Get(client: S3Client, key: string) {
  return client.send(new GetObjectCommand({ Bucket: r2Bucket(), Key: key }))
}

export async function r2Delete(client: S3Client, key: string) {
  await client.send(new DeleteObjectCommand({ Bucket: r2Bucket(), Key: key }))
}
