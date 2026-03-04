-- Auth.js (NextAuth v5) tables
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Unique indexes for auth tables
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Foreign keys for auth tables
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- Data migration: create a default user for existing records
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO "User" ("id", "name", "email")
VALUES ('default-owner', 'Usuario', NULL)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- Add userId to existing tables (nullable first, then fill, then NOT NULL)
-- ────────────────────────────────────────────────────────────────────────────

-- Categoria
ALTER TABLE "Categoria" ADD COLUMN "userId" TEXT;
UPDATE "Categoria" SET "userId" = 'default-owner';
ALTER TABLE "Categoria" ALTER COLUMN "userId" SET NOT NULL;
DROP INDEX IF EXISTS "Categoria_nombre_key";
CREATE UNIQUE INDEX "Categoria_userId_nombre_key" ON "Categoria"("userId", "nombre");

-- Cuenta
ALTER TABLE "Cuenta" ADD COLUMN "userId" TEXT;
UPDATE "Cuenta" SET "userId" = 'default-owner';
ALTER TABLE "Cuenta" ALTER COLUMN "userId" SET NOT NULL;
DROP INDEX IF EXISTS "Cuenta_nombre_key";
CREATE UNIQUE INDEX "Cuenta_userId_nombre_key" ON "Cuenta"("userId", "nombre");

-- MetodoPago
ALTER TABLE "MetodoPago" ADD COLUMN "userId" TEXT;
UPDATE "MetodoPago" SET "userId" = 'default-owner';
ALTER TABLE "MetodoPago" ALTER COLUMN "userId" SET NOT NULL;
DROP INDEX IF EXISTS "MetodoPago_nombre_key";
CREATE UNIQUE INDEX "MetodoPago_userId_nombre_key" ON "MetodoPago"("userId", "nombre");

-- Transaccion
ALTER TABLE "Transaccion" ADD COLUMN "userId" TEXT;
UPDATE "Transaccion" SET "userId" = 'default-owner';
ALTER TABLE "Transaccion" ALTER COLUMN "userId" SET NOT NULL;

-- PresupuestoCategoria
ALTER TABLE "PresupuestoCategoria" ADD COLUMN "userId" TEXT;
UPDATE "PresupuestoCategoria" SET "userId" = 'default-owner';
ALTER TABLE "PresupuestoCategoria" ALTER COLUMN "userId" SET NOT NULL;
DROP INDEX IF EXISTS "PresupuestoCategoria_mes_categoriaId_key";
CREATE UNIQUE INDEX "PresupuestoCategoria_userId_mes_categoriaId_key" ON "PresupuestoCategoria"("userId", "mes", "categoriaId");

-- Deuda
ALTER TABLE "Deuda" ADD COLUMN "userId" TEXT;
UPDATE "Deuda" SET "userId" = 'default-owner';
ALTER TABLE "Deuda" ALTER COLUMN "userId" SET NOT NULL;

-- Activo
ALTER TABLE "Activo" ADD COLUMN "userId" TEXT;
UPDATE "Activo" SET "userId" = 'default-owner';
ALTER TABLE "Activo" ALTER COLUMN "userId" SET NOT NULL;

-- MetaFinanciera
ALTER TABLE "MetaFinanciera" ADD COLUMN "userId" TEXT;
UPDATE "MetaFinanciera" SET "userId" = 'default-owner';
ALTER TABLE "MetaFinanciera" ALTER COLUMN "userId" SET NOT NULL;

-- ConfiguracionFinanciera: change PK from Int to userId String
ALTER TABLE "ConfiguracionFinanciera" ADD COLUMN "userId" TEXT;
UPDATE "ConfiguracionFinanciera" SET "userId" = 'default-owner';
ALTER TABLE "ConfiguracionFinanciera" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "ConfiguracionFinanciera" DROP CONSTRAINT "ConfiguracionFinanciera_pkey";
ALTER TABLE "ConfiguracionFinanciera" DROP COLUMN "id";
ALTER TABLE "ConfiguracionFinanciera" ADD CONSTRAINT "ConfiguracionFinanciera_pkey" PRIMARY KEY ("userId");

-- ────────────────────────────────────────────────────────────────────────────
-- Add foreign key constraints
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MetodoPago" ADD CONSTRAINT "MetodoPago_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaccion" ADD CONSTRAINT "Transaccion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PresupuestoCategoria" ADD CONSTRAINT "PresupuestoCategoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activo" ADD CONSTRAINT "Activo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MetaFinanciera" ADD CONSTRAINT "MetaFinanciera_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConfiguracionFinanciera" ADD CONSTRAINT "ConfiguracionFinanciera_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
