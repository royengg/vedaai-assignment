-- DropForeignKey
ALTER TABLE "QuestionPaper" DROP CONSTRAINT "QuestionPaper_assignmentId_fkey";

-- AddForeignKey
ALTER TABLE "QuestionPaper" ADD CONSTRAINT "QuestionPaper_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
