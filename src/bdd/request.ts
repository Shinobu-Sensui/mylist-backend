import { generateFiles } from "./bdd.js";



async function measurePerformance(callback:any) {
  const startTime = process.hrtime.bigint(); // Temps de départ en nanosecondes
  await callback(); // Exécution de l'opération à mesurer
  const endTime = process.hrtime.bigint(); // Temps de fin en nanosecondes

  const elapsedTime = Number(endTime - startTime) / 1e6; // Convertir en millisecondes
  console.log(`Temps d'exécution : ${elapsedTime} ms`);
}



measurePerformance(async () => {
  
})