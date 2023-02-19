CREATE TABLE IF NOT EXISTS instrument (
    instrument_name varchar(250),
    currency varchar(250),
    maturity varchar(250),
    strike varchar(250),
    type varchar(10),
    created_at TIMESTAMP,
    underlying_price double precision,
    timestamp BIGINT,
    settlement_price double precision,
    open_interest INT,
    min_price double precision,
    max_price double precision,
    mark_price double precision,
    mark_iv double precision,
    last_price double precision,
    interest_rate double precision,
    index_price double precision,
    bid_iv double precision,
    best_bid_price double precision,
    best_bid_amount double precision,
    best_ask_price double precision,
    best_ask_amount double precision,
    ask_iv double precision
);