'use strict'

const path = require('path')
const fs = require('fs')
const SQL = require('sql.js')
const view = require(path.join(__dirname, 'view.js'))

/*
Knex init DB
must run 
npm install sqlite3 --save
*/
const knex = require("knex")({
	client: "sqlite3",
	connection: {
		filename: path.join(__dirname, 'example.db')
	}
});


/**
 * Knex getPeople
 * Populates the People List. Send it to the view
 * @param {} object 
 */
module.exports.getPeople = function () {
  let result = knex.select().from("people")
  result.then(function(rows){
    view.showPeople(rows)
  })
}


/**
 * Knex getPerson
 *   Fetch a person's data from the database.
 * @param {} object 
 */
/*
  Populates the People List. Send it to the view
*/
module.exports.getPerson = async function (pid) {
  console.log("modulejs.getPerson " + pid)
  let result = await knex.select().from("people").where("person_id", pid)
  return result
  
}

/*
  Delete a person's data from the database.
*/
module.exports.deletePerson = function (pid, callback) {
  
  let result = knex.from("people").where("person_id", pid).delete()
  result.then(
    //fullfiled
    ()=>{
      if (typeof callback === 'function') {
        callback()
      }
    },
    //rejected
    error => {
      console.log('model.deletePerson', error.message)
    })
}


/*
  Insert or update a person's data in the database.
*/
module.exports.saveFormData = function (tableName, keyValue, callback) {
  if (keyValue.columns.length > 0) {
      let newRow = {}
      for (let i=0; i<keyValue.columns.length;i++) {
          newRow[keyValue.columns[i]] = keyValue.values[i]
      }
      let result = knex(tableName).insert(newRow).onConflict("person_id").merge()
      result.then(
        function(){
          $('#' + keyValue.columns.join(', #'))
            .addClass('form-control-success')
            .animate({class: 'form-control-success'}, 1500, function () {
              if (typeof callback === 'function') {
                callback()
              }
            })
        },
        //not fullfiled
        function(){console.log('model.saveFormData', 'Query failed for', keyValue.values)}
      )
      
  }
}
