-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER', 'PENDING');

-- CreateEnum
CREATE TYPE "IntentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('REGULAR', 'SPECIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'CONTACTED', 'NEGOTIATING', 'CLOSED', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OneOnOneStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_intents" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "motivation" TEXT,
    "status" "IntentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "invite_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "intent_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cpf" TEXT,
    "birth_date" DATE,
    "photo_url" TEXT,
    "company" TEXT,
    "position" TEXT,
    "industry" TEXT,
    "business_description" TEXT,
    "website" TEXT,
    "linkedin_url" TEXT,
    "address_street" TEXT,
    "address_number" TEXT,
    "address_complement" TEXT,
    "address_neighborhood" TEXT,
    "address_city" TEXT,
    "address_state" TEXT,
    "address_zipcode" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "membership_start_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membership_end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "target_audience" TEXT NOT NULL DEFAULT 'all',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meeting_date" DATE NOT NULL,
    "meeting_time" TIME NOT NULL,
    "location" TEXT,
    "meeting_type" "MeetingType" NOT NULL DEFAULT 'REGULAR',
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendances" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,

    CONSTRAINT "meeting_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_to_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT,
    "client_email" TEXT,
    "description" TEXT NOT NULL,
    "estimated_value" DECIMAL(15,2),
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "feedback" TEXT,
    "closed_value" DECIMAL(15,2),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_status_history" (
    "id" TEXT NOT NULL,
    "referral_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_by" TEXT,
    "notes" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thank_yous" (
    "id" TEXT NOT NULL,
    "referral_id" TEXT NOT NULL,
    "from_member_id" TEXT NOT NULL,
    "to_member_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "business_value" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thank_yous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_on_one_meetings" (
    "id" TEXT NOT NULL,
    "member1_id" TEXT NOT NULL,
    "member2_id" TEXT NOT NULL,
    "meeting_date" DATE NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "status" "OneOnOneStatus" NOT NULL DEFAULT 'SCHEDULED',
    "registered_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_on_one_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_fees" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "reference_month" INTEGER NOT NULL,
    "reference_year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_date" TIMESTAMP(3),
    "payment_method" TEXT,
    "payment_transaction_id" TEXT,
    "payment_proof_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_reminders" (
    "id" TEXT NOT NULL,
    "monthly_fee_id" TEXT NOT NULL,
    "reminder_type" "ReminderType" NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReminderStatus" NOT NULL,

    CONSTRAINT "payment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "membership_intents_invite_token_key" ON "membership_intents"("invite_token");

-- CreateIndex
CREATE INDEX "membership_intents_status_idx" ON "membership_intents"("status");

-- CreateIndex
CREATE INDEX "membership_intents_email_idx" ON "membership_intents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_key" ON "members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_intent_id_key" ON "members"("intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_cpf_key" ON "members"("cpf");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE INDEX "members_email_idx" ON "members"("email");

-- CreateIndex
CREATE INDEX "members_user_id_idx" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "announcements_is_published_published_at_idx" ON "announcements"("is_published", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_announcement_id_member_id_key" ON "announcement_reads"("announcement_id", "member_id");

-- CreateIndex
CREATE INDEX "meetings_meeting_date_status_idx" ON "meetings"("meeting_date", "status");

-- CreateIndex
CREATE INDEX "meeting_attendances_meeting_id_idx" ON "meeting_attendances"("meeting_id");

-- CreateIndex
CREATE INDEX "meeting_attendances_member_id_idx" ON "meeting_attendances"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendances_meeting_id_member_id_key" ON "meeting_attendances"("meeting_id", "member_id");

-- CreateIndex
CREATE INDEX "business_referrals_referrer_id_idx" ON "business_referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "business_referrals_referred_to_id_idx" ON "business_referrals"("referred_to_id");

-- CreateIndex
CREATE INDEX "business_referrals_status_idx" ON "business_referrals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "thank_yous_referral_id_key" ON "thank_yous"("referral_id");

-- CreateIndex
CREATE INDEX "thank_yous_is_public_created_at_idx" ON "thank_yous"("is_public", "created_at");

-- CreateIndex
CREATE INDEX "one_on_one_meetings_member1_id_member2_id_idx" ON "one_on_one_meetings"("member1_id", "member2_id");

-- CreateIndex
CREATE INDEX "one_on_one_meetings_meeting_date_idx" ON "one_on_one_meetings"("meeting_date");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_fees_payment_transaction_id_key" ON "monthly_fees"("payment_transaction_id");

-- CreateIndex
CREATE INDEX "monthly_fees_member_id_idx" ON "monthly_fees"("member_id");

-- CreateIndex
CREATE INDEX "monthly_fees_status_idx" ON "monthly_fees"("status");

-- CreateIndex
CREATE INDEX "monthly_fees_due_date_idx" ON "monthly_fees"("due_date");

-- CreateIndex
CREATE INDEX "monthly_fees_reference_year_reference_month_idx" ON "monthly_fees"("reference_year", "reference_month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_fees_member_id_reference_month_reference_year_key" ON "monthly_fees"("member_id", "reference_month", "reference_year");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "membership_intents" ADD CONSTRAINT "membership_intents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_intent_id_fkey" FOREIGN KEY ("intent_id") REFERENCES "membership_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendances" ADD CONSTRAINT "meeting_attendances_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendances" ADD CONSTRAINT "meeting_attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_referrals" ADD CONSTRAINT "business_referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_referrals" ADD CONSTRAINT "business_referrals_referred_to_id_fkey" FOREIGN KEY ("referred_to_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_status_history" ADD CONSTRAINT "referral_status_history_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "business_referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_status_history" ADD CONSTRAINT "referral_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thank_yous" ADD CONSTRAINT "thank_yous_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "business_referrals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thank_yous" ADD CONSTRAINT "thank_yous_from_member_id_fkey" FOREIGN KEY ("from_member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thank_yous" ADD CONSTRAINT "thank_yous_to_member_id_fkey" FOREIGN KEY ("to_member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_one_meetings" ADD CONSTRAINT "one_on_one_meetings_member1_id_fkey" FOREIGN KEY ("member1_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_one_meetings" ADD CONSTRAINT "one_on_one_meetings_member2_id_fkey" FOREIGN KEY ("member2_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_one_meetings" ADD CONSTRAINT "one_on_one_meetings_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_fees" ADD CONSTRAINT "monthly_fees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_monthly_fee_id_fkey" FOREIGN KEY ("monthly_fee_id") REFERENCES "monthly_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
