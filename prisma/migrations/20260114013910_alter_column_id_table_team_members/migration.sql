/*
  Warnings:

  - The primary key for the `teams_members` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "teams_members" DROP CONSTRAINT "teams_members_pkey",
ADD CONSTRAINT "teams_members_pkey" PRIMARY KEY ("user_id", "team_id");
