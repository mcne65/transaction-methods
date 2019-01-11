var db = require('../util/mysql_connection')
const { build_insert_transaction } = require('../models').transaction_model
const {build_update_user_balance, get_user_by_username} = require('../models').user_model
/**
 * API for the deposit transaction
 * @param  {string} username     Username of the user doing the transaction
 * @param  {float} amount    Amount to be deposited
 * @return {JSON}         Returns success
 */
 module.exports = async function deposit_api(req, res) {

   let username = req.body.username
   let amount = req.body.amount
   let datetime = new Date().toMysqlFormat()

   try{
     isSuccesful = await deposit(username,amount,datetime);
     console.log("isSuccesful",isSuccesful);
     if (!isSuccesful){ throw Error ('unable to deposit amount');}
     res.send({ code: "Deposit successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Deposit failed', err});
   }



 };


 async function deposit(username,amount,datetime){


   try{

    let queries_with_val = []

    console.log("deposit transaction  ",username," ",amount," ",datetime);

    let debit_query_with_vals = build_insert_transaction('clam_mine', amount, 'admin', datetime, 'deposit', 'deposit');
    let credit_query_with_vals = build_insert_transaction(username, amount*-1, 'admin', datetime, 'deposit', 'deposit');

    queries_with_val.push(debit_query_with_vals);
    queries_with_val.push(credit_query_with_vals);

     let results = await db.connection.begin_transaction(queries_with_val);

     console.log("got results",results[0]);
     let rows_affected = 0;
     for(let i=0; i < results.length; i++){
       console.log("results[i]",results[i][0].affectedRows);
       rows_affected+= results[i][0].affectedRows;
     }

     console.log("rows affected",rows_affected);
     let previous_balance = await get_user_by_username(username)
     console.log("previous balance", previous_balance)
     let new_amount = previous_balance.clam_balance + amount
     console.log("new amount", new_amount)
     let update_query =  build_update_user_balance(username, new_amount)
     let current_balance = await db.connection.query(update_query.query, update_query.queryValues)
     console.log("update query",update_query)
     console.log("curr balance", current_balance)
     return rows_affected == queries_with_val.length;
   }
   catch(err){
     console.log("got err",err);
     return false;
   }



 }