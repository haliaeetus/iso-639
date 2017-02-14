# ISO 639
ISO 639 language codes with names in English, French & German, provided in JSON & CSV or as a NodeJS module.

See https://en.wikipedia.org/wiki/ISO_3166

## Table of Contents
1. [Overview](#overview)
  1. [Information](#information)
  1. [Data & Formats](#data--formats)
1. [Examples](#examples)
  1. [Node Module](#node-module)
  1. [JSON](#json)
  1. [CSV](#csv)
1. [Sources](#sources)

### Overview

Data can be found in [data/]

#### Information
This repository consists of all ~~six~~ four parts of the ISO 639 standard. Part 4 & 6 are not included because they are not relevant.

For a detailed description, see https://en.wikipedia.org/wiki/ISO_639

1. [**ISO 639-1** (Part 1): Alpha-2 codes (major languages)](#part1)
1. [**ISO 639-2** (Part 2): Alpha-3 codes (practically superceded by ISO 639-3)](#part2)
1. *(WIP)* **ISO 639-3** (Part 3): Alpha-3 codes
1. ~~**ISO 639-4** (Part 4): Implementation guidelines and general principles for language coding~~
1. *(WIP)* **ISO 639-5** (Part 5): Alpha-3 codes for language families and groups
1. ~~**ISO 639-6** (Part 6): *withdrawn*~~

#### Data & Formats
For every JSON file, there is a beautified version (`.json`) & a minified version (`.min.json`).

For convenience & readability, JSON files are ordered by key alphabetically (i.e. `chv` always precedes `chy`).

Unless explicitly stated, CSV files with the same name as a JSON file will contain the same data, with the following qualifications:
* Array values are joined into a string. For example, see names (en/fr/de) in [Part 2](#part2).
* Values which are marked optional for a JSON file will be treated as an empty string in the corresponding CSV file.

#### Part 1: Alpha-2 Codes for Major languages
<a name="part1"></a>

[./data/iso_639-1.json] is keyed by ISO 639-1 Alpha 2 code. Each value has:
* `639-2 (string)`: A mapping to the (terminological) ISO 639-2 code
* `639-2/B (string; optional)`: A mapping to the bibliographic ISO 639-2 code, where relevant.
* `name (string)`: The name(s) of the language, in English.
* `nativeName (string)`: The name(s) of the language, in the language itself.
* `wikiUrl (string)`: A link the the Wikipedia article on the language.

##### Example
```
{
  ...
  "bo": {
    "639-1": "bo",
    "639-2": "bod",
    "639-2/B": "tib",
    "family": "Sino-Tibetan",
    "name": "Tibetan Standard, Tibetan, Central",
    "nativeName": "བོད་ཡིག",
    "wikiUrl": "https://en.wikipedia.org/wiki/Standard_Tibetan"
  },
  ...
  "ru": {
    "639-1": "ru",
    "639-2": "rus",
    "family": "Indo-European",
    "name": "Russian",
    "nativeName": "Русский",
    "wikiUrl": "https://en.wikipedia.org/wiki/Russian_language"
  },
  ...
}
```

#### Part 2: Alpha-3 Codes for (more) Major languages
<a name="part2"></a>

[data/iso_639-2.json] is keyed by ISO 639-2 Alpha 3 code. Each value has:
* `639-1 (string; optional)`: A mapping to the ISO 639-1 code, if such exists.
* `639-2 (string)`: A mapping to the (terminological) ISO 639-2 code
* `639-2/B (string; optional)`: A mapping to the bibliographic ISO 639-2 code, where relevant.
* `en (Array<string>)`: The names of the language, in English.
* `fr (Array<string>)`: The names of the language, in French.
* `de (Array<string>)`: The names of the language, in German.
* `wikiUrl (string: optional)`: A link the the Wikipedia article on the language, unless the code is special (see below).

** Note: ** The following special codes are:
  * Included: mis, mul, und, zxx
  * Excluded: qaa-qtz (a range reserved for local use)
See [https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes]

##### Example
```
{
  ...
  "chu": {
    "639-1": "cu",
    "639-2": "chu",
    "de": [
      "Kirchenslawisch"
    ],
    "en": [
      "Church Slavic",
      "Old Slavonic",
      "Church Slavonic",
      "Old Bulgarian",
      "Old Church Slavonic"
    ],
    "fr": [
      "slavon d'église",
      "vieux slave",
      "slavon liturgique",
      "vieux bulgare"
    ],
    "wikiUrl": "https://en.wikipedia.org/wiki/Church_Slavic_language"
  },
  ...
}
```



### Examples
***TODO***

#### Node Module
```
npm install iso-639
```
*WIP*
***TODO***


### Sources

Data is sourced entirely from the following pages:
* Part 1:
  * https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
* Part 2:
  * https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
  * http://www.loc.gov/standards/iso639-2/php/code_list.php
* Part 3:
  * (WIP)
* Part 5:
  * (WIP)
