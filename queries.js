// PGPASSWORD=Shadow22! psql -h database-1.cn6u6gi62om8.us-east-2.rds.amazonaws.com -p 5432 -U postgres -d postgres // 

// Provide access to DB
const Pool = require("pg").Pool;

const fs = require('fs');

const pool = new Pool({
    user: "postgres",
    host: "database-1.cn6u6gi62om8.us-east-2.rds.amazonaws.com",
    database: "contacts",
    password: "Shadow22!",
    port: 5432,
    ssl: { 
      rejectUnauthorized: true,
      ca: fs.readFileSync('us-east-2-bundle.pem').toString()
    }
});

// PgPool spawning small DB sessions to serve app session requests
const getContacts = (request, response) => {
    pool.query("SELECT * FROM people", (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

// Function to handle Post Requests
const addContact = (req, res) => {
    console.log(req.body);
    // using a try - catch to ensure we're handling improper requests
      try {
        // declaring our useful information from the request body
        const { name, email_address, age } = req.body;
        // writing our PSQL request, the $#'s refer back to the line above $1 = name, $2 = emailAddress, $3 = age
        // `Returning *` means, after the insert, give us back the new info
        pool.query(
            `INSERT INTO people (name, email_address, age) VALUES ($1, $2, $3) RETURNING *;`,
            [name, email_address, age],
            // handle any errors, or return the results
            (error, results) => {
                if (error) {
                    console.log(error, '<--- error here')
                    throw error;
                }
                console.log(results, "<--- result!")
                res.status(200).json(results.rows)
            }
        );
      } catch (error) {
        throw error;
      }
    };

    //Function to Delete Contact
    const deleteContact = (request, response) => {
        const id = parseInt(request.params.id);
        pool.query(`DELETE FROM people WHERE id = ${id}`, (error, results) => {
          if (error) {
            throw error;
          }
          response.status(200).json(results.rows);
        });
      };

      // Function to handle PUT requests
      const getContact = (request, response) => {
        const { id } = request.body;
        console.log(id)
        pool.query("SELECT * FROM people WHERE id=$1", [id], (error, results) => {
          if (error) {
            throw error;
          }
          response.status(200).json(results.rows);
        });
      };

      // Function to handle PUT Update requests
      const updateContact = (req, res) => {
        let { name, email_address, age, id } = req.body;
        // Use a promise to request the existing data - we need a promise or else everything will happen in the wrong order
        let myPromise = new Promise(function(resolve, reject){
          pool.query("SELECT * FROM people WHERE id=$1", [id], (error, results) => {
            if (error) {
              throw error;
            } else if(res){
              // if an item doesn't have given data, set it with the existing data 
              name = name !== undefined ? name : results.rows.name;
              email_address = email_address !== undefined ? email_address : results.rows.email_address;
              age = age !== undefined ? age : results.rows.age;
              // We then resolve the promise
              resolve(results.rows)
              return results.rows
            } else {
              reject()
            }
          })
        });

      // `.then()` and update the data
        myPromise.then(() => {
          try {
            pool.query(
              `UPDATE people 
                  SET name=$1, email_address=$2, age=$3 
                  WHERE id = $4;`,
              [name, email_address, age, id],
              (error, results) => {
                if (error) {
                  console.log(error, '<--- error here')
                  throw error;
                }
                console.log(results, "<--- result!")
                res.status(200).json(results.rows)
              }
            );
          } catch (error) {
            throw error;
          }
        })
      };
      
      // Don't forget to export!
      module.exports = {
        getContacts,
        addContact,
        deleteContact,
        updateContact,
        getContact
      };
