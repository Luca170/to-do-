const express = require("express")
const mongoose = require("mongoose")
const mcache = require("memory-cache")
const session = require("express-session")
const app = express()

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret:"Your secret key",
    resave:true,
    saveUninitialized:true,
}))
const URI = "mongodb+srv://ciao:ciao@cluster0.ogg8o.mongodb.net/mydb?retryWrites=true&w=majority" ;
mongoose.connect(URI, {useNewUrlParser:true, useUnifiedTopology:true})


let cache = (duration) => {
    return (req, res, next) => {
      let key = '__express__' + req.originalUrl || req.url
      let cachedBody = mcache.get(key)
      if (cachedBody) {
        res.send(cachedBody)
        return
      } else {
        res.sendResponse = res.send
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body)
        }
        next()
      }
    }
  }
  let todoSchema = new mongoose.Schema({
      content:String
  })
  let ToDo = mongoose.model("ToDo", todoSchema)
  app.get("/",async (req,res) => {
      let todos = await ToDo.find({})
      res.render("home.ejs", {todos:todos})
  })
 app.post("/add", (req,res) => {
     let new_todo = new ToDo({
         content:req.body.content
     })
     new_todo.save((err,data) => {
         if(err) throw err
         res.redirect("/")
     })
 })
 app.post("/delete", (req,res) =>{
     ToDo.findOneAndRemove({content:req.body.content},(err,data) =>{
         if(err) throw err
         res.redirect("/")
     })
 })
 app.get("/edit",(req,res)=> {
     ToDo.findById(req.query.id, (err,data) =>{
        res.render("edit.ejs", {id:req.query.id, content:data.content})
     })
 })
 app.post("/edit/save", (req,res) =>{
     ToDo.findByIdAndUpdate(req.body.id,{content:req.body.content}, (err,data) => {
         if(err) throw err
         res.redirect("/")
     })
 })
  app.listen(8000)
