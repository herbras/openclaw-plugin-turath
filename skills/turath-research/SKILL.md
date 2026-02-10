---
name: turath-research
description: This skill provides specialized tools for searching and retrieving Islamic classical texts from the Turath.io API and local metadata database. Use this skill when researching Islamic literature, finding book references, extracting page content, or creating content based on classical Islamic texts.
---

# Turath Research Skill

This skill provides direct access to the Turath.io library (100,000+ Islamic classical texts) and local metadata database for deep research into Islamic literature.

## When to Use

This skill should be used when:
- Searching for specific Arabic terms across Islamic classical texts
- Retrieving book details, author biographies, or page content
- Finding category or author IDs for filtered searches
- Creating content based on classical Islamic texts (articles, videos, social media)
- Building research workflows for Islamic studies

## Available Tools

### 1. `turath_search`

Search the library for Arabic queries. Returns results enriched with local metadata.

**Parameters:**
- `query` (string, required): Arabic search query
- `precision` (number): 0=broad (default), 3=exact match
- `category` (number): Category ID to filter results
- `author` (number): Author ID to filter results
- `page` (number): Result page number for pagination
- `sort_field` (string): "page_id", "death", or "default"

**Example prompt:** "Search for صحيح البخاري in the Turath library"

### 2. `turath_get_book`

Get detailed information about a specific book.

**Parameters:**
- `book_id` (number, required): The book ID
- `include` (string): Optional - "indexes" for table of contents

**Example prompt:** "Get details for book 9942 from Turath"

### 3. `turath_get_page`

Get the text content of a specific page.

**Parameters:**
- `book_id` (number, required): The book ID
- `page_number` (number, required): Page number

**Example prompt:** "Show me page 5 of book 9942"

### 4. `turath_get_author`

Get author biography and death dates.

**Parameters:**
- `author_id` (number, required): The author ID

**Example prompt:** "Get the biography of author 123"

### 5. `turath_filter_ids`

Find category/author IDs by Arabic name for filtering searches.

**Parameters:**
- `category_name` (string): Arabic category name to search
- `author_name` (string): Arabic author name to search

**Example prompt:** "Find the category ID for فقه"

### 6. `turath_list_categories`

List all ~40 available categories. No parameters needed.

**Example prompt:** "List all available categories in Turath"

### 7. `turath_list_authors`

List all ~3,100 available authors with death dates. No parameters needed.

**Example prompt:** "List all available authors in Turath"

## Workflow Examples

### Research Workflow

1. Find category ID: "Find the category ID for الفقه الشافعي"
2. Search with filter: "Search for الصلاة in category [ID from step 1]"
3. Get book details: "Get details for book [ID from search results]"
4. Extract page content: "Show me page 1 of book [book ID]"

### Content Creation Workflow

1. Get book structure: "Get the table of contents for book 9942"
2. Extract content: "Show me pages 1-10 of book 9942"
3. Process content for articles, videos, or social media posts

## Local Database

The plugin uses a local SQLite database (`data/turath_metadata.db`) containing:
- ~40 categories
- ~3,100 authors
- Book metadata with PDF links

This enables offline metadata access and enriches API results with additional information like Shamela links, category names, and PDF download links.
