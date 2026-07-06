---
title: Recipe
impact: LOW
impactDescription: enables recipe card rich result with image, rating, and cook time
tags: json-ld, schema, seo, recipe, food, cooking
---

## Recipe

Add structured data to recipe pages so Google can display recipe cards with images, ratings, cook times, and ingredients directly in search results.

### When to Use
- Recipe pages with ingredients, instructions, and cook times
- Food blog posts centered around a single recipe
- Any cooking or baking content with structured preparation steps

### TypeScript Type

Import from `schema-dts`:

```ts
import { Recipe, WithContext } from 'schema-dts'
```

### Next.js Implementation

```tsx filename="app/recipes/[slug]/page.tsx"
import { Recipe, WithContext } from 'schema-dts'

async function getRecipe(slug: string) {
  // Fetch recipe data from your CMS or database
  return {
    title: 'Classic Margherita Pizza',
    description: 'A simple and authentic Margherita pizza with fresh mozzarella, San Marzano tomatoes, and basil on a crispy thin crust.',
    images: [
      'https://www.acme.com/images/margherita-16x9.jpg',
      'https://www.acme.com/images/margherita-4x3.jpg',
      'https://www.acme.com/images/margherita-1x1.jpg',
    ],
    author: { name: 'Marco Rossi', url: 'https://www.acme.com/team/marco-rossi' },
    publishedAt: '2025-06-10T10:00:00Z',
    prepTime: 'PT15M',
    cookTime: 'PT30M',
    totalTime: 'PT45M',
    servings: '4 servings',
    category: 'Dinner',
    cuisine: 'Italian',
    calories: '350 calories',
    ingredients: [
      '2 cups all-purpose flour',
      '1 cup warm water',
      '1 tablespoon olive oil',
      '1 teaspoon salt',
      '1 teaspoon active dry yeast',
      '1 cup San Marzano tomato sauce',
      '8 oz fresh mozzarella, sliced',
      'Fresh basil leaves',
    ],
    steps: [
      { text: 'Combine flour, water, olive oil, salt, and yeast in a bowl. Knead for 10 minutes until smooth.' },
      { text: 'Let the dough rise in a covered bowl for 1 hour at room temperature.' },
      { text: 'Preheat oven to 475°F (245°C) with a pizza stone or inverted baking sheet inside.' },
      { text: 'Stretch the dough into a 12-inch round on a floured surface.' },
      { text: 'Spread tomato sauce evenly over the dough, leaving a 1-inch border.' },
      { text: 'Arrange mozzarella slices on top and bake for 12-15 minutes until crust is golden.' },
      { text: 'Remove from oven, top with fresh basil leaves, and slice.' },
    ],
    rating: { value: 4.8, count: 312 },
    videoName: 'How to Make Margherita Pizza',
    videoDescription: 'Step-by-step video guide for making authentic Margherita pizza at home.',
    videoThumbnail: 'https://www.acme.com/images/margherita-video-thumb.jpg',
    videoUploadDate: '2025-06-10T10:00:00Z',
    videoContentUrl: 'https://www.acme.com/videos/margherita-pizza.mp4',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const recipe = await getRecipe(slug)

  const jsonLd: WithContext<Recipe> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.images,
    description: recipe.description,
    author: {
      '@type': 'Person',
      name: recipe.author.name,
      url: recipe.author.url,
    },
    datePublished: recipe.publishedAt,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeYield: recipe.servings,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    nutrition: {
      '@type': 'NutritionInformation',
      calories: recipe.calories,
    },
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((s) => ({
      '@type': 'HowToStep' as const,
      text: s.text,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.value.toString(),
      reviewCount: recipe.rating.count.toString(),
    },
    video: {
      '@type': 'VideoObject',
      name: recipe.videoName,
      description: recipe.videoDescription,
      thumbnailUrl: recipe.videoThumbnail,
      uploadDate: recipe.videoUploadDate,
      contentUrl: recipe.videoContentUrl,
    },
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <h1>{recipe.title}</h1>
      <p>{recipe.description}</p>
      <p>By {recipe.author.name}</p>
      <p>Prep: {recipe.prepTime} | Cook: {recipe.cookTime}</p>
      <p>Serves: {recipe.servings}</p>
      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      <h2>Instructions</h2>
      <ol>
        {recipe.steps.map((step, index) => (
          <li key={index}>{step.text}</li>
        ))}
      </ol>
    </article>
  )
}
```

### Key Properties

| Property | Required | Type | Description |
|----------|----------|------|-------------|
| name | Yes | string | Recipe title |
| image | Yes | string[] | Array of image URLs — include 16x9, 4x3, and 1x1 aspect ratios |
| recipeIngredient | Yes | string[] | Array of individual ingredient strings — must be an array, not a single string |
| recipeInstructions | Yes | HowToStep[] | Array of step objects with `text` property |
| author | Yes | Person | Recipe author as a structured object |
| datePublished | Recommended | string | ISO 8601 publication date |
| prepTime | Recommended | string | ISO 8601 duration (e.g. `PT15M`) |
| cookTime | Recommended | string | ISO 8601 duration (e.g. `PT30M`) |
| totalTime | Recommended | string | ISO 8601 duration — should equal prepTime + cookTime |
| recipeYield | Recommended | string | Number of servings (e.g. `4 servings`) |
| recipeCategory | Recommended | string | Meal type (e.g. `Dinner`, `Dessert`, `Appetizer`) |
| recipeCuisine | Recommended | string | Cuisine type (e.g. `Italian`, `Mexican`, `Japanese`) |
| nutrition | Recommended | NutritionInformation | Nutritional info with at least `calories` |
| aggregateRating | Recommended | AggregateRating | Rating with `ratingValue` and `reviewCount` |
| video | Recommended | VideoObject | Optional video with name, thumbnail, and content URL |

### Common Mistakes
- Don't: Use a single string for `recipeIngredient` — Google requires an array of individual ingredient strings
- Don't: Use plain text for `recipeInstructions` — use an array of `HowToStep` objects with a `text` property
- Do: Use ISO 8601 duration format for all time values (`PT15M` for 15 minutes, `PT1H30M` for 90 minutes)
- Don't: Omit `image` — recipe rich results require at least one image
- Do: Include multiple image aspect ratios (16:9, 4:3, 1:1) for best display across devices

### Validation
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
