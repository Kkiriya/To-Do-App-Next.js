import Image from "next/image";
import { creerTache } from "./action";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const taches = await prisma.tache.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <main>
      <h1>Liste des taches</h1>

      <form action={creerTache}>
        <input name="titre" placeholder="Nouvelle tache..." required />
        <input
          name="desc"
          placeholder="Donnez une description pour cette tache..."
        />
        <button style={{ padding: "8px 14px" }}>Ajouter</button>
      </form>

      <ul>
        {taches.map((t) => (
          <li key={t.id}>{t.titre}</li>
        ))}
      </ul>
    </main>
  );
}
