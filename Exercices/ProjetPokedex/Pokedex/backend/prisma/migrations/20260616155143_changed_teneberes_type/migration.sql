/*
  Warnings:

  - The values [ENEBRES] on the enum `TypePokemon` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypePokemon_new" AS ENUM ('NORMAL', 'FEU', 'EAU', 'PLANTE', 'ELECTRIK', 'GLACE', 'COMBAT', 'POISON', 'SOL', 'VOL', 'PSY', 'INSECTE', 'ROCHE', 'SPECTRE', 'DRAGON', 'TENEBRES', 'ACIER', 'FEE');
ALTER TABLE "Pokemon" ALTER COLUMN "typePrincipal" TYPE "TypePokemon_new" USING ("typePrincipal"::text::"TypePokemon_new");
ALTER TABLE "Pokemon" ALTER COLUMN "typeSecondaire" TYPE "TypePokemon_new" USING ("typeSecondaire"::text::"TypePokemon_new");
ALTER TYPE "TypePokemon" RENAME TO "TypePokemon_old";
ALTER TYPE "TypePokemon_new" RENAME TO "TypePokemon";
DROP TYPE "public"."TypePokemon_old";
COMMIT;
