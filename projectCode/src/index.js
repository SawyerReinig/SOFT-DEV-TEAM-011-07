// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const { application } = require('express');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
        secret: "secretpwd",
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render("pages/login");
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

// Register
app.post('/register', async(req, res) => {
    // deconstruct parameters
    const { username, password, Ikon: ikon, Epic: epic, Indy: indy, MC: mc } = req.body;
    console.log(username, password);
    if (req.body.username === '' || req.body.password === '' || !req.body.username || !req.body.password) {
        console.log('Missing Username or Password')
        res.redirect('/register');
    } else {
        //hash the password using bcrypt library
        const hash = await bcrypt.hash(password, 10);

        // To-DO: Insert username and hashed password into 'users' table
        if (hash.err) {
            console.log('Failed to add User to database!');
            res.redirect("/register");
        } else {
            let subq = "";
            let values = [`'${username}'`, `'${hash}'`]
            if (ikon) {
                subq += ", ikon";
                values.push(true);
            }
            if (epic) {
                subq += ", epic";
                values.push(true);
            }
            if (indy) {
                subq += ", indy";
                values.push(true);
            }
            if (mc) {
                subq += ", mountain_collective";
                values.push(true);
            }
            subq += ", proficiency";
            values.push(`'${req.body.skill}'`);
            const query = `INSERT INTO users (username, password${subq}) VALUES (${values});`;
            console.log(query);
            try {
                await db.none(query);
                res.redirect("/login");
            } catch (error) {
                console.log(error);
                res.redirect('/register');
            }

        }

    }



});

app.post('/login', async function(req, res) {
    // check if password from request matches with password in DB 
    const query = "SELECT password FROM users WHERE username = $1 LIMIT 1;"
    const user = await db.one(query, [req.body.username]).catch(err => {
        console.log(err);
        res.redirect("/login");
    });
    if (!user) {
        return;
    }
    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
        //save user details in session like in lab 8
        const full_user_query = "SELECT * FROM users WHERE username =$1"
        const full_user = await db.many(full_user_query, [req.body.username]).catch(err => {
          console.log(err);
          res.redirect("/register")
        })
        req.session.user = full_user;
        req.session.save();
        res.redirect('/discover');
    } else {
        res.redirect('/login')
    }

});

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to login page.
        return res.redirect('/login');
    }
    next();
};

// Authentication Required
app.use(auth);

app.use('/resources/', express.static('./resources'));

app.get('/discover', (req, res) => {
  console.log(req.session.user)
  const PassLocationInfo = {
    ikon: req.session.user[0].ikon,
    ikonName: 'IKON',
    ikonUrl: 'https://www.ikonpass.com/en/shop-passes',
    epic: req.session.user[0].epic,
    epicName: 'EPIC',
    epicUrl: 'https://www.epicpass.com/',
    indy: req.session.user[0].indy,
    indyName: 'Indy',
    indyUrl: 'https://www.indyskipass.com/pricing',
    mountain_collective: req.session.user[0].mountain_collective,
    mountainCollectiveName: 'Mountain Collective',
    mountainCollectiveUrl: 'https://mountaincollective.com/',
    username: req.session.user[0].username,
    proficiency: req.session.user[0].proficiency
  };
  res.render('pages/discover',{PassLocationInfo})
});

app.post('/updateProficiency', async function(req,res){
  const update = `UPDATE users SET proficiency = '${req.body.proficiency}' WHERE id = ${req.session.user[0].id} RETURNING *;`
  const result = await db.one(update).then((user)=>{
    req.session.user[0] = user;
    res.redirect("/discover");
  }).catch(err => {
    console.log(err);
    res.redirect("/discover");
  });
  
});

app.post('/updatePass', async function(req,res){
  const update = `UPDATE users SET ${req.body.pass} = ${req.body.passBool} WHERE id = ${req.session.user[0].id} RETURNING *;`
  const result = await db.one(update).then((user)=>{
    req.session.user[0] = user;
    res.redirect("/discover");
  }).catch(err => {
    console.log(err);
    res.redirect("/discover");
  });
  
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login')
        }
    });
});

// dummy api to test part 8 in lab 11
app.get('/welcome', (req, res) => {
    res.json({ status: 'success', message: 'Welcome!' });
});



app.get('/calendar', async (req, res) => {
  try {
    const randomUser = await db.one("SELECT * FROM users WHERE id != $1 ORDER BY RANDOM() LIMIT 1", [req.session.user[0].id]);
    const commonPasses = [];
    if (req.session.user[0].ikon && randomUser.ikon) {
      commonPasses.push('Ikon');
    }
    if (req.session.user[0].epic && randomUser.epic) {
      commonPasses.push('Epic');
    }
    if (req.session.user[0].indy && randomUser.indy) {
      commonPasses.push('Indy');
    }
    if (req.session.user[0].mountain_collective && randomUser.mountain_collective) {
      commonPasses.push('Mountain Collective');
    }
    
    res.render('pages/calendar', { randomUser, commonPasses });
  } catch (error) {
    console.error(error);
    res.render('pages/login');
  }
});




// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests

// in lab 11, wanting us to replace for node.js easier to debug
module.exports = app.listen(3000);
// app.listen(3000);
console.log('Server is listening on port 3000');