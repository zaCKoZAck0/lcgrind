-- Rounds Summary removed (survivorship-biased: rejected candidates only report
-- the rounds they reached). Drop the dead aggregate columns; submission rounds
-- input and gamification are unaffected.
ALTER TABLE "Company" DROP COLUMN "roundsSummary";
ALTER TABLE "Company" DROP COLUMN "roundMix";
ALTER TABLE "Company" DROP COLUMN "typicalProcess";
ALTER TABLE "Company" DROP COLUMN "avgRoundCount";
