# Andy Barber — Portfolio

A personal portfolio and blog site, built with [Jekyll](https://jekyllrb.com/) and deployed to Azure Static Web Apps.

Covers Azure / Kubernetes platforms, platform engineering, and building AI systems for production.

---

## Stack

- **Static site generator:** Jekyll (`~> 4.4`), no remote theme — everything is in this repo.
- **Content:** plain YAML in `_data/` and Markdown pages; site content (experience, skills, projects, certs) is driven by `_data`.
- **Styling:** single stylesheet (`assets/css/main.css`).
- **Fonts:** Inter + JetBrains Mono (Google Fonts), with a system-font fallback.

---

## Requirements

- Ruby `3.3.x`
- Bundler (`bundle install`)

## Local development

From the repo root (this `StaticSite/` folder):

```bash
bundle install
bundle exec jekyll serve --livereload
```

Then open <http://127.0.0.1:4000/>. `--livereload` rebuilds on file changes.

## Build for production

```bash
bundle exec jekyll build
```

Output goes to `_site/` (this is what gets deployed — it is git‑ignored).

---

## Editing content

There is **no CMS**. Everything is content in version control, split into three layers:

| Layer | Files | Purpose |
| --- | --- | --- |
| Data (site content) | `_data/*.yml` | Everything that changes: experience, skills, projects, certifications, social links. |
| Data (assets) | `assets/images/*` | Photographs, logos, project screenshots, favicons. |
| Layout / presentation | `_includes/`, `_layouts/`, `assets/css/main.css` | Structure and styling. |

Update `_data/*.yml` to change what the site says — edit `_includes/`, `_layouts/`, and `assets/css/main.css` to change how it looks.

---

## Adding a project

Projects live in `_data/projects.yml`. Each entry supports optional `image`, `image_alt`, `highlights` (taster bullets), `tech`, `live`, and `featured` fields. Add a card like this:

```yaml
- tag: "Category"
  title: "Project name"
  desc: "A one-line description."
  url: "https://github.com/your/repo"      # repo link
  live: "https://example.com"               # live site (optional)
  tech:
    - Go
    - Docker
  highlights:
    - "A taster bullet from the README."
  image: /assets/images/projects/foo.jpg   # thumbnail (optional)
  image_alt: "project thumbnail"
```

**Notes**

- Only include work you can verify. Descriptions must reflect the real repository — no invented metrics.
- Keep the reuse of category tags so the color per category stays consistent.
- Images go in `assets/images/projects/` and should be optimized for the web (see below).

### Image assets

Optimize any raster before committing (dark, gradient-heavy UIs read well as compressed JPEG/WebP). Resize to the widest expected dimension and compress, e.g. with Apple's built‑in tool:

```bash
sips -Z 1000 -s format jpeg -s formatOptions 80 input.png --out output.jpg
```

Favicons, profile photo, cartoon, and Open Graph image all live under `assets/images/`.

---

## Deployment

The site targets Azure Static Web Apps. After a local build, deploy the generated `_site/` output
(the `_site/` folder itself is git‑ignored, so it never lives in version control):

```bash
az staticwebapp deploy --name <app-name> --content-root _site
```

To spin the built site locally for a manual check without the Jekyll watcher:

```bash
ruby -run -e httpd _site -p 8000
```

---

## Current contents

- **Experience** (`_data/experience.yml`) — roles, dates, outcomes.
- **Skills** (`_data/skills.yml`) — grouped, colour‑coded per category.
- **Projects** (`_data/projects.yml`) — selected work with thumbnails.
- **Certifications** (`_data/certifications.yml`, `_data/certifications_other.yml`) — badges + links.
- **Social** (`_data/social.yml`) — contact / social links.

---

## Conventions

- Keep the Jekyll dependency minimal — add tools to `Gemfile`, not `Gemfile.lock`.
- Data is authored in `_data/`; presentation stays in `_includes/`, `_layouts/`, and `assets/css/main.css`.
- No invented claims — verify any project entry against the real repository.
