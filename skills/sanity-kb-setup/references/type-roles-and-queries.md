# Type roles and query rules

## Roles

Give every document type exactly one role, with a one-line reason. If a type fits none, say so.

| Role | What it holds | Default |
|---|---|---|
| Fact | Policies, product specs, FAQs, help articles, knowledge documents | Include, projected to the fields that state facts |
| Page content | Pages built from page-builder blocks, including the homepage | Include text fields only, and record the homepage decision |
| Editorial | Blog posts, news, case studies, author bios | Exclude from a support Knowledge Base. They date quickly and argue positions. A separate Knowledge Base if needed |
| Structural | Navigation, footer, settings, redirects | Exclude. Keep only settings fields that state a fact, such as a contact email |
| Live data | Prices, stock, availability | Exclude. A compiled index goes stale on anything that changes daily |
| System | `sanity.*`, `media.*`, `mux.*`, `assist.*` | Exclude |

## Projection rules

- **Keep every field that states a fact, whatever its type.** That covers booleans and numbers such as `dishwasherSafe`, a capacity, a weight or a warranty length. In testing, a `dishwasherSafe: true` flag contradicted the care text, and the build saw it only because the query kept the flag. Drop slugs, images, video, buttons, links, icons, SEO and Open Graph fields.
- **Convert Portable Text** with `pt::text(field)` so the build reads prose.
- **Page-builder arrays.** Project each block's text fields and keep `_type`, so an entry can say which kind of block a claim came from. A field a block lacks comes back null, which is harmless.
- **Don't follow references to documents the query already reads.** If FAQ blocks reference FAQ documents and the query reads those directly, following the reference indexes each answer twice and muddies citations.
- **List every field left out of a fact type** in the sheet. In testing, a product `description` said a skillet was dishwasher safe while the care guide said hand wash only. Dropping `description` would have hidden that conflict.

## Query shape

One query, one projection branch per type.

```groq
*[_type in ['typeA', 'typeB']]{
  _type,
  _type == 'typeA' => { title, 'body': pt::text(body) },
  _type == 'typeB' => { name, spec, warranty }
}
```

The query is ready when all four hold.

- It starts with `*[`. The import rejects a bare filter.
- Every type in the filter exists in the schema and has published documents. The import rejects a query that matches nothing.
- It matches at most 5,000 documents. Narrow the filter for a larger catalogue, and note the split.
- Document ids contain no dots. Sanity reads the part before a dot as a version namespace, so `product.skillet` never reaches the published perspective or the index. Flag any such ids.

## The homepage decision

Hero badges, promo banners and call-to-action blocks are where unchecked claims usually live, and the build may give them little weight.

| Choice | Cost |
|---|---|
| Include | The build may ignore it without raising a conflict |
| Exclude | Only a check against the live page will catch a wrong claim |

Record the choice in the sheet's decisions section. If you include it, keep it off the purpose's "Leave out" line, for the reason in `plan.md` step 5.

## Files and instructions

- Each file is the authority for the facts it holds. Name those facts in the sheet.
- An instruction corrects one fact and is tied to the documents that state it. Stage 4 creates them after the first build.
- An instruction is archived when every source it is tied to is dropped, and re-uploading a file drops it. Tie any file-based instruction to a dataset document as well.

## Endpoints

An endpoint with both a dataset and a Knowledge Base attached serves the dataset and ignores the Knowledge Base. Give the Knowledge Base endpoint the Knowledge Base only.
