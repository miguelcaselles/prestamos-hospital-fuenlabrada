-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('SOLICITADO', 'PRESTADO');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDIENTE_FARMATOOLS', 'GESTIONADO_FARMATOOLS', 'PENDIENTE_DEVOLUCION', 'DEVUELTO');

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "national_code" TEXT,
    "presentation" TEXT,
    "active_ingredient" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "type" "LoanType" NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDIENTE_FARMATOOLS',
    "email_sent_to" TEXT,
    "pdf_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smtp_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "secure" BOOLEAN NOT NULL DEFAULT false,
    "user" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "from_name" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,

    CONSTRAINT "smtp_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_counters" (
    "id" TEXT NOT NULL DEFAULT 'loan_counter',
    "year" INTEGER NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "reference_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loans_reference_number_key" ON "loans"("reference_number");

-- CreateIndex
CREATE INDEX "loans_hospital_id_idx" ON "loans"("hospital_id");

-- CreateIndex
CREATE INDEX "loans_medication_id_idx" ON "loans"("medication_id");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "loans_type_idx" ON "loans"("type");

-- CreateIndex
CREATE INDEX "loans_created_at_idx" ON "loans"("created_at");

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
