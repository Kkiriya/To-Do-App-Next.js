-- CreateEnum
CREATE TYPE "TypePokemon" AS ENUM ('NORMAL', 'FEU', 'EAU', 'PLANTE', 'ELECTRIK', 'GLACE', 'COMBAT', 'POISON', 'SOL', 'VOL', 'PSY', 'INSECTE', 'ROCHE', 'SPECTRE', 'DRAGON', 'ENEBRES', 'ACIER', 'FEE');

-- CreateEnum
CREATE TYPE "Rarete" AS ENUM ('COMMUN', 'RARE', 'LEGENDAIRE');

-- CreateTable
CREATE TABLE "Dresseur" (
    "id" SERIAL NOT NULL,
    "pseudo" TEXT NOT NULL,
    "ville" TEXT,
    "badge" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dresseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" SERIAL NOT NULL,
    "numeroPokedex" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "typePrincipal" "TypePokemon" NOT NULL,
    "typeSecondaire" "TypePokemon",
    "pointsVie" INTEGER NOT NULL,
    "taile" DOUBLE PRECISION NOT NULL,
    "poids" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "rarete" "Rarete" NOT NULL DEFAULT 'COMMUN',
    "captureLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dresseurId" INTEGER,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dresseur_pseudo_key" ON "Dresseur"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_numeroPokedex_key" ON "Pokemon"("numeroPokedex");

-- AddForeignKey
ALTER TABLE "Pokemon" ADD CONSTRAINT "Pokemon_dresseurId_fkey" FOREIGN KEY ("dresseurId") REFERENCES "Dresseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
