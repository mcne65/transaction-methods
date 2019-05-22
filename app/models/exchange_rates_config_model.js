var db = require('../util/mysql_connection');

async function rates_source_currency(from_currency){

  const [rows,fields] = await db.connection.query("SELECT SUBSTRING_INDEX(from_to, '_', 1) as 'from', SUBSTRING_INDEX(from_to, '_', -1) as 'to',  source FROM exchange_rates_config WHERE from_to like ?",[from_currency+'_%']);
  return rows;
}


async function rates_target_currency(to_currency){

  const [rows,fields] = await db.connection.query("SELECT SUBSTRING_INDEX(from_to, '_', 1) as 'from', SUBSTRING_INDEX(from_to, '_', -1) as 'to', source  FROM exchange_rates_config WHERE from_to like ? ",['%_' + to_currency]);
  return rows;
}

async function rates(to_currency){

  const [rows,fields] = await db.connection.query("SELECT SUBSTRING_INDEX(from_to, '_', 1) as 'from', SUBSTRING_INDEX(from_to, '_', -1) as 'to', source  FROM exchange_rates_config WHERE from_to like ? ",['%_' + to_currency]);
  return rows;
}

async function get_rates_currency_pair(from_currency, to_currency){

  let pairA = from_currency+'_'+to_currency;


  const [rows,fields] = await db.connection.query("SELECT SUBSTRING_INDEX(from_to, '_', 1) as 'from', SUBSTRING_INDEX(from_to, '_', -1) as 'to', source, weight  FROM exchange_rates_config WHERE from_to = ? ",[pairA]);

  // let pairB = to_currency+'_'+from_currency;
  //
  // const [rows,fields] = await db.connection.query("SELECT SUBSTRING_INDEX(from_to, '_', 1) as 'from', SUBSTRING_INDEX(from_to, '_', -1) as 'to', source, weight  FROM exchange_rates_config WHERE from_to = ? or from_to = ? ",[pairA, pairB]);

  let rates_signal = []
  let total_weight = 0;

  if (rows.length == 0)
    throw new Error("Not all intermediate rates are available");
  for(let i=0; i<rows.length; i++){

    let rate = rows[i];
    rates_signal.push({
      from: rate.from,
      to: rate.to,
      source: rate.source,
      weight: rate.weight,

    });

    total_weight += rate.weight;



  }


  //normalize the weights
  var normalized_rate_signals = rates_signal.map( function(rate) {

    rate.weight = rate.weight/total_weight;
    return rate;

  });
  console.log(normalized_rate_signals);

  //how would you generate the rate
  return normalized_rate_signals;
}

async function get_currency_pair_info(from_currency, to_currency){

  let pairA = from_currency+'_'+to_currency;
  let pairB = to_currency+'_'+from_currency;
  const [rows,fields] = await db.connection.query("SELECT SUBSTRING_INDEX(currency_pair, '_', 1) as 'from', SUBSTRING_INDEX(currency_pair, '_', -1) as 'to',  spread, path FROM currency_pair WHERE currency_pair = ? or currency_pair = ? ",[pairA, pairB]);

  // let spread = rows[0].from == from_currency? 1 / ( 1 + rows[0].spread ) : ( 1 + rows[0].spread );
  return rows[0];
}





module.exports = {
  rates_source_currency,
  rates_target_currency,
  get_rates_currency_pair,
  get_currency_pair_info
};
