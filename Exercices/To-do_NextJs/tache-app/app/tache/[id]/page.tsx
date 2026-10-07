import { prisma } from "@/lib/prisma";
import { modifierTache } from "@/app/action";
import { notFound } from "next/navigation";
import { ajouterPiece, supprimerPiece } from "@/app/action";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tache = await prisma.tache.findUnique({
    where: { id: Number(id) },
    include: {pieces}
  });

  if (!tache) notFound();

  return (
    <>
      <h1>Modifier la tache</h1>
      <form action={modifierTache}>
        <input type="hidden" name="id" value={tache?.id} />
        <input name="titre" defaultValue={tache.titre} required />
        <textarea name="desc" defaultValue={tache.desc ?? ""} />
        <div>
          <button>Modifier</button>
        </div>
      </form>
      <p>{tache?.desc}</p>
    </>
  );
}
