import fs from 'fs'
import readline from 'readline'

// Chemins des fichiers
const inputFile = 'lichess_db_puzzle.csv'
const outputFile = 'lichess_db_puzzle_filtered_fork.csv'

async function processFile() {
  try {
    const fileStream = fs.createReadStream(inputFile)
    const outputStream = fs.createWriteStream(outputFile)

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })

    let isFirstLine = true
    let count = 0

    // Variables pour les statistiques de popularité
    let minPopularity = Infinity
    let maxPopularity = -Infinity
    let totalPopularity = 0

    // Buckets de popularité par intervalles de 5 à partir de 80
    const popularityBuckets = {}

    // Buckets de rating par intervalles de 100
    const ratingBuckets = {}

    for await (const line of rl) {
      // Toujours garder l'en-tête (première ligne)
      if (isFirstLine) {
        outputStream.write(line + '\n')
        isFirstLine = false
        continue
      }

      // Ignorer les lignes vides
      if (!line.trim()) continue

      // Extraction du rating (4ème colonne) et popularité (6ème colonne)
      const columns = line.split(',')
      const rating = parseInt(columns[3], 10)
      const popularity = parseInt(columns[5], 10)
      const NbPlays = parseInt(columns[6], 10)
      const moves = columns[2] // Le champ "Moves" est la 3ème colonne
      const themes = columns[7]

      // Compter le nombre d'espaces dans le champ "Moves"
      const spacesCount = (moves.match(/ /g) || []).length

      // Garder la ligne si:
      // - rating < 1500
      // - popularité > 98
      // - le champ "Moves" contient exactement un espace
      if (spacesCount === 1 && themes.includes('fork') && !themes.includes('mateIn1')) {
        outputStream.write(line + '\n')
        count++

        // Mise à jour des statistiques de popularité
        minPopularity = Math.min(minPopularity, popularity)
        maxPopularity = Math.max(maxPopularity, popularity)
        totalPopularity += popularity

        // Attribuer au bucket approprié
        const bucketIndex = Math.floor(popularity / 5) * 5
        popularityBuckets[bucketIndex] = (popularityBuckets[bucketIndex] || 0) + 1

        // Attribuer au bucket approprié pour rating
        const ratingBucketIndex = Math.floor(rating / 100) * 100
        ratingBuckets[ratingBucketIndex] = (ratingBuckets[ratingBucketIndex] || 0) + 1
      }
    }

    // Calcul de la moyenne de popularité
    const avgPopularity = count > 0 ? (totalPopularity / count).toFixed(2) : 0

    console.log(
      `Filtrage terminé ! ${count} puzzles avec rating < 1500 sauvegardés dans ${outputFile}`,
    )
    console.log(`Statistiques de popularité des puzzles filtrés:`)
    console.log(`- Minimum: ${minPopularity}`)
    console.log(`- Maximum: ${maxPopularity}`)
    console.log(`- Moyenne: ${avgPopularity}`)

    // Affichage des buckets de popularité
    console.log(`\nDistribution par plages de popularité:`)

    // Trier les buckets par valeur de popularité
    const sortedBuckets = Object.keys(popularityBuckets)
      .map((key) => parseInt(key))
      .sort((a, b) => a - b)

    sortedBuckets.forEach((bucket) => {
      if (bucket >= 80) {
        // Seulement les buckets à partir de 80
        console.log(`- Popularité ${bucket}-${bucket + 4}: ${popularityBuckets[bucket]} puzzles`)
      }
    })

    // Affichage des buckets de rating
    console.log(`\nDistribution par plages de rating:`)

    // Trier les buckets par valeur de rating
    const sortedRatingBuckets = Object.keys(ratingBuckets)
      .map((key) => parseInt(key))
      .sort((a, b) => a - b)

    sortedRatingBuckets.forEach((bucket) => {
      console.log(`- Rating ${bucket}-${bucket + 99}: ${ratingBuckets[bucket]} puzzles`)
    })
  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error)
  }
}

processFile()
