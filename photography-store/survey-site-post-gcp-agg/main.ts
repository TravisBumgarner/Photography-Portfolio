import * as fs from "fs";
import * as path from "path";

interface SurveyEntry {
  photosByCategory: {
    [category: string]: string[];
  };
  totalSelected: number;
  timestamp: string;
}

interface PhotoCounts {
  [photoPath: string]: number;
}

interface CategoryPhotoCounts {
  [category: string]: PhotoCounts;
}

function aggregatePhotoCounts(): CategoryPhotoCounts {
  // Read the data.json file
  const dataPath = path.join(__dirname, "data.json");
  const rawData = fs.readFileSync(dataPath, "utf8");
  const surveyData: SurveyEntry[] = JSON.parse(rawData);

  const categoryPhotoCounts: CategoryPhotoCounts = {};

  // Iterate through each survey entry
  surveyData.forEach((entry) => {
    // Iterate through each category in the entry
    Object.entries(entry.photosByCategory).forEach(([category, photos]) => {
      // Initialize category if it doesn't exist
      if (!categoryPhotoCounts[category]) {
        categoryPhotoCounts[category] = {};
      }

      // Count each photo occurrence
      photos.forEach((photo) => {
        if (!categoryPhotoCounts[category][photo]) {
          categoryPhotoCounts[category][photo] = 0;
        }
        categoryPhotoCounts[category][photo]++;
      });
    });
  });

  return categoryPhotoCounts;
}

function main() {
  try {
    console.log("Aggregating photo counts by category...\n");

    const categoryPhotoCounts = aggregatePhotoCounts();

    // Process and display results for each category
    Object.entries(categoryPhotoCounts).forEach(([category, photoCounts]) => {
      console.log(`\n${category.toUpperCase()}:`);
      console.log("=".repeat(category.length + 1));

      // Sort photos by count (descending)
      const sortedPhotos = Object.entries(photoCounts).sort(
        ([, a], [, b]) => b - a
      );

      sortedPhotos.forEach(([photo, count]) => {
        console.log(`  ${photo}: ${count} times`);
      });

      console.log(
        `  Total unique photos in ${category}: ${
          Object.keys(photoCounts).length
        }`
      );
    });

    // Also output as JSON for potential further processing
    const outputPath = path.join(__dirname, "aggregated-counts.json");
    const output = {
      categoryPhotoCounts,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nResults also saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error processing data:", error);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}
