import {fileMapSync} from '../../utils/file';
import {MapWithDefault} from '../../utils/mapWithDefault';
import {printSolution} from '../../utils/printSolution';

function part1(): number {
  // key: allergen, value: all recipes that definitely contain this allergen, stored as sets of words in the recipe
  const allergenRecipes = new Map<string, Set<string>[]>();

  // key: allergen, value: all ingredients that might be this allergen
  const allergenPossibles = new Map<string, Set<string>>();

  const allIngredients = new MapWithDefault<string, number>(0);

  fileMapSync('src/2020/day21/input.txt', line => {
    if (line === '') {
      return;
    }

    const [recipe, allergens] = line.replace(')', '').split(' (contains ');

    const ingredients = new Set(recipe.split(' '));

    for (const ingredient of ingredients) {
      allIngredients.set(ingredient, allIngredients.get(ingredient) + 1);
    }

    for (const allergen of allergens.split(', ')) {
      if (allergenRecipes.has(allergen)) {
        allergenRecipes.get(allergen)?.push(ingredients);
      } else {
        allergenRecipes.set(allergen, [ingredients]);
      }
    }
  });

  for (const [allergen, recipes] of allergenRecipes) {
    // possible allergen ingredients are the ingredients that appear in every recipe
    // start a set with all words in the first recipe, then for each recipe, remove any words from the possible list
    // that aren't in the current recipe
    const possibleAllergenIngredients = new Set(recipes[0]);

    for (let i = 1; i < recipes.length; i++) {
      for (const ingredient of possibleAllergenIngredients) {
        if (!recipes[i].has(ingredient)) {
          possibleAllergenIngredients.delete(ingredient);
        }
      }
    }

    allergenPossibles.set(allergen, possibleAllergenIngredients);
  }

  const definitelySafeIngredients = new Set<string>(allIngredients.keys());

  for (const [_allergen, possibleIngredients] of allergenPossibles) {
    for (const ingredient of possibleIngredients) {
      definitelySafeIngredients.delete(ingredient);
    }
  }

  let total = 0;
  for (const ingredient of definitelySafeIngredients) {
    total += allIngredients.get(ingredient);
  }

  // console.log(allergenRecipes);
  // console.log(allergenPossibles);
  // console.log(allIngredients);
  // console.log(definitelySafeIngredients);

  return total;
}
function part2(): string {
  // key: allergen, value: all recipes that definitely contain this allergen, stored as sets of words in the recipe
  const allergenRecipes = new Map<string, Set<string>[]>();

  // key: allergen, value: all ingredients that might be this allergen
  const allergenPossibles = new Map<string, Set<string>>();

  fileMapSync('src/2020/day21/input.txt', line => {
    if (line === '') {
      return;
    }

    const [recipe, allergens] = line.replace(')', '').split(' (contains ');

    const ingredients = new Set(recipe.split(' '));

    for (const allergen of allergens.split(', ')) {
      if (allergenRecipes.has(allergen)) {
        allergenRecipes.get(allergen)?.push(ingredients);
      } else {
        allergenRecipes.set(allergen, [ingredients]);
      }
    }
  });

  for (const [allergen, recipes] of allergenRecipes) {
    // possible allergen ingredients are the ingredients that appear in every recipe
    // start a set with all words in the first recipe, then for each recipe, remove any words from the possible list
    // that aren't in the current recipe
    const possibleAllergenIngredients = new Set(recipes[0]);

    for (let i = 1; i < recipes.length; i++) {
      for (const ingredient of possibleAllergenIngredients) {
        if (!recipes[i].has(ingredient)) {
          possibleAllergenIngredients.delete(ingredient);
        }
      }
    }

    allergenPossibles.set(allergen, possibleAllergenIngredients);
  }

  const allergenDefinites = new Map<string, string>();
  const targetSize = allergenPossibles.size;

  while (allergenDefinites.size < targetSize) {
    for (const [allergen, possibleIngredients] of allergenPossibles) {
      if (possibleIngredients.size === 1) {
        // isolated!
        const [ingredient] = possibleIngredients.values();
        // add to definites, and then remove that ingredent from all possibles
        allergenDefinites.set(allergen, ingredient);

        for (const [
          otherAllergen,
          otherAllergenIngredients,
        ] of allergenPossibles) {
          if (allergen === otherAllergen) {
            continue;
          } else {
            otherAllergenIngredients.delete(ingredient);
          }
        }
      }
    }
  }

  // console.log(allergenDefinites);

  return Array.from(allergenDefinites.entries())
    .sort(([allergenA, _ingredientA], [allergenB, _ingredientB]) =>
      allergenA.localeCompare(allergenB)
    )
    .map(([allergen, ingredient]) => ingredient)
    .join(',');
}

printSolution(part1(), part2());
