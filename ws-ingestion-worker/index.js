const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:verysecure@localhost:5438/laevitas');

const cs = new pgp.helpers.ColumnSet([
    'instrument_name',
    {name: 'currency', def: 'BTC'},
    {name: 'maturity', init: c => c.source.instrument_name.split('-')[1]},
    {name: 'strike', init: c => c.source.instrument_name.split('-')[2]},
    {name: 'type', init: c => c.source.instrument_name.split('-')[3]},
    {name: 'createdat', def: new Date().toISOString()},
    'underlying_price',
    'timestamp',
    'settlement_price',
    'open_interest',
    'min_price',
    'max_price',
    'mark_price',
    'mark_iv',
    'last_price',
    'interest_rate',
    'index_price',
    'bid_iv',
    'best_bid_price',
    'best_bid_amount',
    'best_ask_price',
    'best_ask_amount',
    'ask_iv'
], {table: 'instrument'});

const consumer = async (event) => {
  const insert = pgp.helpers.insert(event.Records.map(record => JSON.parse(record.body)), cs);
  return db.none(insert)
    .catch(error => {
        // error
        throw error;
    });
};

module.exports = {
  consumer,
};
