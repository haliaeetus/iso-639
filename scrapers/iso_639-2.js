const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const json2csv = require('json2csv');
const stringify = require('json-stable-stringify');
const _ = require('lodash');
const scrapeUtil = require('scrape-util');

const OUTPUT_DIR = './data';
const FILE_PREFIX = 'iso_639-2';

const FORMATS = (data) => {
  const fields = [
    '639-2',
    '639-2/B',
    '639-1',
    'en',
    'fr',
    'de'
  ];
  return [
    { ext: '.json', data, serializer: d => stringify(d, { space: 2 }) },
    { ext: '.min.json', data, serializer: stringify },
    { ext: '.csv',
      data: { data: _.values(data).map(entry => {
        return _.mapValues(entry, value => {
          if (_.isArray(value)) {
            return value.join('; ');
          }
          return value;
        });
      }),
        fields
      },
      serializer: json2csv },
  ];
};

function parseTable({ selector, parseIndices, parsers, rowParser, key }) {
  return ($html) => {
    const $table = selector($html);
    const entries = scrapeUtil
      .parseTable($table, parseIndices, parsers).map(rowParser);
    return key ? _.keyBy(entries, key) : entries;
  };
}

const logger = msg => data => {
  console.log(msg);
  return data;
};

const parserFns = {
  table: parseTable
};

const configs = [
  {
    id: 'wiki',
    url: 'https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes',
    name: 'ISO 639-2 Wiki',
    libraryId: '$',
    transforms: [
      'init',
      'absolutifyUrls'
    ],
    parsers: [
      {
        id: 'iso_639_2',
        name: 'ISO 639-2',
        type: 'table',
        options: {
          rowParser: function parseRow(data) {
            const codesTwo = data['639-2/TB'].split('/').map(c => c.trim());
            const terminological = codesTwo.filter(c => c.indexOf('*') === -1);
            const bibliographic = codesTwo.filter(c => c.indexOf('*') !== -1).map(c => c.replace('*', ''));
            if (terminological.length !== 1) {
              throw new Error(`${data['639-2/TB']} does not have exactly one valid 639-2/T code`);
            }

            delete data['639-2/TB'];
            data['639-2'] = terminological[0];

            if (bibliographic.length) {
              data['639-2/B'] = bibliographic[0];
            }

            const $link = data.name.find('a').first();
            data.name = data.name.text();
            data.wikiUrl = $link.attr('href');

            return data;
          },
          selector: $html => {
            return $html.find('#toc').nextRelative('table');
          },
          parsers: {
            name: $el => $el
          },
          parseIndices: {
            '639-2/TB': 0,
            '639-3': 1,
            '639-1': 2,
            name: 3,
            scope: 4,
            type: 5,
          },
          key: '639-2' // returns object keyed accordingly, else null or undefined for an array
        }
      }
    ]
  },
  {
    id: 'loc',
    url: 'http://www.loc.gov/standards/iso639-2/php/code_list.php',
    encoding: 'ISO-8859-1',
    name: 'ISO 639-2 LoC',
    libraryId: '$',
    parsers: [
      {
        id: 'iso_639_2',
        name: 'ISO 639-2',
        type: 'table',
        postParse: data => {
          data.zgh.de = ['Standard-marokkanischen Tamazight'];
          return data;
        },
        options: {
          rowParser: (() => {
            const spaceRegex = / /g;
            const bibliographicRegex = /([a-z]{3})\(B\)([a-z]{3})\(T\)/;
            const languageRegex = /; */;
            const languages = 'en fr de'.split(' ');
            return function parseRow(data) {
              /* eslint-disable no-param-reassign */
              const codesTwo = data['639-2'].replace(spaceRegex, '');
              delete data['639-2'];

              const match = codesTwo.match(bibliographicRegex);
              const terminological = match ? match[2] : codesTwo;
              const bibliographical = match && match[1];

              data['639-2'] = terminological;
              if (bibliographical) {
                data['639-2/B'] = bibliographical;
              }

              data['639-1'] = data['639-1'] || undefined;

              // process languages
              languages.forEach(language => {
                data[language] = data[language].split(languageRegex);
              });

              return data;
              /* eslint-enable no-param-reassign */
            };
          })(),
          selector: $elem => {
            return $elem.find('table').first();
          },
          parseIndices: {
            '639-2': 0,
            '639-1': 1,
            en: 2,
            fr: 3,
            de: 4
          },
          key: '639-2' // returns object keyed accordingly, else null or undefined for an array
        }
      }
    ]
  }
];

// eslint-disable-next-line camelcase
function generateISO_639_2() {
  return fs.ensureDirAsync(OUTPUT_DIR)
    .then(logger('Ensured output directory exists.'))
    .then(() => scrapeUtil.scrapePages(configs))
    .then(({ wiki, loc }) => {
      return _.mapValues(loc.iso_639_2, (value, key) => {
        const wikiValue = wiki.iso_639_2[key];

        value.wikiUrl = wikiValue.wikiUrl;

        return value;
      });
    })
    .then(scrapeUtil.renderFiles(FORMATS, FILE_PREFIX, OUTPUT_DIR))
    .then(logger('Rendered output files.'))
    .catch(err => console.error(err));
}

generateISO_639_2();
