// const pokemon = ["pikachu", "bulbasaur", "charmander", "meowscarada"];

import Compteur from "./api/salut/compteur";

export default async function Page() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");

  const data = await res.json();

  return (
    <>
      <h1>Ma Premiere app Next.js</h1>

      <ul>
        {/* {pokemon.map((nom) => (
          <li key={nom}>{nom}</li>
        ))} */}

        {data.results.map((i: { name: string }) => (
          <li key={i.name}>{i.name}</li>
        ))}
      </ul>
      <Compteur></Compteur>
    </>
  );
}
