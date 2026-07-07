-- Add onboardedAt to track whether the user has completed the profile setup
-- popup after first login. NULL = not yet onboarded (popup will auto-open).
ALTER TABLE "user" ADD COLUMN "onboardedAt" TIMESTAMP(3);
