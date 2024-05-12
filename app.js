const express = require('express')
const path = require('path')

const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')

let db = null
const initializedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running')
    })
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}
initializedb()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

//api1

app.get('/movies/', async (rq, rp) => {
  const qu = `select movie_name from movie`
  const movieN = await db.all(qu)
  rp.send(movieN.map(a => convertDbObjectToResponseObject(a)))
})

//api2

app.post('/movies/', async (rq, rp) => {
  const np = rq.body
  const {directorId, movieName, leadActor} = np
  const qu = `insert into movie (director_id,movie_name,lead_actor) values (
         ${directorId},
        ' ${movieName}',
         '${leadActor}'
      );`
  const dbResponse = await db.run(qu)
  const pid = dbResponse.lastID
  rp.send('Movie Successfully Added')
})

//api3
app.get('/movies/:movieId/', async (rq, rp) => {
  const {movieId} = rq.params
  const getbymovieid = `
     select *
     from movie
     where movie_id= ${movieId}
  ;`
  const dbrp = await db.get(getbymovieid)
  rp.send(convertDbObjectToResponseObject(dbrp))
})

//api4

app.put('/movies/:movieId/', async (rq, rp) => {
  const np = rq.body
  const {movieId} = rq.params
  const {directorId, movieName, leadActor} = np
  const qu = `update movie set director_id= ${directorId},movie_name= '${movieName}',lead_actor='${leadActor}' where movie_id= ${movieId};`
  const dbrp = await db.run(qu)
  rp.send('Movie Details Updated')
})

//api5
app.delete('/movies/:movieId/', async (rq, rp) => {
  const {movieId} = rq.params
  const deleteid = `delete from movie where movie_id= ${movieId};`
  const rmp = await db.run(deleteid)
  rp.send('Movie Removed')
})

//api6

app.get('/directors/', async (rq, rp) => {
  const qu = `select * from director`
  const pp = await db.all(qu)
  rp.send(pp.map(a => convertDbObjectToResponseObject(a)))
})

//api7

app.get('/directors/:directorId/movies/', async (rq, rp) => {
  const {directorId} = rq.params
  const qu = `select movie_name from movie where director_id= ${directorId};`
  const mname = await db.all(qu)
  rp.send(mname.map(a => convertDbObjectToResponseObject(a)))
})

module.exports = app
