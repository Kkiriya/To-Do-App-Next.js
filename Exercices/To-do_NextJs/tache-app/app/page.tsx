import Image from "next/image";
import { basculerStatut, creerTache, supprimerTache } from "./action";
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
          <li key={t.id}>
            <span
              style={{
                textDecoration:
                  t.status === "TERMINER" ? "line-through" : "none",
              }}
            >
              <b>
                {t.id}. {t.titre}
              </b>{" "}
              {t.desc ? -`${t.desc}` : ""} {"  "}
              <em>({t.status})</em>
            </span>
            <a
              href={`/tache/${t.id}`}
              style={{ textDecoration: "none", color: "black" }}
            >
              {" "}
              Modifier
            </a>
            <form action={basculerStatut}>
              <input type="hidden" name="id" value={t.id} />
              <input
                type="hidden"
                name="status"
                value={t.status === "TERMINER" ? "A_FAIRE" : "TERMINER"}
              />
              <button>
                {t.status === "TERMINER" ? "A_FAIRE" : "TERMINER"}
              </button>
            </form>
            <form action={supprimerTache}>
              <input type="hidden" name="id" value={t.id} />
              <button>Supprimer</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
