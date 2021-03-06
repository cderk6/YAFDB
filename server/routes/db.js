/* All things that have to do with the database will flow through this API */


var express = require('express')
var router = express.Router()
var mysql = require('mysql')
var crypto = require('crypto')
var config = require('../../config.json')
var cfg = config['connection-config'];

/* GET users listing. */
router.get('/users', function(req, res, next) {
	//res.send('respond with a resource')
	res.json([
		{
			id: 1,
			username: 'zgriesinger'
		}, {
			id: 2,
			username: 'kosinkadink'
		}])
})

router.get('/user/signup', function(req, res, next) {
	var user = {
		"username": req.query.username,
		"password": req.query.password,
		"first_name": req.query.fname,
		"last_name": req.query.lname
	}
	console.log(user)
	var connection = mysql.createConnection(cfg);	
	connection.connect((err) => {
		if(err)
			console.log(err)
	});
	connection.query('INSERT INTO user_account SET ?', user, function(error, results, fields) {
		if(error) {
			console.log("Error occured signing up, username already taken")
			res.send({
				"code": 400,
				"failed": "Username taken"
			})
		} else {
			res.send({
				"code": 200,
				"success": "Registered successfully"
			})
		}
	});
})

router.get('/user/login', function(req, res, next) {
	var email = req.query.username;
	var password = req.query.password;
	var connection = mysql.createConnection(cfg);
	connection.connect();
	connection.query('SELECT * FROM user_account where username = ?', [email], function(error, results, fields) {
		if(error) {
			res.send({
				"code": 400,
				"failed": "Error Occurred"
			})
		} else {
			if(results.length > 0) {
				console.log(results)
				if([0].password == password) {
					res.send({
						"code": 200,
						"success": "login successful"
					})
				} else {
					res.send({
						"code": 204,
						"failed": "Username and password do not match"
					})
				}
			} else {
				res.send({
					"code": 204,
					"failed": "Username does not exist"
				})
			}
		}
	})
})


router.get('/teams', function(req, res, next) {
	//res.send('respond with a resource')
	//We will use res.json(DATA_FROM_DB) to send data back
	var connection = mysql.createConnection(cfg);
	var SQL_QUERY = 'SELECT name, city, state, code, division, conference from team;'
	connection.connect();
	connection.query(SQL_QUERY, (error, results, fields) => {
		if(error) console.log(error)
		res.json(results);
	})

})
router.get('/players', function(req, res, next) {
	//res.send('respond with a resource')
	//We will use res.json(DATA_FROM_DB) to send data back
	var connection = mysql.createConnection(cfg);
	var SQL_QUERY = `SELECT first_name, last_name, position, number, name as Team_name from team
	INNER JOIN player ON team.id = player.team_ID
	ORDER BY Team_name, first_name;`
	connection.connect();
	connection.query(SQL_QUERY, (error, results, fields) => {
		if(error) console.log(error)
		res.json(results);
	})

})

router.get('/team/stats', function(req, res, next) {
	//res.send('respond with a resource')
	//We will use res.json(DATA_FROM_DB) to send data back
	var connection = mysql.createConnection(cfg);
	var SQL = `SELECT name, team_id, season_year, season_type, sum(passing_yards), sum(passing_attempts), sum(passing_completions)
	, sum(rushing_yards), sum(rushing_attempts), sum(rushing_touchdowns), sum(receiving_yards)
, sum(receiving_catches), sum(receiving_targets), sum(receiving_touchdowns), sum(tackles)
, sum(interceptions_thrown), sum(interceptions_caught), sum(fumbles), sum(fumbles_lost)
, sum(fumbles_recovered), sum(fumbles_forced), sum(defense_sacks), sum(kicking_fg_made)
, sum(kicking_fg_tried), sum(kicking_pat_made), sum(kicking_pat_tried), sum(punts)
, sum(punting_yds), sum(kick_return_yds), sum(kick_return_tds), sum(punt_return_yds)
	from player_game_stats 
	INNER JOIN (select distinct id, season_year, season_type from game) as ID_SEASON 
ON player_game_stats.game_id = ID_SEASON.id
INNER JOIN (select name, id from team WHERE name = ?) as SELECTED_TEAM
ON SELECTED_TEAM.id = team_id
GROUP BY season_year, FIELD(season_type, 'PRE', 'REG', 'POST'), name, team_id, season_type;`
	var inserts = [req.query.team_name];
	SQL = mysql.format(SQL, inserts);
	connection.connect();
	connection.query(SQL, (error, results, fields) => {
		if(error) console.log(error)
		res.json(results);
	})

})

router.get('/player/stats', function(req, res, next) {
	//res.send('respond with a resource')
	//We will use res.json(DATA_FROM_DB) to send data back
	var connection = mysql.createConnection(cfg);
	var SQL = ` SELECT first_name, last_name, team_id, season_year, sum(passing_yards), sum(passing_attempts), sum(passing_completions)
				, sum(rushing_yards), sum(rushing_attempts), sum(rushing_touchdowns), sum(receiving_yards)
				, sum(receiving_catches), sum(receiving_targets), sum(receiving_touchdowns), sum(tackles)
				, sum(interceptions_thrown), sum(interceptions_caught), sum(fumbles), sum(fumbles_lost)
				, sum(fumbles_recovered), sum(fumbles_forced), sum(defense_sacks), sum(kicking_fg_made)
				, sum(kicking_fg_tried), sum(kicking_pat_made), sum(kicking_pat_tried), sum(punts)
				, sum(punting_yds), sum(kick_return_yds), sum(kick_return_tds), sum(punt_return_yds)
				from player_game_stats 
				INNER JOIN (select distinct id, season_year from game) as ID_SEASON 
				ON player_game_stats.game_id = ID_SEASON.id
				INNER JOIN (select first_name, last_name, id from player 
				WHERE first_name = ? AND last_name = ?) as SELECTED_PLAYER
				ON SELECTED_PLAYER.id = player_id
				GROUP BY season_year, last_name, team_id;`
	var inserts = [req.query.first_name, req.query.last_name];
	SQL = mysql.format(SQL, inserts);
	//console.log(SQL)
	connection.connect();
	connection.query(SQL, (error, results, fields) => {
		if(error) console.log(error)
		res.json(results);
	})

})

router.get('/team/players', function(req, res, next) {
	//res.send('respond with a resource')
	//We will use res.json(DATA_FROM_DB) to send data back
	var connection = mysql.createConnection(cfg);
	var SQL = `SELECT first_name, last_name, position, number, name as Team_name from team
	INNER JOIN player ON team.id = player.team_ID
	where team.name = ?
	ORDER BY first_name;`
	var inserts = [req.query.team_name];
	SQL = mysql.format(SQL, inserts);
	connection.connect();
	connection.query(SQL, (error, results, fields) => {
		if(error) console.log(error);
		res.json(results);
	})

})

router.post('/inputexample', function(req, res, next) {
	var connection = mysql.createConnection(cfg);
	var SQL_QUERY = 'SQL_QUERY' + mysql.escape(req.query.inputvar);
	var sql = "select * from ?? where ?? = ?";
	var inserts = ['users', 'id', 'user_id_input'];
	sql = mysql.format(sql, inserts)
	connection.connect();
	connection.query(SQL_QUery, (error, results, fields) => {
		res.json(results)
	})
})

module.exports = router
