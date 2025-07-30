-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "applicationDeadline" TEXT,
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "postedDate" TEXT,
ADD COLUMN     "remoteWork" TEXT,
ADD COLUMN     "salary" TEXT,
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[];
