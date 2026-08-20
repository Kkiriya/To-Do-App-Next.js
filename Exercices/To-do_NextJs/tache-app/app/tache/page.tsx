import { prisma } from "@/lib/prisma";

export default async function Page() {
  const taches = await prisma.tache.findMany();

  return (
    <>
      <h1>Ma liste de taches</h1>
      <ul>
        {taches.map((t) => (
          <li key={t.id}>
            <a href={`tache/${t.id}`}>
              {t.titre} : {t.desc}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
