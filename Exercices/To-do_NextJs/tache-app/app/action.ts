"use server";

import { prisma } from "@/lib/prisma";
import { Status } from "./generated/prisma/enums";
import { stat } from "fs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function supprimerTache(formData: FormData) {
  const id = Number(formData.get("id"));
  await prisma.tache.delete({ where: { id } });
  revalidatePath("/");
}

export async function basculerStatut(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));

  if (!Object.values(Status).includes(status as Status)) {
    return;
  }

  await prisma.tache.update({
    where: { id },
    data: { status: status as Status },
  });
  revalidatePath("/");
}

export async function modifierTache(formData: FormData) {
  const id = Number(formData.get("id"));
  const titre = String(formData.get("titre"));
  const desc = String(formData.get("desc"));
  await prisma.tache.update({
    where: { id },
    data: { titre, desc: desc || null },
  });
  revalidatePath("/");
  redirect("/");
}
