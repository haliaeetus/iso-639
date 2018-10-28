const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const json2csv = require('json2csv');
const stringify = require('json-stable-stringify');
const _ = require('lodash');
const scrapeUtil = require('scrape-util');

const OUTPUT_DIR = './data';
const FILE_PREFIX = 'iso_639-1';

const FORMATS = (data) => {
  const fields = [
    'family',
    'name',
    'nativeName',
    '639-1',
    '639-2',
    '639-2/B'
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

const logger = msg => data => {
  console.log(msg);
  return data;
};

const configs = [
  {
    id: 'wiki',
    url: 'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes',
    name: 'ISO 639-1 Wiki',
    library: '$',
    transforms: [
      'init',
      'absolutifyUrls'
    ],
    parsers: [
      {
        id: 'iso_639_1',
        name: 'ISO 639-1',
        type: 'table',
        options: {
          rowParser: function parseRow(data) {
            const terminological = data['639-2'];
            const bibliographic = data['639-2/B'];

            if (terminological === bibliographic) {
              // eslint-disable-next-line no-param-reassign
              delete data['639-2/B'];
            }

            const $link = data.name.find('a').first();
            data.name = data.name.text();
            data.wikiUrl = $link.attr('href');

            return data;
          },
          selector: $html => {
            return $html.find('#Table');
          },
          parsers: {
            name: $el => $el
          },
          parseIndices: {
            family: 1,
            name: 2,
            nativeName: 3,
            '639-1': 4,
            '639-2': 5,
            '639-2/B': 6
          },
          key: '639-1' // returns object keyed accordingly, else null or undefined for an array
        }
      }
    ]
  }
];


// eslint-disable-next-line camelcase
function generateISO_639_1() {
  return fs.ensureDirAsync(OUTPUT_DIR)
    .then(logger('Ensured output directory exists.'))
    .then(() => scrapeUtil.scrapePages(configs))
    .then(({ wiki }) => {
      return wiki.iso_639_1;
    })
    .then(scrapeUtil.renderFiles(FORMATS, FILE_PREFIX, OUTPUT_DIR))
    .then(logger('Rendered output files.'))
    .catch(err => console.error(err));
}

generateISO_639_1();
