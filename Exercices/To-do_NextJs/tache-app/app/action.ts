"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function creerTache(formData: FormData) {
  const titre = String(formData.get("titre")).trim();
  const desc = String(formData.get("desc") || "").trim();

  if (!titre) return;

  await prisma.tache.create({
    data: {
      titre,
      desc: desc || null,
    },
  });

  revalidatePath("/");
}
