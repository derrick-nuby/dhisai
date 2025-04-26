CREATE TABLE IF NOT EXISTS "Instance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "apiToken" TEXT,
  "description" TEXT,
  "username" TEXT,
  "password" TEXT,
  "details" JSONB,
  "verified" BOOLEAN DEFAULT false NOT NULL,
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);